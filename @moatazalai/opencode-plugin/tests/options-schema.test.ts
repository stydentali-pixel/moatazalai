/**
 * T-08 options-schema tests.
 *
 * Covers `parsemoatazalaiPluginOptions(opts)` — the strict Zod gate that
 * validates the second-arg `PluginOptions` bag from opencode.json before
 * any hook is wired. Anti-pattern checklist mirrored here:
 *
 *  - `null` / `undefined` must collapse to `{}` (defaults apply downstream).
 *  - Unknown keys must THROW (`.strict()` catches opencode.json typos).
 *  - Validation runs at parse time, not import time (module loads cleanly).
 */

import test from "node:test";
import assert from "node:assert/strict";
import { parsemoatazalaiPluginOptions } from "../src/index.js";

test("parsemoatazalaiPluginOptions: undefined → {}", () => {
  assert.deepEqual(parsemoatazalaiPluginOptions(undefined), {});
});

test("parsemoatazalaiPluginOptions: null → {}", () => {
  assert.deepEqual(parsemoatazalaiPluginOptions(null), {});
});

test("parsemoatazalaiPluginOptions: empty object → {}", () => {
  assert.deepEqual(parsemoatazalaiPluginOptions({}), {});
});

test("parsemoatazalaiPluginOptions: valid providerId → returns it", () => {
  const r = parsemoatazalaiPluginOptions({ providerId: "moatazalai-preprod" });
  assert.equal(r.providerId, "moatazalai-preprod");
});

test("parsemoatazalaiPluginOptions: invalid providerId (special chars) → throws", () => {
  assert.throws(
    () => parsemoatazalaiPluginOptions({ providerId: "moatazalai prod!" }),
    /providerId.*slug/i
  );
});

test("parsemoatazalaiPluginOptions: empty providerId → throws", () => {
  assert.throws(() => parsemoatazalaiPluginOptions({ providerId: "" }), /providerId/i);
});

test("parsemoatazalaiPluginOptions: valid modelCacheTtl → returns it", () => {
  const r = parsemoatazalaiPluginOptions({ modelCacheTtl: 60_000 });
  assert.equal(r.modelCacheTtl, 60_000);
});

test("parsemoatazalaiPluginOptions: negative modelCacheTtl → throws", () => {
  assert.throws(() => parsemoatazalaiPluginOptions({ modelCacheTtl: -1 }), /modelCacheTtl/i);
});

test("parsemoatazalaiPluginOptions: zero modelCacheTtl → throws (positive required)", () => {
  assert.throws(() => parsemoatazalaiPluginOptions({ modelCacheTtl: 0 }), /modelCacheTtl/i);
});

test("parsemoatazalaiPluginOptions: invalid baseURL (not a URL) → throws", () => {
  assert.throws(() => parsemoatazalaiPluginOptions({ baseURL: "not-a-url" }), /baseURL/i);
});

test("parsemoatazalaiPluginOptions: unknown key → throws (strict mode catches typos)", () => {
  assert.throws(
    () =>
      parsemoatazalaiPluginOptions({
        providerId: "moatazalai",
        provider_id: "typo-here",
      }),
    /provider_id|unrecognized/i
  );
});

test("parsemoatazalaiPluginOptions: all four fields populated correctly → returns them", () => {
  const opts = {
    providerId: "moatazalai-prod",
    displayName: "moatazalai Production",
    modelCacheTtl: 120_000,
    baseURL: "https://or.example.com/v1",
  };
  const r = parsemoatazalaiPluginOptions(opts);
  assert.deepEqual(r, opts);
});

test("parsemoatazalaiPluginOptions: error message lists every issue path", () => {
  // Two bad fields at once → error string should mention BOTH.
  try {
    parsemoatazalaiPluginOptions({
      providerId: "",
      baseURL: "garbage",
    });
    assert.fail("expected throw");
  } catch (err) {
    const msg = (err as Error).message;
    assert.match(msg, /providerId/);
    assert.match(msg, /baseURL/);
  }
});

test("parsemoatazalaiPluginOptions: module import alone does NOT throw", async () => {
  // Re-importing the entry must not trigger validation; validation only fires
  // on explicit parsemoatazalaiPluginOptions / moatazalaiPlugin invocation.
  const mod = await import("../src/index.js");
  assert.equal(typeof mod.parsemoatazalaiPluginOptions, "function");
});
