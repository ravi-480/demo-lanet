import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ApiError from "./ApiError";

dotenv.config(); // ✅ Load environment variables

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // ✅ Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // ✅ Define email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // ✅ Send email
    await transporter.sendMail(mailOptions);
    console.log(`📩 Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new ApiError(500, "Failed to send email");
  }
};
