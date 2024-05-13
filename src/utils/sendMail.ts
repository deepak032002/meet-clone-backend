import * as nodemailer from 'nodemailer';

async function sendMail(email: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    service: 'gmail',
    secure: true,
  });

  return transporter.sendMail({
    from: 'locksevagyaan@gmail.com',
    to: email,
    subject: subject,
    html: html,
  });
}

export default sendMail;
