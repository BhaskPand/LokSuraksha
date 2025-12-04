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

    // Admin-only fields
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    // User-editable fields
    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }

    if (data.images !== undefined) {
      updates.push('images = ?');
      values.push(JSON.stringify(data.images));
    }

    if (data.contact_name !== undefined) {
      updates.push('contact_name = ?');
      values.push(data.contact_name || null);
    }

    if (data.contact_phone !== undefined) {
      updates.push('contact_phone = ?');
      values.push(data.contact_phone || null);
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

  static getStatistics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const lastWeekStart = new Date(weekAgo);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const lastMonthStart = new Date(monthAgo);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const formatDate = (date: Date) => date.toISOString();

    // Current period counts
    const totalCurrent = this.count();
    const openCurrent = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'open'").get() as { count: number };
    const inProgressCurrent = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'in_progress'").get() as { count: number };
    const resolvedCurrent = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'resolved'").get() as { count: number };
    
    const todayCurrent = db.prepare("SELECT COUNT(*) as count FROM issues WHERE created_at >= ?").get(formatDate(today)) as { count: number };
    const thisWeekCurrent = db.prepare("SELECT COUNT(*) as count FROM issues WHERE created_at >= ?").get(formatDate(weekAgo)) as { count: number };
    const thisMonthCurrent = db.prepare("SELECT COUNT(*) as count FROM issues WHERE created_at >= ?").get(formatDate(monthAgo)) as { count: number };

    // Previous period counts (for trends)
    const totalPrevious = db.prepare("SELECT COUNT(*) as count FROM issues WHERE created_at < ?").get(formatDate(monthAgo)) as { count: number };
    const openPrevious = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'open' AND created_at < ?").get(formatDate(monthAgo)) as { count: number };
    const inProgressPrevious = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'in_progress' AND created_at < ?").get(formatDate(monthAgo)) as { count: number };
    const resolvedPrevious = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'resolved' AND created_at < ?").get(formatDate(monthAgo)) as { count: number };
    
    const todayPrevious = db.prepare("SELECT COUNT(*) as count FROM issues WHERE created_at >= ? AND created_at < ?").get(formatDate(yesterday), formatDate(today)) as { count: number };
    const lastWeekCurrent = db.prepare("SELECT COUNT(*) as count FROM issues WHERE created_at >= ? AND created_at < ?").get(formatDate(lastWeekStart), formatDate(weekAgo)) as { count: number };
    const lastMonthCurrent = db.prepare("SELECT COUNT(*) as count FROM issues WHERE created_at >= ? AND created_at < ?").get(formatDate(lastMonthStart), formatDate(monthAgo)) as { count: number };

    // Calculate trends
    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Average resolution time (for resolved issues)
    // Note: Since we don't track resolved_at, we estimate based on creation time
    // This is an approximation - ideally we'd track when status changed to 'resolved'
    const resolvedIssues = db.prepare("SELECT created_at FROM issues WHERE status = 'resolved'").all() as { created_at: string }[];
    let avgResolutionTime = 0;
    if (resolvedIssues.length > 0) {
      const totalHours = resolvedIssues.reduce((sum, issue) => {
        const created = new Date(issue.created_at);
        const hours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgResolutionTime = totalHours / resolvedIssues.length;
    }

    // Previous period average resolution time (calculate for issues resolved before this month)
    const oldResolvedIssues = db.prepare("SELECT created_at FROM issues WHERE status = 'resolved' AND created_at < ?").all(formatDate(monthAgo)) as { created_at: string }[];
    let avgResolutionTimePrevious = 0;
    if (oldResolvedIssues.length > 0) {
      const totalHours = oldResolvedIssues.reduce((sum, issue) => {
        const created = new Date(issue.created_at);
        // Estimate resolution time as time from creation to end of previous period
        const hours = (monthAgo.getTime() - created.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgResolutionTimePrevious = totalHours / oldResolvedIssues.length;
    } else {
      avgResolutionTimePrevious = avgResolutionTime * 0.9; // Fallback estimate
    }

    // Resolution rate
    const resolutionRate = totalCurrent > 0 ? (resolvedCurrent.count / totalCurrent) * 100 : 0;
    const resolutionRatePrevious = totalPrevious.count > 0 ? (resolvedPrevious.count / totalPrevious.count) * 100 : 0;

    // By category
    const categoryRows = db.prepare("SELECT category, COUNT(*) as count FROM issues GROUP BY category").all() as { category: string; count: number }[];
    const byCategory: Record<string, number> = {};
    categoryRows.forEach(row => {
      byCategory[row.category] = row.count;
    });

    // By status
    const byStatus: Record<string, number> = {
      open: openCurrent.count,
      in_progress: inProgressCurrent.count,
      resolved: resolvedCurrent.count,
    };

    // Recent activity
    const last24Hours = db.prepare("SELECT COUNT(*) as count FROM issues WHERE created_at >= datetime('now', '-1 day')").get() as { count: number };
    const last7Days = db.prepare("SELECT COUNT(*) as count FROM issues WHERE created_at >= datetime('now', '-7 days')").get() as { count: number };
    const last30Days = db.prepare("SELECT COUNT(*) as count FROM issues WHERE created_at >= datetime('now', '-30 days')").get() as { count: number };

    return {
      total: {
        value: totalCurrent,
        previous: totalPrevious.count,
        trend: calculateTrend(totalCurrent, totalPrevious.count),
      },
      open: {
        value: openCurrent.count,
        previous: openPrevious.count,
        trend: calculateTrend(openCurrent.count, openPrevious.count),
      },
      inProgress: {
        value: inProgressCurrent.count,
        previous: inProgressPrevious.count,
        trend: calculateTrend(inProgressCurrent.count, inProgressPrevious.count),
      },
      resolved: {
        value: resolvedCurrent.count,
        previous: resolvedPrevious.count,
        trend: calculateTrend(resolvedCurrent.count, resolvedPrevious.count),
      },
      today: {
        value: todayCurrent.count,
        previous: todayPrevious.count,
        trend: calculateTrend(todayCurrent.count, todayPrevious.count),
      },
      thisWeek: {
        value: thisWeekCurrent.count,
        previous: lastWeekCurrent.count,
        trend: calculateTrend(thisWeekCurrent.count, lastWeekCurrent.count),
      },
      thisMonth: {
        value: thisMonthCurrent.count,
        previous: lastMonthCurrent.count,
        trend: calculateTrend(thisMonthCurrent.count, lastMonthCurrent.count),
      },
      averageResolutionTime: {
        value: avgResolutionTime,
        previous: avgResolutionTimePrevious,
        trend: calculateTrend(avgResolutionTime, avgResolutionTimePrevious),
      },
      resolutionRate: {
        value: resolutionRate,
        previous: resolutionRatePrevious,
        trend: calculateTrend(resolutionRate, resolutionRatePrevious),
      },
      byCategory,
      byStatus,
      recentActivity: {
        last24Hours: last24Hours.count,
        last7Days: last7Days.count,
        last30Days: last30Days.count,
      },
    };
  }

  private static mapRowToIssue(row: any): Issue {
    return {
      id: row.id,
      user_id: row.user_id || undefined,
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

