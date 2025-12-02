import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './data/citizen_safety.db';
const dbDir = path.dirname(dbPath);

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create issues table or migrate existing one
  const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='issues'").get() as any;
  
  if (tableInfo) {
    // Table exists, check if user_id column exists
    const columns = db.prepare("PRAGMA table_info(issues)").all() as any[];
    const hasUserId = columns.some(col => col.name === 'user_id');
    
    if (!hasUserId) {
      // Add user_id column to existing table
      db.exec(`
        ALTER TABLE issues ADD COLUMN user_id INTEGER;
        CREATE INDEX IF NOT EXISTS idx_user_id ON issues(user_id);
      `);
    }
  } else {
    // Create new issues table with user_id
    db.exec(`
      CREATE TABLE issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        location_lat REAL NOT NULL,
        location_lng REAL NOT NULL,
        images TEXT,
        contact_name TEXT,
        contact_phone TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  }

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_category ON issues(category);
    CREATE INDEX IF NOT EXISTS idx_status ON issues(status);
    CREATE INDEX IF NOT EXISTS idx_created_at ON issues(created_at);
    CREATE INDEX IF NOT EXISTS idx_user_id ON issues(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
  `);
}

