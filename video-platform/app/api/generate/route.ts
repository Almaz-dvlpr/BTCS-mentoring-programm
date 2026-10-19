import { NextRequest, NextResponse } from "next/server";
import { runStage } from "@/lib/jobs";
import { InsufficientCreditsError } from "@/lib/credits";
import type { Stage } from "@/lib/providers";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const stage = body?.stage as Stage | undefined;
  const prompt = (body?.prompt as string | undefined)?.trim();
  const parentJobId = body?.parentJobId ?? null;

  if (!stage || !["preview", "draft", "final"].includes(stage)) {
    return NextResponse.json({ error: "Неверный stage (preview|draft|final)" }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ error: "Промпт пуст" }, { status: 400 });
  }

  try {
    const job = await runStage(stage, prompt, parentJobId);
    return NextResponse.json({ job });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: err.message, code: "insufficient_credits" },
        { status: 402 }
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
