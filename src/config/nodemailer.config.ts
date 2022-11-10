import nodemailer from 'nodemailer';

export const Transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(<string>process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});
