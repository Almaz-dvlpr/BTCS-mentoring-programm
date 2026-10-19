import fs from "fs";
import path from "path";
import { db, DEMO_USER_ID, mediaDir } from "./db";
import { charge, InsufficientCreditsError } from "./credits";
import { enhancePrompt } from "./prompt-enhance";
import { getProvider, Stage } from "./providers";

export interface JobRow {
  id: number;
  user_id: number;
  prompt: string;
  enhanced_prompt: string | null;
  stage: Stage;
  status: "queued" | "running" | "done" | "error";
  provider: string;
  cost_cents: number;
  result_path: string | null;
  error: string | null;
  parent_job_id: number | null;
  created_at: string;
  updated_at: string;
}

export function getJob(id: number): JobRow | undefined {
  return db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRow | undefined;
}

export function listJobs(userId: number = DEMO_USER_ID): JobRow[] {
  return db
    .prepare("SELECT * FROM jobs WHERE user_id = ? ORDER BY id DESC LIMIT 100")
    .all(userId) as JobRow[];
}

/**
 * Runs one generation stage synchronously (the mock/APIMart calls are
 * fast enough for a local demo) and persists the result as a job row.
 * Credits are charged only after generation succeeds, using the
 * provider's real reported cost — never charged up front.
 */
export async function runStage(
  stage: Stage,
  prompt: string,
  parentJobId: number | null,
  userId: number = DEMO_USER_ID
): Promise<JobRow> {
  const provider = getProvider();

  // Reserve a row up front so the UI can show "running" while ffmpeg/the
  // real API call is in flight.
  const insert = db
    .prepare(
      `INSERT INTO jobs (user_id, prompt, stage, status, provider, parent_job_id)
       VALUES (?, ?, ?, 'running', ?, ?)`
    )
    .run(userId, prompt, stage, provider.name, parentJobId);
  const jobId = insert.lastInsertRowid as number;

  try {
    const enhanced = stage === "preview" ? await enhancePrompt(prompt) : prompt;
    const outDir = path.join(mediaDir, String(jobId));
    fs.mkdirSync(outDir, { recursive: true });

    const result = await provider.generate(stage, enhanced, outDir);

    // Charge AFTER generation succeeds, for the actual reported cost.
    charge(result.costCents, `${provider.name}:${stage}:job${jobId}`, userId);

    db.prepare(
      `UPDATE jobs SET status = 'done', enhanced_prompt = ?, cost_cents = ?, result_path = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(enhanced, result.costCents, result.filePath, jobId);

    return getJob(jobId)!;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    db.prepare(`UPDATE jobs SET status = 'error', error = ?, updated_at = datetime('now') WHERE id = ?`).run(
      message,
      jobId
    );
    if (err instanceof InsufficientCreditsError) {
      throw err;
    }
    throw new Error(message);
  }
}
