import { sendEmail } from "./emailService";
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
