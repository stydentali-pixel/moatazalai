import test from "node:test";
import assert from "node:assert/strict";

test("runmoatazalaiCli: missing command returns error", async () => {
  const { getCopilotTool } = await import("../../src/lib/copilot/tools.ts");
  const tool = getCopilotTool("runmoatazalaiCli");
  assert.ok(tool);
  const result = await tool.handler({});
  assert.equal(result, "Please provide a command to execute.");
});

test("runmoatazalaiCli: empty command returns error", async () => {
  const { getCopilotTool } = await import("../../src/lib/copilot/tools.ts");
  const tool = getCopilotTool("runmoatazalaiCli");
  assert.ok(tool);
  const result = await tool.handler({ command: "" });
  assert.equal(result, "Please provide a command to execute.");
});

test("runmoatazalaiCli: returns CLI-not-found when moatazalai unavailable", async () => {
  const { getCopilotTool } = await import("../../src/lib/copilot/tools.ts");
  const tool = getCopilotTool("runmoatazalaiCli");
  assert.ok(tool);
  const result = await tool.handler({ command: "health" });
  assert.ok(
    result.includes("moatazalai CLI not found in PATH"),
    `Expected CLI-not-found message, got: ${result}`
  );
});
