import * as nodemailer from 'nodemailer';

export async function sendMail(
  receiver: string,
  subject: string,
  body: string
): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user:"hrmsmailer0405@gmail.com",
        pass:"fcypujojuvyhhmus",
      },
    });

    const mailOptions = {
      from: "hrmsmailer0405@gmail.com",
      to: receiver,
      subject,
      text: body,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to send email' };
  }
} 