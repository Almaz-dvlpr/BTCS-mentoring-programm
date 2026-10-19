export type Stage = "preview" | "draft" | "final";

export interface GenerateResult {
  /** Absolute path on disk to the produced file (image or video). */
  filePath: string;
  /** What it actually cost, in cents — the provider decides, not the UI. */
  costCents: number;
  mimeType: string;
}

export interface VideoProvider {
  name: string;
  /** Rough advertised price for a given stage, in cents — shown to the user
   *  BEFORE they confirm, so they know what a step will cost. The real
   *  charge after generation (costCents in the result) is what's deducted. */
  estimateCostCents(stage: Stage): number;
  generate(stage: Stage, prompt: string, outDir: string): Promise<GenerateResult>;
}
