import fs from "fs";
import path from "path";
import type { GenerateResult, Stage, VideoProvider } from "./types";

/**
 * Real provider adapter for APIMart (https://apimart.ai).
 *
 * NOT VERIFIED against APIMart's live API — their exact endpoint paths,
 * request/response shape and model IDs weren't available to check from
 * here. Before using this for real money:
 *   1. Read APIMart's current API docs for the model you want
 *      (e.g. Seedance 2.0 Mini, Wan 3.0, Kling) and its job-creation /
 *      polling / result shape.
 *   2. Adjust MODEL_IDS and the request/response parsing below to match.
 *   3. Test with a $1-5 top-up before wiring it into the credit system.
 *
 * The pricing map should also be replaced with APIMart's current
 * published per-second rates once confirmed.
 */

const MODEL_IDS: Record<Stage, string> = {
  preview: "text-to-image", // placeholder — set to APIMart's actual image model id
  draft: "seedance-2.0-mini", // cheap/fast tier for cheap drafts
  final: "seedance-2.0", // higher quality tier for the approved final render
};

// Cents per second of generated video, by stage — ADJUST to APIMart's
// current rate card before relying on this for cost accounting.
const RATE_PER_SECOND_CENTS: Record<Stage, number> = {
  preview: 0, // billed as a flat per-image cost instead, see below
  draft: 1.1, // ~$0.011/s (Seedance 2.0 Mini, 480p)
  final: 14.2, // ~$0.142/s (Seedance 2.0, 720p)
};
const FLAT_IMAGE_COST_CENTS = 1;

async function createJob(apiKey: string, baseUrl: string, model: string, prompt: string) {
  const res = await fetch(`${baseUrl}/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, prompt }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`APIMart createJob failed: ${res.status} ${body}`);
  }
  return res.json();
}

async function pollJob(apiKey: string, baseUrl: string, jobId: string, timeoutMs = 10 * 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${baseUrl}/generations/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`APIMart pollJob failed: ${res.status}`);
    const data = await res.json();
    if (data.status === "completed") return data;
    if (data.status === "failed") throw new Error(`APIMart job failed: ${data.error ?? "unknown error"}`);
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("APIMart job timed out");
}

async function downloadTo(url: string, outPath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);
}

async function generate(stage: Stage, prompt: string, outDir: string): Promise<GenerateResult> {
  const apiKey = process.env.APIMART_API_KEY;
  if (!apiKey) {
    throw new Error(
      "APIMART_API_KEY не задан в .env. Получите ключ на apimart.ai и добавьте его, " +
        "или оставьте VIDEO_PROVIDER=mock для работы без реального API."
    );
  }
  const baseUrl = process.env.APIMART_BASE_URL || "https://api.apimart.ai/v1";
  const model = MODEL_IDS[stage];

  const created = await createJob(apiKey, baseUrl, model, prompt);
  const result = await pollJob(apiKey, baseUrl, created.id);

  const isImage = stage === "preview";
  const ext = isImage ? "png" : "mp4";
  const outPath = path.join(outDir, `${stage}.${ext}`);
  await downloadTo(result.output_url, outPath);

  const durationSec = result.duration_seconds ?? (stage === "draft" ? 5 : 8);
  const costCents = isImage
    ? FLAT_IMAGE_COST_CENTS
    : Math.ceil(durationSec * RATE_PER_SECOND_CENTS[stage]);

  return { filePath: outPath, costCents, mimeType: isImage ? "image/png" : "video/mp4" };
}

export const apimartProvider: VideoProvider = {
  name: "apimart",
  estimateCostCents: (stage) =>
    stage === "preview" ? FLAT_IMAGE_COST_CENTS : Math.ceil(5 * RATE_PER_SECOND_CENTS[stage]),
  generate,
};
