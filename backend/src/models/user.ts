import { db } from '../db/database';
import crypto from 'crypto';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export class UserModel {
  static findByEmail(email: string): User | null {
    const row = db.prepare('SELECT id, email, name, phone, created_at FROM users WHERE email = ?').get(email) as any;
    return row ? this.mapRowToUser(row) : null;
  }

  static findById(id: number): User | null {
    const row = db.prepare('SELECT id, email, name, phone, created_at FROM users WHERE id = ?').get(id) as any;
    return row ? this.mapRowToUser(row) : null;
  }

  static verifyPassword(email: string, password: string): boolean {
    const row = db.prepare('SELECT password FROM users WHERE email = ?').get(email) as any;
    if (!row) return false;
    const hashedPassword = hashPassword(password);
    return row.password === hashedPassword;
  }

  static create(data: CreateUserRequest): User {
    const hashedPassword = hashPassword(data.password);
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, phone)
      VALUES (?, ?, ?, ?)
    `);

    try {
      const result = stmt.run(data.email, hashedPassword, data.name, data.phone || null);
      const user = this.findById(result.lastInsertRowid as number);
      if (!user) {
        throw new Error('Failed to create user');
      }
      return user;
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone || undefined,
      created_at: row.created_at,
    };
  }
}

