import test from "node:test";
import assert from "node:assert/strict";

import {
  attachmoatazalaiMetaHeaders,
  buildmoatazalaiResponseMetaHeaders,
  buildmoatazalaiSseMetadataComment,
  formatmoatazalaiCost,
  getmoatazalaiTokenCounts,
} from "../../src/domain/moatazalaiResponseMeta.ts";
import { APP_CONFIG } from "../../src/shared/constants/appConfig.ts";
import { MOATAZALAI_RESPONSE_HEADERS } from "../../src/shared/constants/headers.ts";

test("getmoatazalaiTokenCounts normalizes common usage shapes", () => {
  assert.deepEqual(
    getmoatazalaiTokenCounts({
      prompt_tokens: 12,
      completion_tokens: 5,
    }),
    { input: 12, output: 5 }
  );
  assert.deepEqual(
    getmoatazalaiTokenCounts({
      input_tokens: "9",
      output_tokens: "4",
    }),
    { input: 9, output: 4 }
  );
});

test("buildmoatazalaiResponseMetaHeaders formats provider alias, tokens, latency, and cost", () => {
  const headers = buildmoatazalaiResponseMetaHeaders({
    provider: "claude",
    model: "claude-sonnet-4-6",
    cacheHit: true,
    latencyMs: 1234.6,
    usage: {
      prompt_tokens: 11,
      completion_tokens: 7,
    },
    costUsd: 0.00123456789,
  });

  assert.equal(headers["X-moatazalai-Provider"], "cc");
  assert.equal(headers["X-moatazalai-Model"], "claude-sonnet-4-6");
  assert.equal(headers["X-moatazalai-Cache-Hit"], "true");
  assert.equal(headers["X-moatazalai-Latency-Ms"], "1235");
  assert.equal(headers["X-moatazalai-Tokens-In"], "11");
  assert.equal(headers["X-moatazalai-Tokens-Out"], "7");
  assert.equal(headers["X-moatazalai-Response-Cost"], "0.0012345679");
});

test("buildmoatazalaiResponseMetaHeaders keeps ASCII model header values unchanged", () => {
  const headers = buildmoatazalaiResponseMetaHeaders({
    provider: "openai",
    model: "gpt-4o-mini",
  });

  assert.equal(headers[MOATAZALAI_RESPONSE_HEADERS.model], "gpt-4o-mini");
});

test("buildmoatazalaiResponseMetaHeaders percent-encodes non-ASCII model header values", () => {
  const model = "free-mix/[假流式]gemini-3.5-flash";
  const headers = buildmoatazalaiResponseMetaHeaders({
    provider: "openai",
    model,
  });

  assert.equal(headers[MOATAZALAI_RESPONSE_HEADERS.model], encodeURIComponent(model));
  assert.doesNotThrow(() => new Headers(headers));
});

test("buildmoatazalaiResponseMetaHeaders strips control characters from string header values", () => {
  const headers = buildmoatazalaiResponseMetaHeaders({
    provider: "openai",
    model: "free\r\nX-Injected: yes\u0000-model",
    requestId: "req-1\nreq-2\rreq-3\u0007",
  });

  assert.doesNotMatch(headers[MOATAZALAI_RESPONSE_HEADERS.model], /[\r\n\u0000-\u001f\u007f]/);
  assert.doesNotMatch(headers[MOATAZALAI_RESPONSE_HEADERS.requestId], /[\r\n\u0000-\u001f\u007f]/);
  assert.equal(headers[MOATAZALAI_RESPONSE_HEADERS.model], "freeX-Injected: yes-model");
  assert.equal(headers[MOATAZALAI_RESPONSE_HEADERS.requestId], "req-1req-2req-3");
  assert.doesNotThrow(() => new Headers(headers));
});

test("buildmoatazalaiResponseMetaHeaders always emits X-moatazalai-Version", () => {
  const headers = buildmoatazalaiResponseMetaHeaders({ provider: "openai", model: "gpt" });
  assert.equal(headers[MOATAZALAI_RESPONSE_HEADERS.version], APP_CONFIG.version);

  // Even with no provider/model at all, the version is still attached.
  const bare = buildmoatazalaiResponseMetaHeaders({});
  assert.equal(bare[MOATAZALAI_RESPONSE_HEADERS.version], APP_CONFIG.version);
});

test("buildmoatazalaiResponseMetaHeaders emits X-moatazalai-Request-Id only when provided", () => {
  const withId = buildmoatazalaiResponseMetaHeaders({ model: "gpt", requestId: "req-123" });
  assert.equal(withId[MOATAZALAI_RESPONSE_HEADERS.requestId], "req-123");

  const noId = buildmoatazalaiResponseMetaHeaders({ model: "gpt" });
  assert.equal(noId[MOATAZALAI_RESPONSE_HEADERS.requestId], undefined);

  const nullId = buildmoatazalaiResponseMetaHeaders({ model: "gpt", requestId: null });
  assert.equal(nullId[MOATAZALAI_RESPONSE_HEADERS.requestId], undefined);

  const blankId = buildmoatazalaiResponseMetaHeaders({ model: "gpt", requestId: "   " });
  assert.equal(blankId[MOATAZALAI_RESPONSE_HEADERS.requestId], undefined);
});

