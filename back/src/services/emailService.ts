import nodemailer from "nodemailer";
import logger from "../utils/logger";

// Create a Nodemailer transporter using AWS SES SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SES_SMTP_HOST!,
  port: Number(process.env.SES_SMTP_PORT!),
  auth: {
    user: process.env.SES_SMTP_USER!,
    pass: process.env.SES_SMTP_PASS!,
  },
});

// Function to send confirmation email
export const sendConfirmationEmail = async (email: string, token: string) => {
  const confirmationUrl = `${process.env.FRONTEND_URL}/auth/confirm-email/${token}`;

  const mailOptions = {
    from: process.env.SES_EMAIL_SOURCE!,
    to: email,
    subject: "0dev.io - Confirm your email",
    text: `Please confirm your email by clicking the following link: ${confirmationUrl}`,
    html: `<p>Please confirm your email by clicking the following link: <a href="${confirmationUrl}">${confirmationUrl}</a></p>`, // HTML version
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent to:", email);
  } catch (error) {
    logger.error("Error sending email:", error);
  }
};

// Function to send invitation email
export const sendInvitationEmail = async (
  email: string,
  invitationLink: string
) => {
  const mailOptions = {
    from: process.env.SES_EMAIL_SOURCE!,
    to: email,
    subject: "You're invited to join 0dev.io",
    text: `You're invited to join 0dev.io! Click the following link to sign up: ${invitationLink}`,
    html: `<p>You're invited to join 0dev.io! Click the following link to sign up: <a href="${invitationLink}">${invitationLink}</a></p>`, // HTML version
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Invitation email sent to:", email);
  } catch (error) {
    logger.error("Error sending email:", error);
  }
};
