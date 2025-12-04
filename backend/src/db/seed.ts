import { db, initDatabase } from './database';
import { IssueStatus } from '@citizen-safety/shared';

const sampleIssues = [
  {
    title: 'Pothole on Main Street',
    description: 'Large pothole near the intersection causing vehicle damage',
    category: 'Roads',
    location_lat: 40.7128,
    location_lng: -74.006,
    images: JSON.stringify([]),
    status: 'open' as IssueStatus,
    contact_name: 'John Doe',
    contact_phone: '+1234567890',
  },
  {
    title: 'Broken Streetlight',
    description: 'Streetlight not working on 5th Avenue',
    category: 'Infrastructure',
    location_lat: 40.7589,
    location_lng: -73.9851,
    images: JSON.stringify([]),
    status: 'in_progress' as IssueStatus,
  },
];

export function seedDatabase() {
  console.log('Seeding database...');
  
  // Check if issues already exist
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM issues').get() as { count: number };
  if (existingCount.count > 0) {
    console.log(`Database already has ${existingCount.count} issues. Skipping seed.`);
    return;
  }
  
  const stmt = db.prepare(`
    INSERT INTO issues (user_id, title, description, category, location_lat, location_lng, images, status, contact_name, contact_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((issues) => {
    for (const issue of issues) {
      stmt.run(
        null, // user_id - null for sample data
        issue.title,
        issue.description,
        issue.category,
        issue.location_lat,
        issue.location_lng,
        issue.images,
        issue.status,
        issue.contact_name || null,
        issue.contact_phone || null
      );
    }
  });

  insertMany(sampleIssues);
  console.log(`Seeded ${sampleIssues.length} sample issues`);
}

if (require.main === module) {
  // Initialize database before seeding
  initDatabase();
  seedDatabase();
}


