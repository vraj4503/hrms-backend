import 'dotenv/config';
import { sendMail } from "./email"; 

(async () => {
  const response = await sendMail(
    'vraj-prajapati@anantamit.com',
    'Test Email',
    'Hello! This is a test email from HRMS system.'
  );
  console.log(response);
})();