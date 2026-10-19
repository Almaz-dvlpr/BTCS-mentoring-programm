"use client";

import { useEffect, useState } from "react";

interface Job {
  id: number;
  prompt: string;
  stage: string;
  status: string;
  provider: string;
  cost_cents: number;
  result_path: string | null;
  created_at: string;
}

export default function History() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs));
  }, []);

  return (
    <main>
      <h2 className="mb-4 text-lg font-semibold">История генераций</h2>
      <div className="space-y-2">
        {jobs.length === 0 && <p className="text-sm text-neutral-500">Пока пусто.</p>}
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 p-3 text-sm"
          >
            <div>
              <span className="text-neutral-500">#{job.id}</span> {job.stage} — {job.prompt}
            </div>
            <div className="text-neutral-400">
              {job.status} · ${(job.cost_cents / 100).toFixed(2)} · {job.provider}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
