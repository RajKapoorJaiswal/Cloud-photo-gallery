import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded reliably from the server directory regardless of process.cwd()
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const getSmtpConfig = () => {
  // Re-run dotenv.config if variables are not yet present in process.env
  if (!process.env.SMTP_USER && !process.env.EMAIL_USER) {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : port === 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || (user ? `Cloud Photo Gallery <${user}>` : '"Cloud Photo Gallery" <no-reply@cloudphotogallery.com>');

  return { host, port, secure, user, pass, from };
};

export const logSmtpDiagnostic = () => {
  const config = getSmtpConfig();
  console.log('--- SMTP Diagnostic Check ---');
  console.log(`SMTP_HOST configured: ${Boolean(config.host)}`);
  console.log(`SMTP_PORT configured: ${Boolean(config.port)}`);
  console.log(`SMTP_USER configured: ${Boolean(config.user)}`);
  console.log(`SMTP_PASS configured: ${Boolean(config.pass)}`);
  console.log('-----------------------------');
};

export const createTransporter = () => {
  const config = getSmtpConfig();
  if (!config.user || !config.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const verifySmtpConnection = async () => {
  const config = getSmtpConfig();
  if (!config.user || !config.pass) {
    return { success: false, reason: 'SMTP credentials (SMTP_USER / SMTP_PASS) are missing in server/.env' };
  }

  const transporter = createTransporter();
  try {
    await transporter.verify();
    return { success: true, host: config.host, port: config.port, user: config.user };
  } catch (error) {
    return { success: false, reason: error.message };
  }
};

export const sendOtpEmail = async ({ to, name, otp }) => {
  const config = getSmtpConfig();

  if (!config.user || !config.pass) {
    console.error('[SMTP ERROR] Missing SMTP credentials (SMTP_USER / SMTP_PASS) in server/.env');
    throw new Error('SMTP credentials are not configured on the server.');
  }

  const transporter = createTransporter();
  if (!transporter) {
    throw new Error('Failed to initialize SMTP transporter.');
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 32px; border-radius: 16px; max-width: 520px; margin: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #38bdf8; margin: 0; font-size: 26px; font-weight: 800;">Cloud Photo Gallery</h2>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Secure Account Password Recovery</p>
      </div>
      <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <p style="font-size: 16px; margin-top: 0;">Hello <strong>${name || 'User'}</strong>,</p>
        <p style="font-size: 15px; color: #cbd5e1; line-height: 1.5;">
          You requested a password reset for your Cloud Photo Gallery account. Use the 6-digit Verification Code (OTP) below to complete the verification process:
        </p>
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px dashed #38bdf8; padding: 18px; border-radius: 12px; text-align: center; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #38bdf8; margin: 24px 0;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">
          ⏳ This code is valid for <strong>10 minutes</strong> and can only be used once. Do not share this code with anyone.
        </p>
      </div>
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">
        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject: '🔑 Password Reset OTP Code - Cloud Photo Gallery',
      text: `Your password reset OTP is: ${otp}. It expires in 10 minutes.`,
      html: htmlContent,
    });

    console.log(`[SMTP SUCCESS] OTP email accepted by SMTP server for ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP ERROR] Delivery failed for ${to}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};
