// src/utils/email.service.ts
import nodemailer from "nodemailer";

export const sendSignedDocumentEmail = async (to: string, documentUrl: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"DocSign App" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Signed Document",
    text: `Please find your signed document: ${documentUrl}`,
    html: `<p>Please find your signed document: <a href="${documentUrl}">Download</a></p>`,
  });
};
