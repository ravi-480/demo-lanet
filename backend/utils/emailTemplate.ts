export const paymentConfirmationTemplate = (paymentData) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #3B82F6;">EventWise</h2>
          <p style="color: #6B7280;">Payment Confirmation</p>
        </div>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #1F2937;">Payment Successful</h3>
          <p>Your payment of <strong>₹${paymentData.amount}</strong> has been processed successfully.</p>
          
          <div style="margin-top: 15px;">
            <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${paymentData.paymentId}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(paymentData.timestamp).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Event:</strong> ${paymentData.eventName}</p>
          </div>
        </div>
        
        <div style="text-align: center; color: #6B7280; font-size: 12px;">
          <p>Thank you for using EventWise for your event planning needs.</p>
          <p>If you have any questions, please contact us at support@eventwise.com</p>
        </div>
      </div>
    `;
  };
  