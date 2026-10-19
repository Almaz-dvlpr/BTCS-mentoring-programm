import { NextRequest, NextResponse } from "next/server";
import { getBalance, getLedger, topUp } from "@/lib/credits";

export async function GET() {
  return NextResponse.json({ balanceCents: getBalance(), ledger: getLedger() });
}

// Local-only convenience endpoint to simulate topping up credits
// (stands in for a real payment flow, which is out of scope for a
// localhost demo).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const amountCents = Number(body?.amountCents);
  if (!amountCents || amountCents <= 0) {
    return NextResponse.json({ error: "amountCents должен быть положительным" }, { status: 400 });
  }
  topUp(amountCents, "manual_top_up");
  return NextResponse.json({ balanceCents: getBalance() });
}
