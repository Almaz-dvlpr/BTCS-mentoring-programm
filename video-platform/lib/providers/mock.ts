import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import type { GenerateResult, Stage, VideoProvider } from "./types";

const execFileAsync = promisify(execFile);

// Rough stand-ins for the per-stage prices we researched for real
// providers (APIMart etc.): a cheap preview image, a cheap draft clip,
// a pricier final render. All in cents.
const PRICING: Record<Stage, number> = {
  preview: 1, // ~$0.01 — one still frame
  draft: 25, // ~$0.25 — a short 480p draft clip
  final: 150, // ~$1.50 — a short 720p "final" clip
};

function sanitizeForDrawtext(text: string): string {
  // ffmpeg's drawtext filter treats :, ', \ specially. Strip anything that
  // isn't safe rather than fighting escaping rules.
  return text
    .replace(/[:'\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function wrapText(text: string, width = 28): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > width) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4).join("\n");
}

async function render(
  stage: Stage,
  prompt: string,
  outDir: string
): Promise<GenerateResult> {
  const safeText = wrapText(sanitizeForDrawtext(prompt));
  const escaped = safeText.replace(/\n/g, "\\n");

  if (stage === "preview") {
    const outPath = path.join(outDir, "preview.png");
    await execFileAsync("ffmpeg", [
      "-y",
      "-f", "lavfi",
      "-i", "gradients=s=640x360:speed=0.01",
      "-frames:v", "1",
      "-vf",
      `drawtext=text='${escaped}':fontcolor=white:fontsize=22:line_spacing=6:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.4:boxborderw=12`,
      outPath,
    ]);
    return { filePath: outPath, costCents: PRICING.preview, mimeType: "image/png" };
  }

  const isDraft = stage === "draft";
  const outPath = path.join(outDir, `${stage}.mp4`);
  const size = isDraft ? "640x360" : "1280x720";
  const duration = isDraft ? 5 : 8;
  const label = isDraft ? "DRAFT  480p" : "FINAL  720p";

  await execFileAsync("ffmpeg", [
    "-y",
    "-f", "lavfi",
    "-i", `gradients=s=${size}:speed=0.02:d=${duration}`,
    "-vf",
    `drawtext=text='[MOCK ${label}]\\n${escaped}':fontcolor=white:fontsize=${isDraft ? 18 : 26}:` +
      `line_spacing=8:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.45:boxborderw=14`,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-t", String(duration),
    outPath,
  ]);
  return { filePath: outPath, costCents: PRICING[stage], mimeType: "video/mp4" };
}

export const mockProvider: VideoProvider = {
  name: "mock",
  estimateCostCents: (stage) => PRICING[stage],
  generate: render,
};
