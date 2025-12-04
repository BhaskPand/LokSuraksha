import { db } from '../db/database';

export interface PushToken {
  id: number;
  user_id: number;
  token: string;
  platform?: string;
  created_at: string;
}

export class PushTokenModel {
  static create(userId: number, token: string, platform?: string): PushToken {
    // Check if token already exists for this user
    const existing = db.prepare('SELECT * FROM push_tokens WHERE user_id = ? AND token = ?').get(userId, token) as any;
    
    if (existing) {
      // Update existing token
      db.prepare('UPDATE push_tokens SET platform = ?, created_at = datetime("now") WHERE id = ?').run(platform || null, existing.id);
      return this.mapRowToToken(existing);
    }

    // Create new token
    const stmt = db.prepare(`
      INSERT INTO push_tokens (user_id, token, platform)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(userId, token, platform || null);
    const row = db.prepare('SELECT * FROM push_tokens WHERE id = ?').get(result.lastInsertRowid) as any;
    return this.mapRowToToken(row);
  }

  static findByUserId(userId: number): PushToken[] {
    const rows = db.prepare('SELECT * FROM push_tokens WHERE user_id = ?').all(userId) as any[];
    return rows.map(this.mapRowToToken);
  }

  static findByToken(token: string): PushToken | null {
    const row = db.prepare('SELECT * FROM push_tokens WHERE token = ?').get(token) as any;
    return row ? this.mapRowToToken(row) : null;
  }

  static delete(userId: number, token?: string): void {
    if (token) {
      db.prepare('DELETE FROM push_tokens WHERE user_id = ? AND token = ?').run(userId, token);
    } else {
      db.prepare('DELETE FROM push_tokens WHERE user_id = ?').run(userId);
    }
  }

  private static mapRowToToken(row: any): PushToken {
    return {
      id: row.id,
      user_id: row.user_id,
      token: row.token,
      platform: row.platform || undefined,
      created_at: row.created_at,
    };
  }
}

