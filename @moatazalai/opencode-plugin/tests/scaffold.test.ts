import test from "node:test";
import assert from "node:assert/strict";
import {
  moatazalaiPlugin,
  MOATAZALAI_PROVIDER_KEY,
  DEFAULT_MODEL_CACHE_TTL_MS,
  resolvemoatazalaiPluginOptions,
} from "../src/index.js";

test("scaffold: exports public surface", () => {
  assert.equal(
    typeof moatazalaiPlugin,
    "function",
    "moatazalaiPlugin must be a function (Plugin factory)"
  );
  assert.equal(MOATAZALAI_PROVIDER_KEY, "moatazalai");
  assert.equal(DEFAULT_MODEL_CACHE_TTL_MS, 300_000);
});

test("scaffold: default export is v1 plugin shape { id, server: moatazalaiPlugin }", async () => {
  const mod = await import("../src/index.js");
  assert.equal(typeof mod.default, "object");
  assert.equal(mod.default.id, "@moatazalai/opencode-plugin");
  assert.equal(mod.default.server, mod.moatazalaiPlugin);
});

test("resolvemoatazalaiPluginOptions: defaults", () => {
  const r = resolvemoatazalaiPluginOptions();
  assert.equal(r.providerId, "opencode-moatazalai");
  assert.equal(r.displayName, "moatazalai");
  assert.equal(r.modelCacheTtl, 300_000);
  assert.equal(r.baseURL, undefined);
});

test("resolvemoatazalaiPluginOptions: custom providerId derives displayName", () => {
  const r = resolvemoatazalaiPluginOptions({ providerId: "moatazalai-preprod" });
  assert.equal(r.providerId, "opencode-moatazalai-preprod");
  assert.equal(r.displayName, "moatazalai (opencode-moatazalai-preprod)");
});

test("resolvemoatazalaiPluginOptions: explicit displayName wins", () => {
  const r = resolvemoatazalaiPluginOptions({
    providerId: "moatazalai-x",
    displayName: "Custom Label",
  });
  assert.equal(r.displayName, "Custom Label");
});

test("resolvemoatazalaiPluginOptions: invalid TTL falls back to default", () => {
  assert.equal(resolvemoatazalaiPluginOptions({ modelCacheTtl: 0 }).modelCacheTtl, 300_000);
  assert.equal(resolvemoatazalaiPluginOptions({ modelCacheTtl: -1 }).modelCacheTtl, 300_000);
});

test("resolvemoatazalaiPluginOptions: positive TTL respected", () => {
  assert.equal(resolvemoatazalaiPluginOptions({ modelCacheTtl: 60_000 }).modelCacheTtl, 60_000);
});

test("moatazalaiPlugin: returns an empty hooks object (scaffold)", async () => {
  const fakeCtx = {} as Parameters<typeof moatazalaiPlugin>[0];
  const hooks = await moatazalaiPlugin(fakeCtx);
  assert.equal(typeof hooks, "object");
  assert.notEqual(hooks, null);
});

test("scaffold: built ESM default export resolves with the v1 plugin shape", async () => {
  // The plugin is ESM-only now — the CJS bundle was dropped to fix the OpenCode
  // loader (#3883), so there is no more ../dist/index.cjs. Validate that the built
  // distributable's default export still carries the OpenCode v1 { id, server } shape.
  const mod = await import("../dist/index.js");
  assert.strictEqual(typeof mod.default, "object");
  assert.strictEqual(mod.default.id, "@moatazalai/opencode-plugin");
  assert.strictEqual(typeof mod.default.server, "function");
});
