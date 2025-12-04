import { Request, Response } from 'express';
import { IssueModel } from '../models/issue';
import { CreateIssueRequest, UpdateIssueRequest, IssueFilters } from '@citizen-safety/shared';
import { sendIssueStatusNotification } from '../utils/notificationService';

export async function getIssues(req: Request, res: Response) {
  try {
    const filters: IssueFilters & { limit?: number; offset?: number } = {};
    
    if (req.query.limit) {
      filters.limit = parseInt(req.query.limit as string, 10);
    }
    
    if (req.query.offset) {
      filters.offset = parseInt(req.query.offset as string, 10);
    }
    
    if (req.query.category) {
      filters.category = req.query.category as string;
    }
    
    if (req.query.status) {
      filters.status = req.query.status as any;
    }
    
    if (req.query.priority) {
      filters.priority = req.query.priority as any;
    }
    
    if (req.query.search) {
      filters.search = req.query.search as string;
    }
    
    if (req.query.startDate) {
      filters.startDate = req.query.startDate as string;
    }
    
    if (req.query.endDate) {
      filters.endDate = req.query.endDate as string;
    }
    
    if (req.query.userId) {
      filters.userId = parseInt(req.query.userId as string, 10);
    }

    const issues = IssueModel.findAll(filters);
    const total = IssueModel.count();

    res.json({
      issues,
      total,
      limit: filters.limit,
      offset: filters.offset,
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
}

export async function getIssue(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid issue ID' });
    }

    const issue = IssueModel.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
}

export async function createIssue(req: Request, res: Response) {
  try {
    const data: CreateIssueRequest & { userId?: number } = req.body;
    const userId = (req as any).userId || data.userId; // Get from auth middleware or body

    // Validation
    if (!data.title || !data.description || !data.category) {
      return res.status(400).json({ error: 'Missing required fields: title, description, category' });
    }

    if (typeof data.location_lat !== 'number' || typeof data.location_lng !== 'number') {
      return res.status(400).json({ error: 'Invalid location coordinates' });
    }

    if (data.images && !Array.isArray(data.images)) {
      return res.status(400).json({ error: 'Images must be an array' });
    }

    // Limit images to 3
    if (data.images && data.images.length > 3) {
      return res.status(400).json({ error: 'Maximum 3 images allowed' });
    }

    const issue = IssueModel.create(data, userId);
    res.status(201).json(issue);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
}

export async function updateIssue(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid issue ID' });
    }

    // Check if issue exists
    const existingIssue = IssueModel.findById(id);
    if (!existingIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const data: UpdateIssueRequest & { userId?: number } = req.body;
    const userId = (req as any).userId || data.userId;

    // Check permissions:
    // - Admin can update status and notes
    // - Users can only update their own issues (title, description, category, images, contact)
    // - Users cannot update status or notes
    const isUserOwnIssue = userId && existingIssue.user_id === userId;
    const hasAdminFields = data.status !== undefined || data.notes !== undefined;
    const hasUserFields = data.title !== undefined || data.description !== undefined || 
                         data.category !== undefined || data.images !== undefined ||
                         data.contact_name !== undefined || data.contact_phone !== undefined;

    if (isUserOwnIssue && hasUserFields) {
      // User editing their own issue - restrict to user-editable fields only
      const userEditableData: UpdateIssueRequest = {
        title: data.title,
        description: data.description,
        category: data.category,
        images: data.images,
        contact_name: data.contact_name,
        contact_phone: data.contact_phone,
      };
      // Remove undefined fields
      Object.keys(userEditableData).forEach(key => {
        if (userEditableData[key as keyof UpdateIssueRequest] === undefined) {
          delete userEditableData[key as keyof UpdateIssueRequest];
        }
      });
      const issue = IssueModel.update(id, userEditableData);
      return res.json(issue);
    } else if (hasAdminFields) {
      // Admin update (status and notes) - requires admin token which is checked by requireAdmin middleware
      const adminData: UpdateIssueRequest = {
        status: data.status,
        notes: data.notes,
        priority: data.priority,
      };
      // Remove undefined fields
      Object.keys(adminData).forEach(key => {
        if (adminData[key as keyof UpdateIssueRequest] === undefined) {
          delete adminData[key as keyof UpdateIssueRequest];
        }
      });
      
      // Check if status changed
      const statusChanged = data.status && data.status !== existingIssue.status;
      
      const issue = IssueModel.update(id, adminData);
      
      // Send notification if status changed and user has push token
      if (statusChanged && issue && existingIssue.user_id) {
        try {
          const { PushTokenModel } = await import('../models/pushToken');
          const tokens = PushTokenModel.findByUserId(existingIssue.user_id);
          
          for (const token of tokens) {
            await sendIssueStatusNotification(token.token, issue.title, data.status!);
          }
        } catch (error) {
          console.error('Error sending notification:', error);
          // Don't fail the request if notification fails
        }
      }
      
      return res.json(issue);
    } else if (!isUserOwnIssue && hasUserFields) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own issues' });
    } else {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Failed to update issue' });
  }
}

export async function exportIssues(req: Request, res: Response) {
  try {
    const issues = IssueModel.findAllForExport();

    // CSV header
    const headers = [
      'ID',
      'Title',
      'Description',
      'Category',
      'Latitude',
      'Longitude',
      'Status',
      'Contact Name',
      'Contact Phone',
      'Created At',
      'Notes',
    ];

    // CSV rows
    const rows = issues.map((issue) => {
      const images = issue.images ? JSON.parse(issue.images) : [];
      return [
        issue.id,
        `"${(issue.title || '').replace(/"/g, '""')}"`,
        `"${(issue.description || '').replace(/"/g, '""')}"`,
        issue.category,
        issue.location_lat,
        issue.location_lng,
        issue.status,
        issue.contact_name || '',
        issue.contact_phone || '',
        issue.created_at,
        `"${((issue.notes || '').replace(/"/g, '""'))}"`,
        `"${images.length} images"`,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=issues-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting issues:', error);
    res.status(500).json({ error: 'Failed to export issues' });
  }
}

export async function getIssueImage(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const index = parseInt(req.params.index, 10);

    if (isNaN(id) || isNaN(index)) {
      return res.status(400).json({ error: 'Invalid issue ID or image index' });
    }

    const issue = IssueModel.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (!issue.images || index < 0 || index >= issue.images.length) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imageDataUrl = issue.images[index];
    
    // If it's a base64 data URL, extract and return it
    if (imageDataUrl.startsWith('data:')) {
      const [header, base64] = imageDataUrl.split(',');
      const mimeMatch = header.match(/data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      
      const buffer = Buffer.from(base64, 'base64');
      res.setHeader('Content-Type', mimeType);
      res.send(buffer);
    } else {
      // If it's a file path, serve it (for future file storage)
      res.status(404).json({ error: 'Image file not found' });
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}

export async function getStatistics(req: Request, res: Response) {
  try {
    const statistics = IssueModel.getStatistics();
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}

