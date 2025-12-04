import { Request, Response } from 'express';
import { UserModel, CreateUserRequest } from '../models/user';
import { sendOTPEmail } from '../utils/emailService';
import { sendOTPSMS } from '../utils/smsService';
import crypto from 'crypto';

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function signup(req: Request, res: Response) {
  try {
    const data: CreateUserRequest = req.body;

    if (!data.email || !data.password || !data.name) {
      return res.status(400).json({ error: 'Missing required fields: email, password, name' });
    }

    if (data.password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const user = UserModel.create(data);

    // Generate and send email OTP
    const emailOTP = UserModel.generateOTP();
    UserModel.setOTP(user.id, 'email', emailOTP);
    await sendOTPEmail(user.email, emailOTP);

    // Generate and send phone OTP if phone provided
    let phoneOTP: string | null = null;
    if (data.phone) {
      phoneOTP = UserModel.generateOTP();
      UserModel.setOTP(user.id, 'phone', phoneOTP);
      await sendOTPSMS(data.phone, phoneOTP);
    }

    // Don't return token - user needs to verify first
    res.status(201).json({
      message: 'Account created. Please verify your email and phone to continue.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        email_verified: false,
        phone_verified: false,
      },
      requiresVerification: true,
      // In development, return OTPs for testing (remove in production)
      ...(process.env.NODE_ENV === 'development' && {
        dev_otps: {
          email_otp: emailOTP,
          phone_otp: phoneOTP,
        },
      }),
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const isValid = UserModel.verifyPassword(email, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: 'Email not verified',
        requiresVerification: true,
        email_verified: false,
        phone_verified: user.phone_verified,
      });
    }

    const token = generateToken();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, phone } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = UserModel.update(userId, { name: name.trim(), phone: phone?.trim() || null });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = UserModel.verifyPassword(user.email, currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    UserModel.updatePassword(userId, newPassword);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
}

export async function sendVerificationOTP(req: Request, res: Response) {
  try {
    const { email, type } = req.body; // type: 'email' or 'phone'

    if (!email || !type) {
      return res.status(400).json({ error: 'Email and type are required' });
    }

    const user = UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (type === 'email') {
      if (user.email_verified) {
        return res.status(400).json({ error: 'Email already verified' });
      }
      const otp = UserModel.generateOTP();
      UserModel.setOTP(user.id, 'email', otp);
      await sendOTPEmail(user.email, otp);
      
      res.json({ 
        message: 'Verification OTP sent to email',
        // In development, return OTP for testing
        ...(process.env.NODE_ENV === 'development' && { dev_otp: otp }),
      });
    } else if (type === 'phone') {
      if (!user.phone) {
        return res.status(400).json({ error: 'Phone number not provided' });
      }
      if (user.phone_verified) {
        return res.status(400).json({ error: 'Phone already verified' });
      }
      const otp = UserModel.generateOTP();
      UserModel.setOTP(user.id, 'phone', otp);
      await sendOTPSMS(user.phone, otp);
      
      res.json({ 
        message: 'Verification OTP sent to phone',
        // In development, return OTP for testing
        ...(process.env.NODE_ENV === 'development' && { dev_otp: otp }),
      });
    } else {
      return res.status(400).json({ error: 'Invalid type. Use "email" or "phone"' });
    }
  } catch (error) {
    console.error('Error sending verification OTP:', error);
    res.status(500).json({ error: 'Failed to send verification OTP' });
  }
}

export async function verifyOTP(req: Request, res: Response) {
  try {
    const { email, otp, type } = req.body; // type: 'email' or 'phone'

    if (!email || !otp || !type) {
      return res.status(400).json({ error: 'Email, OTP, and type are required' });
    }

    const user = UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = UserModel.verifyOTP(user.id, type, otp);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Get updated user
    const updatedUser = UserModel.findById(user.id);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email_verified: updatedUser.email_verified,
        phone_verified: updatedUser.phone_verified,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
}

export async function deleteAccount(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user and all associated data
    const deleted = UserModel.delete(userId);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
}

export async function registerPushToken(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { token, platform } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    const { PushTokenModel } = await import('../models/pushToken');
    PushTokenModel.create(userId, token, platform);

    res.json({ message: 'Push token registered successfully' });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
}




