import { Router } from 'express';
import { signup, login, getProfile, updateProfile, changePassword, sendVerificationOTP, verifyOTP, deleteAccount, registerPushToken } from '../controllers/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/send-otp', sendVerificationOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register-push-token', requireAuth, registerPushToken);
router.get('/profile', requireAuth, getProfile);
router.patch('/profile', requireAuth, updateProfile);
router.patch('/password', requireAuth, changePassword);
router.delete('/delete-account', requireAuth, deleteAccount);

export default router;




