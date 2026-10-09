import assert from "node:assert/strict";
import test from "node:test";
import { auditGenerationPrompt, buildCreativeBrief, chooseGenerationWorkflow, getKenerateAIResources } from "../src/toolkit.js";

test("requires rights for a creative brief", () => {
  const result = buildCreativeBrief({ projectName: "Launch", medium: "video", objective: "Explain a product", audience: "Buyers", subject: "Product demo", deliverables: ["16:9 video"], referencesOwnedOrLicensed: false });
  assert.equal(result.ready, false);
});

test("selects image to video for an image-led video", () => {
  const result = chooseGenerationWorkflow({ medium: "video", hasTextPrompt: true, hasImageReference: true, wantsVariation: false });
  assert.equal(result.recommendedWorkflow, "image-to-video");
  assert.equal(result.ready, true);
});

test("blocks image to prompt without a reference", () => {
  const result = chooseGenerationWorkflow({ medium: "image", hasTextPrompt: true, hasImageReference: false, wantsVariation: false, wantsPromptExtraction: true });
  assert.equal(result.ready, false);
});

test("flags vague prompt language", () => {
  const result = auditGenerationPrompt({ medium: "image", prompt: "A nice professional product image", sourceRightsConfirmed: true });
  assert.equal(result.ready, true);
  assert.ok(result.warnings.length >= 1);
});

test("resources use configured origin", () => {
  const result = getKenerateAIResources("https://kenerateai.org", "video");
  assert.equal(result.length, 3);
  assert.match(result[0]?.url || "", /^https:\/\/kenerateai\.org\//);
});
