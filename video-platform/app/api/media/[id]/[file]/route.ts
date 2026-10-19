import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { mediaDir } from "@/lib/db";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".mp4": "video/mp4",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; file: string }> }) {
  const { id, file } = await params;
  // id and file come straight from the URL path segments (not query/body),
  // but still guard against path traversal before touching the filesystem.
  if (!/^\d+$/.test(id) || file.includes("..") || file.includes("/")) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }
  const filePath = path.join(mediaDir, id, file);
  if (!filePath.startsWith(mediaDir) || !fs.existsSync(filePath)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const ext = path.extname(filePath);
  const data = fs.readFileSync(filePath);
  return new NextResponse(data, {
    headers: { "Content-Type": MIME[ext] || "application/octet-stream" },
  });
}
