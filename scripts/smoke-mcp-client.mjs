import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const expectedTools = ["build_creative_brief", "choose_generation_workflow", "audit_generation_prompt", "get_kenerateai_resources"];
const command = process.env.MCP_SMOKE_COMMAND || "node";
const args = process.env.MCP_SMOKE_ARGS_JSON ? JSON.parse(process.env.MCP_SMOKE_ARGS_JSON) : ["bin/kenerateai-creative-workflow-mcp.js"];
const client = new Client({ name: "kenerateai-creative-workflow-smoke", version: "1.0.0" });
const transport = new StdioClientTransport({ command, args, cwd: process.cwd() });

try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  const names = tools.map((tool) => tool.name);
  assert.deepEqual([...names].sort(), [...expectedTools].sort());
  const result = await client.callTool({ name: "get_kenerateai_resources", arguments: { topic: "video" } });
  const first = result.content?.[0];
  assert.match(first?.type === "text" ? first.text : "", /kenerateai\.org/);
  console.log(`MCP smoke passed: ${names.join(", ")}`);
} finally {
  await client.close();
}
