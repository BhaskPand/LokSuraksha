// Email service for sending OTP
// In production, use nodemailer or similar service
// For development, we'll log the OTP to console

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  // In production, implement actual email sending using nodemailer, SendGrid, etc.
  // For now, log to console for development
  console.log('='.repeat(50));
  console.log('📧 EMAIL OTP VERIFICATION');
  console.log('='.repeat(50));
  console.log(`To: ${email}`);
  console.log(`OTP: ${otp}`);
  console.log('='.repeat(50));
  console.log('In production, this would be sent via email service');
  console.log('='.repeat(50));

  // Simulate async email sending
  await new Promise(resolve => setTimeout(resolve, 100));
}

// For production, you would use:
/*
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'LokSuraksha - Email Verification OTP',
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP for email verification is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
}
*/

