import { mockProvider } from "./mock";
import { apimartProvider } from "./apimart";
import type { VideoProvider } from "./types";

export function getProvider(): VideoProvider {
  const name = process.env.VIDEO_PROVIDER || "mock";
  switch (name) {
    case "apimart":
      return apimartProvider;
    case "mock":
    default:
      return mockProvider;
  }
}

export * from "./types";
