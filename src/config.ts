export type KenerateAIConfig = { appBaseUrl: string };

function parseBaseUrl(value: string | undefined) {
  const candidate = (value || "https://kenerateai.org").trim().replace(/\/+$/, "");
  const url = new URL(candidate);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Kenerate AI base URL must use http or https.");
  }
  return url.toString().replace(/\/+$/, "");
}

export function loadConfig(): KenerateAIConfig {
  return { appBaseUrl: parseBaseUrl(process.env.KENERATEAI_BASE_URL) };
}
