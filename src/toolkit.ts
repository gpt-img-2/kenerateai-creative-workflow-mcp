export type Medium = "image" | "video" | "audio";
export type ResourceTopic = "all" | "image" | "video" | "audio" | "agent" | "guides" | "policy";

function clean(value: string | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function cleanList(values: string[] | undefined) {
  return [...new Set((values || []).map(clean).filter(Boolean))];
}

export function buildCreativeBrief(params: {
  projectName: string;
  medium: Medium;
  objective: string;
  audience: string;
  subject: string;
  deliverables: string[];
  constraints?: string[] | undefined;
  referencesOwnedOrLicensed: boolean;
}) {
  const deliverables = cleanList(params.deliverables);
  const blockers = [
    !clean(params.projectName) ? "Name the project." : "",
    !clean(params.objective) ? "Define the outcome the asset should support." : "",
    !clean(params.audience) ? "Define the intended audience." : "",
    !clean(params.subject) ? "Describe the main subject or sound." : "",
    deliverables.length === 0 ? "List at least one deliverable." : "",
    !params.referencesOwnedOrLicensed ? "Use only reference media you own or have permission to use." : "",
  ].filter(Boolean);
  return {
    ready: blockers.length === 0,
    blockers,
    projectName: clean(params.projectName),
    medium: params.medium,
    objective: clean(params.objective),
    audience: clean(params.audience),
    subject: clean(params.subject),
    deliverables,
    constraints: cleanList(params.constraints),
    nextChecks: [
      "Choose a workflow that matches the available starting material.",
      "Confirm aspect ratio, duration or dimensions, and required output format in the current studio.",
      "Review the displayed model capabilities and credit cost before submitting any generation.",
    ],
  };
}

export function chooseGenerationWorkflow(params: {
  medium: Medium;
  hasTextPrompt: boolean;
  hasImageReference: boolean;
  wantsVariation: boolean;
  wantsTransparentBackground?: boolean | undefined;
  wantsPromptExtraction?: boolean | undefined;
}) {
  let workflow: string;
  if (params.medium === "audio") workflow = "text-to-music";
  else if (params.wantsPromptExtraction && params.hasImageReference) workflow = "image-to-prompt";
  else if (params.wantsTransparentBackground && params.medium === "image") workflow = "png-maker";
  else if (params.medium === "video" && params.hasImageReference) workflow = "image-to-video";
  else if (params.medium === "video") workflow = "text-to-video";
  else if (params.medium === "image" && params.hasImageReference && params.wantsVariation) workflow = "image-to-image";
  else workflow = "text-to-image";
  const blockers = [
    !params.hasTextPrompt && !params.hasImageReference ? "Provide a text prompt or an image reference." : "",
    params.wantsPromptExtraction && !params.hasImageReference ? "Image-to-prompt requires an image reference." : "",
  ].filter(Boolean);
  return {
    ready: blockers.length === 0,
    blockers,
    recommendedWorkflow: workflow,
    reason: `The ${workflow} workflow matches the supplied medium and starting material.`,
    verifyBeforeUse: [
      "Check the current model selector for supported inputs and settings.",
      "Confirm upload rights and current size or format limits.",
      "Review the displayed credit cost before generation.",
    ],
  };
}

const vagueTerms = /\b(nice|cool|beautiful|amazing|good|professional|cinematic)\b/gi;
const changingClaims = /\b(free|unlimited|cheapest|best|latest|available|supports?|credits?|price|cost)\b/i;

export function auditGenerationPrompt(params: {
  medium: Medium;
  prompt: string;
  negativePrompt?: string | undefined;
  sourceRightsConfirmed: boolean;
}) {
  const prompt = clean(params.prompt);
  const vague = [...new Set(prompt.match(vagueTerms) || [])];
  const required = params.medium === "video"
    ? ["subject", "action", "setting", "camera", "lighting", "timing"]
    : params.medium === "audio"
      ? ["genre or sound type", "mood", "tempo or pacing", "instruments or texture", "structure"]
      : ["subject", "setting", "composition", "lighting", "color", "style"];
  const blockers = [
    !prompt ? "Provide a prompt to review." : "",
    !params.sourceRightsConfirmed ? "Confirm rights to any referenced source material." : "",
  ].filter(Boolean);
  const warnings = [
    vague.length > 0 ? `Replace vague terms with observable direction: ${vague.join(", ")}.` : "",
    changingClaims.test(prompt) ? "Verify changing product, pricing, or model-availability claims against the live studio." : "",
    prompt.length < 40 ? "The prompt may be too brief to control subject, setting, and style reliably." : "",
  ].filter(Boolean);
  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
    medium: params.medium,
    prompt,
    negativePrompt: clean(params.negativePrompt) || null,
    coverageChecklist: required,
    refinementOrder: ["Lock the subject and intent.", "Add setting and composition.", "Add medium-specific motion or sound direction.", "Add lighting, color, mood, and style.", "Change one variable per iteration."],
    boundary: "This audit reviews user-supplied text only; it does not call a model, predict output quality, or submit a generation.",
  };
}

const resources = [
  { topic: "agent", title: "Kenerate AI Agent", path: "/agent", purpose: "Review the public agent-assisted creation workflow." },
  { topic: "video", title: "AI video workspace", path: "/workspace/ai-video", purpose: "Review current public video workflows." },
  { topic: "video", title: "Text to video", path: "/workspace/text-to-video", purpose: "Start from a written scene and motion prompt." },
  { topic: "video", title: "Image to video", path: "/workspace/image-to-video", purpose: "Animate a permitted image reference." },
  { topic: "image", title: "AI image workspace", path: "/workspace/ai-image", purpose: "Review current public image workflows." },
  { topic: "image", title: "Text to image", path: "/workspace/text-to-image", purpose: "Create an image from a written brief." },
  { topic: "image", title: "Image to prompt", path: "/workspace/image-to-prompt", purpose: "Turn visible reference details into editable prompt text." },
  { topic: "audio", title: "AI audio workspace", path: "/workspace/ai-audio", purpose: "Review current public audio workflows." },
  { topic: "audio", title: "Text to music", path: "/workspace/text-to-music", purpose: "Plan prompt-based music generation." },
  { topic: "guides", title: "Blog", path: "/blog", purpose: "Read public creation guides and updates." },
  { topic: "policy", title: "Privacy policy", path: "/privacy-policy", purpose: "Review current data-handling terms." },
  { topic: "policy", title: "Terms of service", path: "/terms-of-service", purpose: "Review current usage and rights terms." },
] as const;

export function getKenerateAIResources(appBaseUrl: string, topic: ResourceTopic) {
  return resources
    .filter((item) => topic === "all" || item.topic === topic)
    .map((item) => ({ ...item, url: `${appBaseUrl}${item.path}` }));
}
