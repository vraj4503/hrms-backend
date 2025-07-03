import 'dotenv/config';
import { sendMail } from './email';

async function main() {
  const response = await sendMail(
    'YOUR_EMAIL@gmail.com', // <-- Replace with your real email
    'Test Email from HRMS',
    'This is a test email from your HRMS backend.'
  );
  console.log('Test email result:', response);
}

main();