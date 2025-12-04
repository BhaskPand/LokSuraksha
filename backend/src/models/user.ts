import { db } from '../db/database';
import crypto from 'crypto';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  email_verified: boolean;
  phone_verified: boolean;
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
    const row = db.prepare('SELECT id, email, name, phone, email_verified, phone_verified, created_at FROM users WHERE email = ?').get(email) as any;
    return row ? this.mapRowToUser(row) : null;
  }

  static findById(id: number): User | null {
    const row = db.prepare('SELECT id, email, name, phone, email_verified, phone_verified, created_at FROM users WHERE id = ?').get(id) as any;
    return row ? this.mapRowToUser(row) : null;
  }

  static generateOTP(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static setOTP(userId: number, type: 'email' | 'phone', otp: string): void {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // OTP valid for 10 minutes

    if (type === 'email') {
      db.prepare('UPDATE users SET email_otp = ?, otp_expiry = ? WHERE id = ?').run(otp, expiry.toISOString(), userId);
    } else {
      db.prepare('UPDATE users SET phone_otp = ?, otp_expiry = ? WHERE id = ?').run(otp, expiry.toISOString(), userId);
    }
  }

  static verifyOTP(userId: number, type: 'email' | 'phone', otp: string): boolean {
    const row = db.prepare('SELECT email_otp, phone_otp, otp_expiry FROM users WHERE id = ?').get(userId) as any;
    if (!row) return false;

    const storedOTP = type === 'email' ? row.email_otp : row.phone_otp;
    if (!storedOTP || storedOTP !== otp) return false;

    // Check expiry
    if (row.otp_expiry) {
      const expiry = new Date(row.otp_expiry);
      if (expiry < new Date()) {
        return false; // OTP expired
      }
    }

    // Mark as verified
    if (type === 'email') {
      db.prepare('UPDATE users SET email_verified = 1, email_otp = NULL, otp_expiry = NULL WHERE id = ?').run(userId);
    } else {
      db.prepare('UPDATE users SET phone_verified = 1, phone_otp = NULL, otp_expiry = NULL WHERE id = ?').run(userId);
    }

    return true;
  }

  static isEmailVerified(email: string): boolean {
    const row = db.prepare('SELECT email_verified FROM users WHERE email = ?').get(email) as any;
    return row ? row.email_verified === 1 : false;
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
      INSERT INTO users (email, password, name, phone, email_verified, phone_verified)
      VALUES (?, ?, ?, ?, 0, 0)
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

  static update(id: number, data: { name?: string; phone?: string | null }): User | null {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    return this.findById(id);
  }

  static updatePassword(id: number, newPassword: string): void {
    const hashedPassword = hashPassword(newPassword);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);
  }

  static delete(id: number): boolean {
    try {
      // Delete user's issues first (due to foreign key constraint)
      db.prepare('DELETE FROM issues WHERE user_id = ?').run(id);
      
      // Delete user
      const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone || undefined,
      email_verified: row.email_verified === 1,
      phone_verified: row.phone_verified === 1,
      created_at: row.created_at,
    };
  }
}