test("attachmoatazalaiMetaHeaders mutates a Headers instance in place, preserving existing entries", () => {
  const headers = new Headers({ "Content-Type": "application/json" });
  attachmoatazalaiMetaHeaders(headers, {
    provider: "openai",
    model: "gpt",
    requestId: "req-abc",
  });

  assert.equal(headers.get("Content-Type"), "application/json");
  assert.equal(headers.get(MOATAZALAI_RESPONSE_HEADERS.version), APP_CONFIG.version);
  assert.equal(headers.get(MOATAZALAI_RESPONSE_HEADERS.requestId), "req-abc");
  assert.equal(headers.get(MOATAZALAI_RESPONSE_HEADERS.model), "gpt");
});

test("attachmoatazalaiMetaHeaders mutates a plain record in place, preserving existing entries", () => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  attachmoatazalaiMetaHeaders(headers, {
    provider: "openai",
    model: "gpt",
  });

  assert.equal(headers["Content-Type"], "application/json");
  assert.equal(headers[MOATAZALAI_RESPONSE_HEADERS.version], APP_CONFIG.version);
  assert.equal(headers[MOATAZALAI_RESPONSE_HEADERS.model], "gpt");
  // No requestId provided → header omitted.
  assert.equal(headers[MOATAZALAI_RESPONSE_HEADERS.requestId], undefined);
});

test("buildmoatazalaiSseMetadataComment emits comment lines compatible with SSE", () => {
  const comment = buildmoatazalaiSseMetadataComment({
    provider: "openai",
    model: "gpt-4o-mini",
    usage: {
      prompt_tokens: 4,
      completion_tokens: 2,
    },
    latencyMs: 50,
    costUsd: formatmoatazalaiCost(0),
  });

  assert.match(comment, /^: x-moatazalai-cache-hit=false/m);
  assert.match(comment, /^: x-moatazalai-provider=openai/m);
  assert.match(comment, /^: x-moatazalai-model=gpt-4o-mini/m);
  assert.match(comment, /^: x-moatazalai-tokens-in=4/m);
  assert.match(comment, /^: x-moatazalai-tokens-out=2/m);
  assert.match(comment, /^: x-moatazalai-response-cost=0\.0000000000/m);
});

test("buildmoatazalaiResponseMetaHeaders emits X-moatazalai-Cost-Saved only when costSavedUsd is provided", () => {
  // Cache HIT: the incremental cost of serving the hit is 0, but the cache saved the
  // original (would-have-been) cost — surfaced via the Cost-Saved header for analytics.
  const hit = buildmoatazalaiResponseMetaHeaders({
    provider: "openai",
    model: "gpt-4o",
    cacheHit: true,
    costUsd: 0,
    costSavedUsd: 0.0125,
  });
  assert.equal(hit[MOATAZALAI_RESPONSE_HEADERS.responseCost], "0.0000000000");
  assert.equal(hit[MOATAZALAI_RESPONSE_HEADERS.costSaved], "0.0125000000");

  // A normal response (no costSavedUsd) omits the Cost-Saved header entirely.
  const miss = buildmoatazalaiResponseMetaHeaders({
    provider: "openai",
    model: "gpt-4o",
    costUsd: 0.0125,
  });
  assert.equal(miss[MOATAZALAI_RESPONSE_HEADERS.costSaved], undefined);

  // A free-model HIT still emits Cost-Saved (= 0) — it explicitly passed costSavedUsd.
  const freeHit = buildmoatazalaiResponseMetaHeaders({
    cacheHit: true,
    costUsd: 0,
    costSavedUsd: 0,
  });
  assert.equal(freeHit[MOATAZALAI_RESPONSE_HEADERS.costSaved], "0.0000000000");
});

test("attachmoatazalaiMetaHeaders forwards costSavedUsd onto a Headers bag", () => {
  const headers = new Headers({ "Content-Type": "application/json" });
  attachmoatazalaiMetaHeaders(headers, {
    provider: "openai",
    model: "gpt-4o",
    cacheHit: true,
    costUsd: 0,
    costSavedUsd: 0.0125,
  });
  assert.equal(headers.get(MOATAZALAI_RESPONSE_HEADERS.responseCost), "0.0000000000");
  assert.equal(headers.get(MOATAZALAI_RESPONSE_HEADERS.costSaved), "0.0125000000");
});
