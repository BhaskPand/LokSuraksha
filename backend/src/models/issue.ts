import { db } from '../db/database';
import { Issue, CreateIssueRequest, UpdateIssueRequest, IssueStatus } from '@citizen-safety/shared';

export class IssueModel {
  static findAll(params?: { limit?: number; category?: string; since?: string; userId?: number }): Issue[] {
    let query = 'SELECT * FROM issues WHERE 1=1';
    const conditions: string[] = [];
    const values: any[] = [];

    if (params?.userId) {
      conditions.push('user_id = ?');
      values.push(params.userId);
    }

    if (params?.category) {
      conditions.push('category = ?');
      values.push(params.category);
    }

    if (params?.since) {
      conditions.push('created_at >= ?');
      values.push(params.since);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (params?.limit) {
      query += ' LIMIT ?';
      values.push(params.limit);
    }

    const rows = db.prepare(query).all(...values) as any[];
    return rows.map(this.mapRowToIssue);
  }

  static findById(id: number): Issue | null {
    const row = db.prepare('SELECT * FROM issues WHERE id = ?').get(id) as any;
    return row ? this.mapRowToIssue(row) : null;
  }

  static create(data: CreateIssueRequest, userId?: number): Issue {
    const imagesJson = JSON.stringify(data.images || []);
    const stmt = db.prepare(`
      INSERT INTO issues (user_id, title, description, category, location_lat, location_lng, images, contact_name, contact_phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `);

    const result = stmt.run(
      userId || null,
      data.title,
      data.description,
      data.category,
      data.location_lat,
      data.location_lng,
      imagesJson,
      data.contact_name || null,
      data.contact_phone || null
    );

    const issue = this.findById(result.lastInsertRowid as number);
    if (!issue) {
      throw new Error('Failed to create issue');
    }
    return issue;
  }

  static update(id: number, data: UpdateIssueRequest): Issue | null {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE issues SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    return this.findById(id);
  }

  static count(): number {
    const result = db.prepare('SELECT COUNT(*) as count FROM issues').get() as { count: number };
    return result.count;
  }

  static findAllForExport(): any[] {
    return db.prepare('SELECT * FROM issues ORDER BY created_at DESC').all();
  }

  private static mapRowToIssue(row: any): Issue {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      location_lat: row.location_lat,
      location_lng: row.location_lng,
      images: row.images ? JSON.parse(row.images) : [],
      contact_name: row.contact_name || undefined,
      contact_phone: row.contact_phone || undefined,
      status: row.status as IssueStatus,
      created_at: row.created_at,
      notes: row.notes || undefined,
    };
  }
}

