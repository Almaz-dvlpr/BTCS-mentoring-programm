"use client";

import { useEffect, useState } from "react";

type Stage = "preview" | "draft" | "final";

interface Job {
  id: number;
  prompt: string;
  enhanced_prompt: string | null;
  stage: Stage;
  status: "queued" | "running" | "done" | "error";
  provider: string;
  cost_cents: number;
  result_path: string | null;
  error: string | null;
}

function mediaUrl(job: Job): string | null {
  if (!job.result_path) return null;
  const file = job.result_path.split("/").pop();
  return `/api/media/${job.id}/${file}`;
}

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const STAGE_LABEL: Record<Stage, string> = {
  preview: "1. Превью-картинка",
  draft: "2. Черновое видео (480p)",
  final: "3. Финал (720p)",
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Partial<Record<Stage, Job>>>({});
  const [loadingStage, setLoadingStage] = useState<Stage | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshBalance() {
    const res = await fetch("/api/credits");
    const data = await res.json();
    setBalanceCents(data.balanceCents);
  }

  useEffect(() => {
    refreshBalance();
  }, []);

  async function runStage(stage: Stage) {
    setError(null);
    setLoadingStage(stage);
    try {
      const parentJobId = stage === "draft" ? jobs.preview?.id : stage === "final" ? jobs.draft?.id : null;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, prompt, parentJobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка генерации");
        return;
      }
      setJobs((prev) => ({ ...prev, [stage]: data.job }));
      await refreshBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingStage(null);
    }
  }

  function reset() {
    setJobs({});
    setError(null);
  }

  return (
    <main className="space-y-6">
      <section className="rounded-lg border border-neutral-700 bg-neutral-900 p-4">
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <span>
            Баланс: <span className="font-mono text-neutral-100">{balanceCents != null ? money(balanceCents) : "…"}</span>
          </span>
          <TopUp onDone={refreshBalance} />
        </div>
      </section>

      <section className="space-y-3">
        <label className="block text-sm text-neutral-400">Опишите видео</label>
        <textarea
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 p-3 text-sm"
          rows={3}
          placeholder="Например: дрон пролетает над горным озером на рассвете"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            reset();
          }}
        />
      </section>

      {error && (
        <div className="rounded-md border border-red-800 bg-red-950 p-3 text-sm text-red-300">{error}</div>
      )}

      <section className="space-y-4">
        <StageCard
          stage="preview"
          job={jobs.preview}
          disabled={!prompt.trim() || loadingStage !== null}
          loading={loadingStage === "preview"}
          onRun={() => runStage("preview")}
        />
        <StageCard
          stage="draft"
          job={jobs.draft}
          disabled={!jobs.preview || jobs.preview.status !== "done" || loadingStage !== null}
          loading={loadingStage === "draft"}
          onRun={() => runStage("draft")}
        />
        <StageCard
          stage="final"
          job={jobs.final}
          disabled={!jobs.draft || jobs.draft.status !== "done" || loadingStage !== null}
          loading={loadingStage === "final"}
          onRun={() => runStage("final")}
        />
      </section>
    </main>
  );
}

function StageCard({
  stage,
  job,
  disabled,
  loading,
  onRun,
}: {
  stage: Stage;
  job?: Job;
  disabled: boolean;
  loading: boolean;
  onRun: () => void;
}) {
  const url = job ? mediaUrl(job) : null;
  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">{STAGE_LABEL[stage]}</h3>
        <button
          onClick={onRun}
          disabled={disabled}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500"
        >
          {loading ? "Генерирую…" : job?.status === "done" ? "Перегенерировать" : "Запустить"}
        </button>
      </div>

      {job?.status === "error" && (
        <p className="text-sm text-red-400">Ошибка: {job.error}</p>
      )}

      {job?.status === "done" && url && (
        <div className="space-y-2">
          {stage === "preview" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="превью" className="rounded-md" />
          ) : (
            <video src={url} controls className="w-full rounded-md" />
          )}
          <p className="text-xs text-neutral-500">
            Провайдер: {job.provider} · Списано: {money(job.cost_cents)}
            {job.enhanced_prompt && job.enhanced_prompt !== job.prompt && (
              <> · Промпт после улучшения: «{job.enhanced_prompt}»</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function TopUp({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  async function add(cents: number) {
    setBusy(true);
    await fetch("/api/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountCents: cents }),
    });
    await onDone();
    setBusy(false);
  }
  return (
    <button
      onClick={() => add(1000)}
      disabled={busy}
      className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
    >
      + Пополнить $10 (демо)
    </button>
  );
}
