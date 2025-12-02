import { Router } from 'express';
import { signup, login, getProfile } from '../controllers/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', requireAuth, getProfile);

export default router;

