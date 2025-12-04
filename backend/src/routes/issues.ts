import { Router } from 'express';
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  exportIssues,
  getIssueImage,
  getStatistics,
} from '../controllers/issues';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', getIssues);
router.get('/statistics', getStatistics);
router.get('/export.csv', requireAdmin, exportIssues);
router.get('/:id', getIssue);
router.get('/:id/image/:index', getIssueImage);
router.post('/', createIssue);
// Allow authenticated users to update their own issues, or admins to update any issue
router.patch('/:id', requireAuth, updateIssue);

export default router;



