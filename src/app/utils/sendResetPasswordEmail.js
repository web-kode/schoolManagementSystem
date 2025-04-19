import nodemailer from 'nodemailer';
import dotenv from "dotenv"
dotenv.config({ path: '.env' });

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendResetPasswordEmail(to, { name, resetURL }) {
  const mailOptions = {
    from: `"School Management" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to the School Portal',
    html: `
      <p>Hello ${name},</p>
      <p>Click the link below to reset your password. This link is valid for 30 minutes:</p>
      <a href="${resetURL}" target="_blank">${resetURL}</a>
      <br/><br/>
      <p>If you did not request this, please ignore this email.</p>
      <p>Regards,<br/>Admin Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}