import nodemailer from 'nodemailer';

const nodemailer = require('nodemailer');

export async function sendMail(
  receiver: string,
  subject: string,
  body: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'hrmsmailer0405@gmail.com',
        pass: 'fcypujojuvyhhmus',
      },
    });

    const mailOptions = {
      from: 'hrmsmailer0405@gmail.com',
      to: receiver,
      subject,
      text: body,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error: unknown) {
    let message = 'Failed to send email';
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      message = (error as { message: string }).message;
    }
    return {
      success: false,
      message,
    };
  }
}

