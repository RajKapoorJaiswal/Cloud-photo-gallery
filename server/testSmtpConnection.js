import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import { verifySmtpConnection, getSmtpConfig } from './utils/email.js';

async function main() {
  console.log('====================================================');
  console.log('--- Cloud Photo Gallery SMTP Connection Diagnostics ---');
  console.log('====================================================\n');

  const config = getSmtpConfig();
  console.log('Configured Settings:');
  console.log(`- SMTP Host   : ${config.host}`);
  console.log(`- SMTP Port   : ${config.port}`);
  console.log(`- SSL/TLS     : ${config.secure}`);
  console.log(`- Sender Email: ${config.user || '(NOT CONFIGURED)'}`);
  console.log(`- Password    : ${config.pass ? '******** (configured)' : '(NOT CONFIGURED)'}`);
  console.log(`- From Header : ${config.from}\n`);

  if (!config.user || !config.pass) {
    console.error('❌ FAILURE: SMTP credentials (SMTP_USER / SMTP_PASS) are missing in server/.env');
    console.log('\nPlease add the following lines to server/.env:');
    console.log('SMTP_HOST=smtp.gmail.com');
    console.log('SMTP_PORT=465');
    console.log('SMTP_SECURE=true');
    console.log('SMTP_USER=your_registered_sender@gmail.com');
    console.log('SMTP_PASS=your_16_character_google_app_password');
    console.log('EMAIL_FROM=Cloud Photo Gallery <your_registered_sender@gmail.com>\n');
    process.exit(1);
  }

  console.log('Testing connection to SMTP server...');
  const result = await verifySmtpConnection();

  if (result.success) {
    console.log('✅ SUCCESS: Connected and authenticated successfully with Gmail SMTP server!');
    console.log(`Ready to send OTP emails from ${result.user}`);
  } else {
    console.error('❌ SMTP CONNECTION FAILED:');
    console.error(`Reason: ${result.reason}\n`);
    console.log('Troubleshooting Tips for Gmail:');
    console.log('1. Ensure 2-Step Verification is enabled on your Google Account.');
    console.log('2. Generate a 16-character App Password at: https://myaccount.google.com/apppasswords');
    console.log('3. Use the App Password in SMTP_PASS (do NOT use your main Google password).');
    console.log('4. Ensure SMTP_HOST=smtp.gmail.com and SMTP_PORT=465 with SMTP_SECURE=true.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected Diagnostic Error:', err);
  process.exit(1);
});
