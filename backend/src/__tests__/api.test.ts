import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { initDatabase } from '../db/database';
import issuesRouter from '../routes/issues';

// Create test app
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.get('/api/ping', (req, res) => res.json({ ok: true }));
app.use('/api/issues', issuesRouter);

// Set up test database
beforeAll(() => {
  process.env.DATABASE_PATH = ':memory:';
  process.env.ADMIN_TOKEN = 'test-admin-token';
  initDatabase();
});

describe('API Endpoints', () => {
  describe('GET /api/ping', () => {
    it('should return { ok: true }', async () => {
      const response = await request(app).get('/api/ping');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
    });
  });

  describe('POST /api/issues', () => {
    it('should create a new issue', async () => {
      const issueData = {
        title: 'Test Issue',
        description: 'This is a test issue',
        category: 'Test',
        location_lat: 40.7128,
        location_lng: -74.006,
      };

      const response = await request(app).post('/api/issues').send(issueData);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(issueData.title);
      expect(response.body.status).toBe('open');
    });

    it('should reject issue with missing required fields', async () => {
      const response = await request(app).post('/api/issues').send({
        title: 'Incomplete Issue',
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept issue with images', async () => {
      const issueData = {
        title: 'Issue with Images',
        description: 'Test with images',
        category: 'Test',
        location_lat: 40.7128,
        location_lng: -74.006,
        images: ['data:image/jpeg;base64,/9j/4AAQSkZJRg=='],
      };

      const response = await request(app).post('/api/issues').send(issueData);
      expect(response.status).toBe(201);
      expect(response.body.images).toHaveLength(1);
    });
  });

  describe('GET /api/issues', () => {
    it('should return list of issues', async () => {
      const response = await request(app).get('/api/issues');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('issues');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.issues)).toBe(true);
    });

    it('should support limit parameter', async () => {
      const response = await request(app).get('/api/issues?limit=1');
      expect(response.status).toBe(200);
      expect(response.body.issues.length).toBeLessThanOrEqual(1);
    });
  });
});

