import test from "node:test";
import assert from "node:assert/strict";
import { MOATAZALAI_RESPONSE_HEADERS } from "../../src/shared/constants/headers.ts";
import { buildmoatazalaiResponseMetaHeaders } from "../../src/domain/moatazalaiResponseMeta.ts";

test("headers constant exposes the fallback-attempts key", () => {
  assert.equal(
    MOATAZALAI_RESPONSE_HEADERS.fallbackAttempts,
    "X-moatazalai-Fallback-Attempts"
  );
});

test("buildmoatazalaiResponseMetaHeaders emits the fallback-attempts count when > 0", () => {
  const h = buildmoatazalaiResponseMetaHeaders({ model: "gpt", provider: "openai", fallbackAttempts: 2 });
  assert.equal(h["X-moatazalai-Fallback-Attempts"], "2");
});

test("buildmoatazalaiResponseMetaHeaders omits the header when 0 / absent", () => {
  const none = buildmoatazalaiResponseMetaHeaders({ model: "gpt" });
  assert.equal(none["X-moatazalai-Fallback-Attempts"], undefined);
  const zero = buildmoatazalaiResponseMetaHeaders({ model: "gpt", fallbackAttempts: 0 });
  assert.equal(zero["X-moatazalai-Fallback-Attempts"], undefined);
});
