import { db, DEMO_USER_ID } from "./db";

export class InsufficientCreditsError extends Error {
  constructor(public needed: number, public available: number) {
    super(`Недостаточно кредитов: нужно ${needed}, доступно ${available}`);
  }
}

export function getBalance(userId: number = DEMO_USER_ID): number {
  const row = db.prepare("SELECT balance_cents FROM users WHERE id = ?").get(userId) as
    | { balance_cents: number }
    | undefined;
  return row?.balance_cents ?? 0;
}

/** Atomically checks and deducts credits. Throws if the balance is too low. */
export function charge(amountCents: number, reason: string, userId: number = DEMO_USER_ID): void {
  const run = db.transaction(() => {
    const balance = getBalance(userId);
    if (balance < amountCents) {
      throw new InsufficientCreditsError(amountCents, balance);
    }
    db.prepare("UPDATE users SET balance_cents = balance_cents - ? WHERE id = ?").run(amountCents, userId);
    db.prepare("INSERT INTO credit_ledger (user_id, delta_cents, reason) VALUES (?, ?, ?)").run(
      userId,
      -amountCents,
      reason
    );
  });
  run();
}

export function topUp(amountCents: number, reason: string = "top_up", userId: number = DEMO_USER_ID): void {
  const run = db.transaction(() => {
    db.prepare("UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?").run(amountCents, userId);
    db.prepare("INSERT INTO credit_ledger (user_id, delta_cents, reason) VALUES (?, ?, ?)").run(
      userId,
      amountCents,
      reason
    );
  });
  run();
}

export function getLedger(userId: number = DEMO_USER_ID, limit = 50) {
  return db
    .prepare("SELECT * FROM credit_ledger WHERE user_id = ? ORDER BY id DESC LIMIT ?")
    .all(userId, limit);
}
