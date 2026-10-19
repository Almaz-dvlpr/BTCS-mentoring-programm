import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const mediaDir = path.join(dataDir, "media");
fs.mkdirSync(mediaDir, { recursive: true });

const dbPath = path.join(dataDir, "app.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    balance_cents INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS credit_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    delta_cents INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    enhanced_prompt TEXT,
    stage TEXT NOT NULL,              -- preview | draft | final
    status TEXT NOT NULL,             -- queued | running | done | error
    provider TEXT NOT NULL,
    cost_cents INTEGER NOT NULL DEFAULT 0,
    result_path TEXT,
    error TEXT,
    parent_job_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Single local demo user (id = 1), seeded once with a starting balance.
const DEMO_USER_ID = 1;
const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(DEMO_USER_ID);
if (!existing) {
  const starting = parseInt(process.env.STARTING_CREDITS || "5000", 10);
  db.prepare("INSERT INTO users (id, balance_cents) VALUES (?, ?)").run(DEMO_USER_ID, starting);
  db.prepare("INSERT INTO credit_ledger (user_id, delta_cents, reason) VALUES (?, ?, ?)").run(
    DEMO_USER_ID,
    starting,
    "starting_balance"
  );
}

export { db, DEMO_USER_ID, mediaDir };
