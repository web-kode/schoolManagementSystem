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

export async function sendLoginEmail(to, { name, email, password }) {
  const mailOptions = {
    from: `"School Management" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Welcome to the School Portal',
    html: `
      <p>Dear ${name},</p> 
      <p>Your account has been created. Here are your login credentials:</p>
      <ul>
        <li><strong>Email : </strong> ${email}</li>
        <li><strong>Password : </strong> ${password}</li>
      </ul>
      <p>Kindly change your password after login for better security.</p>
      <p>Regards,<br/>Admin Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
