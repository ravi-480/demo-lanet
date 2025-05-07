const ApiUrl = process.env.BASE_URL;

import { sendEmail } from "../services/emailService";
export const paymentConfirmationTemplate = (paymentData: {
  amount: any;
  paymentId: any;
  timestamp: string | number | Date;
  eventName: any;
}) => {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #3B82F6;">EventWise</h2>
          <p style="color: #6B7280;">Payment Confirmation</p>
        </div>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #1F2937;">Payment Successful</h3>
          <p>Your payment of <strong>₹${
            paymentData.amount
          }</strong> has been processed successfully.</p>
          
          <div style="margin-top: 15px;">
            <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${
              paymentData.paymentId
            }</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(
              paymentData.timestamp
            ).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Event:</strong> ${
              paymentData.eventName
            }</p>
          </div>
        </div>
        
        <div style="text-align: center; color: #6B7280; font-size: 12px;">
          <p>Thank you for using EventWise for your event planning needs.</p>
          <p>If you have any questions, please contact us at support@eventwise.com</p>
        </div>
      </div>
    `;
};

export const sendBudgetWarningEmail = async (
  email: string,
  eventTitle: string,
  budgetLimit: number,
  spentAmount: number,
  percentage: number
) => {
  const subject = `Budget Alert: You've used 90% of your budget for ${eventTitle}`;

  const text = `
      Budget Alert for ${eventTitle}
      
      You have used ${percentage.toFixed(2)}% of your budget.
      Budget limit: ₹${budgetLimit.toFixed(2)}
      Amount spent: ₹${spentAmount.toFixed(2)}
      Remaining budget: ₹${(budgetLimit - spentAmount).toFixed(2)}
      
      Please review your expenses and adjust your budget if needed.
    `;

  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #e67e22;">Budget Alert</h2>
        <p>You have used <strong>${percentage.toFixed(
          2
        )}%</strong> of your budget for <strong>${eventTitle}</strong>.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Budget Limit:</strong> ₹${budgetLimit.toFixed(2)}</p>
          <p><strong>Amount Spent:</strong> ₹${spentAmount.toFixed(2)}</p>
          <p><strong>Remaining Budget:</strong> ₹${(
            budgetLimit - spentAmount
          ).toFixed(2)}</p>
        </div>
        
        <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #e67e22; margin: 20px 0;">
          <p>Please review your expenses and adjust your budget if needed.</p>
        </div>
      </div>
    `;

  await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};

// Function to send an alert when budget exceeds 100%
export const sendBudgetExceededEmail = async (
  email: string,
  eventTitle: string,
  budgetLimit: number,
  spentAmount: number,
  percentage: number
) => {
  const subject = `Urgent: Budget Exceeded for ${eventTitle}`;

  const text = `
      Budget Alert for ${eventTitle}
      
      Your budget has been exceeded. You have used ${percentage.toFixed(
        2
      )}% of your allocated budget.
      Budget limit: ₹${budgetLimit.toFixed(2)}
      Amount spent: ₹${spentAmount.toFixed(2)}
      Overspent amount: ₹${(spentAmount - budgetLimit).toFixed(2)}
      
      Please review your expenses immediately and consider increasing your budget limit.
    `;

  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #e74c3c;">Budget Exceeded</h2>
        <p>Your budget for <strong>${eventTitle}</strong> has been exceeded. You have used <strong>${percentage.toFixed(
    2
  )}%</strong> of your allocated budget.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Budget Limit:</strong> ₹${budgetLimit.toFixed(2)}</p>
          <p><strong>Amount Spent:</strong> ₹${spentAmount.toFixed(2)}</p>
          <p><strong>Overspent Amount:</strong> ₹${(
            spentAmount - budgetLimit
          ).toFixed(2)}</p>
        </div>
        
        <div style="background-color: #fdeaea; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;">
          <p>Please review your expenses immediately and consider increasing your budget limit.</p>
        </div>
      </div>
    `;

  await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};

