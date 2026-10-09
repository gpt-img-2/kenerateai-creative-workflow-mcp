import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { loadConfig } from "./config.js";
import { auditGenerationPrompt, buildCreativeBrief, chooseGenerationWorkflow, getKenerateAIResources } from "./toolkit.js";

const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const text = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] });
const instructions = `Kenerate AI Creative Workflow MCP is deterministic and read-only. It structures image, video, and audio briefs, selects a public workflow from user-supplied constraints, audits prompt completeness, and returns canonical public resources. It does not call models, fetch external content, upload media, access accounts, consume credits, submit jobs, or promise output quality or current availability.`;

export function createServer() {
  const config = loadConfig();
  const server = new McpServer({ name: "kenerateai-creative-workflow-mcp", version: "1.0.0" }, { instructions });

  server.registerTool("build_creative_brief", {
    title: "Build a creative production brief",
    description: "Structure an image, video, or audio goal, audience, subject, deliverables, constraints, and rights check.",
    inputSchema: z.object({
      projectName: z.string().max(200), medium: z.enum(["image", "video", "audio"]), objective: z.string().max(2000),
      audience: z.string().max(1000), subject: z.string().max(2000), deliverables: z.array(z.string().max(500)).min(1).max(30),
      constraints: z.array(z.string().max(500)).max(30).optional(), referencesOwnedOrLicensed: z.boolean(),
    }), annotations,
  }, async (params) => text(buildCreativeBrief(params)));

  server.registerTool("choose_generation_workflow", {
    title: "Choose a Kenerate AI workflow",
    description: "Map the desired medium and available source material to a public Kenerate AI workflow.",
    inputSchema: z.object({
      medium: z.enum(["image", "video", "audio"]), hasTextPrompt: z.boolean(), hasImageReference: z.boolean(),
      wantsVariation: z.boolean(), wantsTransparentBackground: z.boolean().optional(), wantsPromptExtraction: z.boolean().optional(),
    }), annotations,
  }, async (params) => text(chooseGenerationWorkflow(params)));

  server.registerTool("audit_generation_prompt", {
    title: "Audit a generation prompt",
    description: "Check a user-supplied image, video, or audio prompt for concrete direction, rights, and changing claims.",
    inputSchema: z.object({
      medium: z.enum(["image", "video", "audio"]), prompt: z.string().max(10000), negativePrompt: z.string().max(5000).optional(), sourceRightsConfirmed: z.boolean(),
    }), annotations,
  }, async (params) => text(auditGenerationPrompt(params)));

  server.registerTool("get_kenerateai_resources", {
    title: "Get canonical Kenerate AI resources",
    description: "Return canonical public workflow, guide, and policy pages without fetching external content.",
    inputSchema: z.object({ topic: z.enum(["all", "image", "video", "audio", "agent", "guides", "policy"]).default("all") }), annotations,
  }, async ({ topic }) => text({ topic, resources: getKenerateAIResources(config.appBaseUrl, topic), rawSkillUrl: `${config.appBaseUrl}/skills/kenerateai-creative-workflow/SKILL.md` }));

  return server;
}
