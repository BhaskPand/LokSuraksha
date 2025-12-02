import { Router } from 'express';
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  exportIssues,
  getIssueImage,
} from '../controllers/issues';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getIssues);
router.get('/export.csv', requireAdmin, exportIssues);
router.get('/:id', getIssue);
router.get('/:id/image/:index', getIssueImage);
router.post('/', createIssue);
router.patch('/:id', requireAdmin, updateIssue);

export default router;

