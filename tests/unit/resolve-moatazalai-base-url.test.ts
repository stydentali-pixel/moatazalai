import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_MOATAZALAI_BASE_URL,
  resolvemoatazalaiBaseUrl,
} from "../../src/shared/utils/resolvemoatazalaiBaseUrl.ts";

test("resolvemoatazalaiBaseUrl prefers MOATAZALAI_BASE_URL", () => {
  assert.equal(
    resolvemoatazalaiBaseUrl({
      MOATAZALAI_BASE_URL: "https://internal.example.com/",
      BASE_URL: "https://base.example.com",
      NEXT_PUBLIC_BASE_URL: "https://public.example.com",
    }),
    "https://internal.example.com"
  );
});

test("resolvemoatazalaiBaseUrl falls back to BASE_URL", () => {
  assert.equal(
    resolvemoatazalaiBaseUrl({
      BASE_URL: "https://base.example.com/",
      NEXT_PUBLIC_BASE_URL: "https://public.example.com",
    }),
    "https://base.example.com"
  );
});

test("resolvemoatazalaiBaseUrl falls back to NEXT_PUBLIC_BASE_URL", () => {
  assert.equal(
    resolvemoatazalaiBaseUrl({
      NEXT_PUBLIC_BASE_URL: "https://public.example.com/",
    }),
    "https://public.example.com"
  );
});

test("resolvemoatazalaiBaseUrl ignores blank values", () => {
  assert.equal(
    resolvemoatazalaiBaseUrl({
      MOATAZALAI_BASE_URL: "   ",
      BASE_URL: "",
      NEXT_PUBLIC_BASE_URL: " https://public.example.com/ ",
    }),
    "https://public.example.com"
  );
});

test("resolvemoatazalaiBaseUrl uses the default localhost fallback", () => {
  assert.equal(resolvemoatazalaiBaseUrl({}), DEFAULT_MOATAZALAI_BASE_URL);
});