export const sendForgotPasswordEmail = async (
  email: string,
  resetToken: string
) => {
  const subject = "Password Reset Request";

  const resetUrl = `${ApiUrl}/${resetToken}`;

  const text = `
    You requested a password reset.

    Please click the link below to reset your password:
    ${resetUrl}

    If you did not request this, please ignore this email.

    This link will expire in 10 minutes.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #2c3e50;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested a password reset for your account associated with this email address.</p>
      
      <div style="margin: 20px 0; text-align: center;">
        <a href="${resetUrl}" style="background-color: #3498db; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </div>

      <p>If the button doesn't work, copy and paste the link below into your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>

      <div style="background-color: #fef9e7; padding: 15px; border-left: 4px solid #f1c40f; margin: 20px 0;">
        <p>This link is valid for 10 minutes. If you did not request this reset, you can safely ignore this email.</p>
      </div>

      <p style="color: #95a5a6; font-size: 12px;">Thank you,</p>
      <p style="color: #95a5a6; font-size: 12px;">The Support Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};
export const getRefundSplitEmailTemplate = (
  previousAmount: number,
  newAmount: number,
  eventId: string,
  userId: string
): { subject: string; text: string; html: string } => {
  const subject = "Updated Split Expense Request";

  const confirmUrl = `${ApiUrl}/split/confirm?eventId=${eventId}&userId=${userId}`;

  const text = `
Hello Friend,

The expenses for an event you previously paid for have been recalculated.

You previously paid: ₹${previousAmount}
Your new share amount: ₹${newAmount}

Your previous payment has been marked as refunded in our system. To confirm your new share amount, please click the link below:
${confirmUrl}

If you did not expect this request, you can ignore this email.
  `;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px;">
  <h2 style="color: #2c3e50;">Updated Split Expense</h2>
  <p>Dear Friend,</p>
  
  <div style="background-color: #f8f9fa; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #0ea5e9;">
    <p style="margin: 0 0 8px 0;">The event expenses have been recalculated.</p>
    <p style="margin: 0 0 4px 0;"><strong>You previously paid:</strong> <span style="color: #6b7280;">₹${previousAmount}</span></p>
    <p style="margin: 0;"><strong>Your new share amount:</strong> <span style="color: #0ea5e9;">₹${newAmount}</span></p>
  </div>
  
  <p>Your previous payment has been marked as refunded in our system. Please confirm your new share amount.</p>

  <div style="margin: 24px 0; text-align: center;">
    <a href="${confirmUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
      Confirm New Amount
    </a>
  </div>

  <p>If the button above doesn't work, copy and paste this link into your browser:</p>
  <p style="word-break: break-all;">${confirmUrl}</p>

  <p style="color: #888; font-size: 12px;">If you did not expect this email, you can safely ignore it.</p>
  <p style="color: #888; font-size: 12px;">– Split App Team</p>
</div>
`;

  return { subject, text, html };
};

// Original template for new requests
export const getSplitRequestEmailTemplate = (
  amount: number,
  eventId: string,
  userId: string
): { subject: string; text: string; html: string } => {
  const subject = "Split Expense Request";

  const confirmUrl = `${ApiUrl}/split/confirm?eventId=${eventId}&userId=${userId}`;

  const text = `
Hello Friend,

You've been invited to confirm your share of a split expense of ₹${amount}.

Please click the link below to confirm:
${confirmUrl}

If you did not expect this request, you can ignore this email.
  `;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px;">
  <h2 style="color: #2c3e50;">Split Expense Confirmation</h2>
  <p>Dear Friend,</p>
  <p>You've been asked to confirm your share of a split expense totaling <strong>₹${amount}</strong>.</p>

  <div style="margin: 24px 0; text-align: center;">
    <a href="${confirmUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
      Confirm Your Share
    </a>
  </div>

  <p>If the button above doesn't work, copy and paste this link into your browser:</p>
  <p style="word-break: break-all;">${confirmUrl}</p>

  <p style="color: #888; font-size: 12px;">If you did not expect this email, you can safely ignore it.</p>
  <p style="color: #888; font-size: 12px;">– Split App Team</p>
</div>
`;

  return { subject, text, html };
};
