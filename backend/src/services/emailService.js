import nodemailer from 'nodemailer';

export const isEmailDeliveryConfigured = () => Boolean(
  process.env.SMTP_HOST &&
  Number(process.env.SMTP_PORT) > 0 &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASSWORD &&
  process.env.MAIL_FROM &&
  process.env.CLIENT_URL
);

export const sendVerificationEmail = async ({ email, name, verificationUrl }) => {
  if (!isEmailDeliveryConfigured()) {
    throw new Error('Email delivery is not configured.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Verify your ConnectSphere email',
    text: `Hi ${name},\n\nVerify your email address to finish setting up your ConnectSphere account:\n${verificationUrl}\n\nThis link expires in 24 hours. If you did not create this account, you can ignore this message.`
  });
};

export default { isEmailDeliveryConfigured, sendVerificationEmail };
