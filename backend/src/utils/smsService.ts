// SMS service for sending OTP
// In production, use Twilio, AWS SNS, or similar service
// For development, we'll log the OTP to console

export async function sendOTPSMS(phone: string, otp: string): Promise<void> {
  // In production, implement actual SMS sending using Twilio, AWS SNS, etc.
  // For now, log to console for development
  console.log('='.repeat(50));
  console.log('📱 SMS OTP VERIFICATION');
  console.log('='.repeat(50));
  console.log(`To: ${phone}`);
  console.log(`OTP: ${otp}`);
  console.log('='.repeat(50));
  console.log('In production, this would be sent via SMS service');
  console.log('='.repeat(50));

  // Simulate async SMS sending
  await new Promise(resolve => setTimeout(resolve, 100));
}

// For production, you would use Twilio:
/*
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOTPSMS(phone: string, otp: string): Promise<void> {
  await client.messages.create({
    body: `Your LokSuraksha verification code is: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}
*/

