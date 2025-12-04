import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'citizen_safety.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  console.log('Initializing database...');

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email_verified INTEGER NOT NULL DEFAULT 0,
      phone_verified INTEGER NOT NULL DEFAULT 0,
      email_otp TEXT,
      phone_otp TEXT,
      otp_expiry TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Migration: Add verification columns if they don't exist
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const hasEmailVerified = tableInfo.some((col: any) => col.name === 'email_verified');
    
    if (!hasEmailVerified) {
      console.log('Adding verification columns to users table...');
      db.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0');
      db.exec('ALTER TABLE users ADD COLUMN phone_verified INTEGER NOT NULL DEFAULT 0');
      db.exec('ALTER TABLE users ADD COLUMN email_otp TEXT');
      db.exec('ALTER TABLE users ADD COLUMN phone_otp TEXT');
      db.exec('ALTER TABLE users ADD COLUMN otp_expiry TEXT');
    }
  } catch (error) {
    console.warn('Migration check failed:', error);
  }

  // Create issues table
  db.exec(`
    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      location_lat REAL NOT NULL,
      location_lng REAL NOT NULL,
      images TEXT NOT NULL DEFAULT '[]',
      contact_name TEXT,
      contact_phone TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'medium',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Migration: Add priority column if it doesn't exist
  try {
    const tableInfo = db.prepare("PRAGMA table_info(issues)").all() as any[];
    const hasPriority = tableInfo.some((col: any) => col.name === 'priority');
    
    if (!hasPriority) {
      console.log('Adding priority column to issues table...');
      db.exec('ALTER TABLE issues ADD COLUMN priority TEXT NOT NULL DEFAULT "medium"');
      db.exec('CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority)');
    }
  } catch (error) {
    console.warn('Migration check failed:', error);
  }

  // Migration: Add user_id column if it doesn't exist
  try {
    const tableInfo = db.prepare("PRAGMA table_info(issues)").all() as any[];
    const hasUserId = tableInfo.some((col: any) => col.name === 'user_id');
    
    if (!hasUserId) {
      console.log('Adding user_id column to issues table...');
      db.exec('ALTER TABLE issues ADD COLUMN user_id INTEGER');
      db.exec('CREATE INDEX IF NOT EXISTS idx_issues_user_id ON issues(user_id)');
    }
  } catch (error) {
    console.warn('Migration check failed:', error);
  }

  // Create push_tokens table for notifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS push_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      platform TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec('CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token)');

  console.log('Database initialized successfully!');
}

// Initialize database on import
initDatabase();



