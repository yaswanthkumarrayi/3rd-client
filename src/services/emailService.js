// Frontend Email Service for Ashok Kumar Textiles
// Using Gmail + Nodemailer backend

/**
 * @typedef {Object} OrderEmailData
 * @property {string} orderNumber
 * @property {string} customerName
 * @property {string} customerEmail
 * @property {string} customerPhone
 * @property {Array} items
 * @property {number} totalAmount
 * @property {Object} shippingAddress
 * @property {string} paymentId
 */

/**
 * @typedef {Object} ContactFormData
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} subject
 * @property {string} message
 */

class EmailService {
  constructor() {
    // Use Vercel domain for production, localhost for development
    if (import.meta.env.PROD) {
      this.emailServerUrl = window.location.origin;
    } else {
      this.emailServerUrl = 'http://localhost:5000'; // Changed to port 5000 to match our Express server
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  }

  generateOrderEmailHTML(orderData) {
    const itemsHTML = orderData.items.map(item => {
      const details = [];
      if (item.color) details.push(`Color: ${item.color}`);
      if (item.size) details.push(`Size: ${item.size}`);
      const detailsStr = details.length > 0 ? `<br><small>${details.join(' | ')}</small>` : '';
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong>
            ${detailsStr}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatPrice(item.price)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatPrice(item.price * item.quantity)}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order - ${orderData.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .table th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .total-row { background: #f0f8ff; font-weight: bold; }
          .address { background: #f8f9fa; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 12px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 New Order Received!</h1>
            <p>Order #${orderData.orderNumber}</p>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Ashok Kumar Textiles Admin Notification</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>⚡ Action Required:</strong> A new order has been placed and requires your attention.
              <br><strong>📅 Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}
            </div>

            <div class="order-details">
              <h2 style="margin-top: 0; color: #2563eb;">👤 Customer Information</h2>
              <p><strong>Name:</strong> ${orderData.customerName}</p>
              <p><strong>Email:</strong> <a href="mailto:${orderData.customerEmail}">${orderData.customerEmail}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${orderData.customerPhone}">${orderData.customerPhone}</a></p>
              <p><strong>Payment ID:</strong> ${orderData.paymentId}</p>
            </div>

            <div class="order-details">
              <h2 style="margin-top: 0; color: #2563eb;">🛍️ Order Items</h2>
              <table class="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr class="total-row">
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 16px;"><strong>Grand Total:</strong></td>
                    <td style="padding: 12px; text-align: right; font-size: 16px; color: #2563eb;"><strong>${this.formatPrice(orderData.totalAmount)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="address">
              <h3 style="margin-top: 0; color: #2563eb;">📍 Shipping Address</h3>
              <p style="margin: 0;">
                ${orderData.shippingAddress.street}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}<br>
                ${orderData.shippingAddress.country}
              </p>
            </div>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #2563eb;">📋 Next Steps</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Review and confirm the order details</li>
                <li>Verify payment status in Razorpay dashboard</li>
                <li>Prepare items for packaging</li>
                <li>Generate shipping label and tracking number</li>
                <li>Update customer with shipping confirmation</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0; font-weight: bold;">Ashok Kumar Textiles Admin Panel</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">This email was sent via Gmail SMTP. Please log in to the admin panel to manage this order.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateCustomerConfirmationHTML(orderData) {
    const itemsHTML = orderData.items.map(item => {
      const details = [];
      if (item.color) details.push(`Color: ${item.color}`);
      if (item.size) details.push(`Size: ${item.size}`);
      const detailsStr = details.length > 0 ? `<br><small style="color: #666;">${details.join(' | ')}</small>` : '';
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong>
            ${detailsStr}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${this.formatPrice(item.price * item.quantity)}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .table th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .total-row { background: #f0f8ff; font-weight: bold; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .success-message { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p>Thank you for your purchase, ${orderData.customerName}!</p>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Order #${orderData.orderNumber}</p>
          </div>
          
          <div class="content">
            <div class="success-message">
              <strong>🎉 Your order has been successfully placed!</strong> We're excited to prepare your quality textiles for delivery.
              <br><br><strong>📅 Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}
              <br><strong>🚚 Expected Delivery:</strong> 5-7 business days
            </div>
            
            <div class="order-details">
              <h3 style="margin-top: 0; color: #2563eb;">📦 Order Summary</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr class="total-row">
                    <td colspan="2" style="padding: 12px; text-align: right; font-size: 16px;"><strong>Grand Total:</strong></td>
                    <td style="padding: 12px; text-align: right; font-size: 16px; color: #2563eb;"><strong>${this.formatPrice(orderData.totalAmount)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #2563eb;">📍 Delivery Address</h3>
              <p style="margin: 0;">
                ${orderData.shippingAddress.street}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}<br>
                ${orderData.shippingAddress.country}
              </p>
            </div>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #2563eb;">💳 Payment Information</h3>
              <p><strong>Payment ID:</strong> ${orderData.paymentId}</p>
              <p><strong>Payment Status:</strong> <span style="color: #28a745;">✅ Successful</span></p>
              <p><strong>Payment Method:</strong> Razorpay</p>
            </div>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #2563eb;">📋 What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>We'll process your order within 1-2 business days</li>
                <li>You'll receive a shipping confirmation email with tracking details</li>
                <li>Your items will be delivered within 5-7 business days</li>
                <li>Keep your payment ID handy for any future reference</li>
              </ul>
            </div>

            <p style="text-align: center; margin: 20px 0;">
              <strong>Questions?</strong> Contact us at <a href="mailto:support@ashokkumartextiles.com">support@ashokkumartextiles.com</a> or call us at +91-9876543210
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0; font-weight: bold;">Thank you for choosing Ashok Kumar Textiles!</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Quality textiles for every occasion</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendEmailToBackend(emailData) {
    try {
      console.log('📧 Sending email request to backend:', {
        url: `${this.emailServerUrl}/api/send-email`,
        to: emailData.to,
        subject: emailData.subject
      });
      
      const response = await fetch(`${this.emailServerUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        
        try {
          const errorText = await response.text();
          console.error('❌ Raw error response:', errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
            console.error('❌ Error details:', errorData);
          } catch (parseError) {
            console.error('❌ Response is not JSON:', errorText);
            errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
          }
          
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        } catch (responseError) {
          console.error('❌ Failed to read error response:', responseError);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response format from email service');
      }

      if (result.success) {
        console.log('📧 Email sent successfully via Gmail:', result.messageId);
        return true;
      } else {
        throw new Error(result.error || 'Email sending failed');
      }
    } catch (error) {
      console.error('❌ Failed to send email via Gmail:', error);
      return false;
    }
  }

  async sendOrderNotificationToAdmin(orderData) {
    try {
      // Hardcode the admin email to ensure it works
      const adminEmail = 'yash.freelancer17@gmail.com';
      
      console.log('📧 Sending admin notification to:', adminEmail);
      console.log('📦 Order data:', {
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
        totalAmount: orderData.totalAmount,
        itemsCount: orderData.items?.length
      });
      
      return await this.sendEmailToBackend({
        to: adminEmail,
        subject: `🛒 New Order #${orderData.orderNumber} - ${orderData.customerName} (${this.formatPrice(orderData.totalAmount)})`,
        html: this.generateOrderEmailHTML(orderData),
        text: this.generateOrderEmailText(orderData)
      });
    } catch (error) {
      console.error('Failed to send admin notification email:', error);
      return false;
    }
  }

  async sendOrderConfirmationToCustomer(orderData) {
    try {
      return await this.sendEmailToBackend({
        to: orderData.customerEmail,
        subject: `✅ Order Confirmation #${orderData.orderNumber} - Thank you for your purchase!`,
        html: this.generateCustomerConfirmationHTML(orderData),
        text: this.generateCustomerConfirmationText(orderData)
      });
    } catch (error) {
      console.error('Failed to send customer confirmation email:', error);
      return false;
    }
  }

  generateOrderEmailText(orderData) {
    const itemsText = orderData.items.map(item => {
      const details = [];
      if (item.color) details.push(item.color);
      if (item.size) details.push(item.size);
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      return `- ${item.name}${detailsStr} x${item.quantity} = ${this.formatPrice(item.price * item.quantity)}`;
    }).join('\n');

    return `
🛒 NEW ORDER RECEIVED - ${orderData.orderNumber}

Customer Information:
👤 Name: ${orderData.customerName}
📧 Email: ${orderData.customerEmail}
📞 Phone: ${orderData.customerPhone}
💳 Payment ID: ${orderData.paymentId}

Order Items:
${itemsText}

💰 Total Amount: ${this.formatPrice(orderData.totalAmount)}

📍 Shipping Address:
${orderData.shippingAddress.street}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}
${orderData.shippingAddress.country}

📅 Order Date: ${new Date().toLocaleDateString('en-IN')}

📋 Next Steps:
- Review and confirm the order details
- Verify payment status in Razorpay dashboard
- Prepare items for packaging
- Generate shipping label and tracking number
- Update customer with shipping confirmation

---
Ashok Kumar Textiles Admin Notification
Sent via Gmail SMTP
Please log in to the admin panel to manage this order.
    `.trim();
  }

  generateCustomerConfirmationText(orderData) {
    const itemsText = orderData.items.map(item => {
      const details = [];
      if (item.color) details.push(item.color);
      if (item.size) details.push(item.size);
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
      return `- ${item.name}${detailsStr} x${item.quantity} = ${this.formatPrice(item.price * item.quantity)}`;
    }).join('\n');

    return `
✅ ORDER CONFIRMATION #${orderData.orderNumber}

Dear ${orderData.customerName},

🎉 Thank you for your purchase! Your order has been successfully placed.

📦 Order Summary:
${itemsText}

💰 Total: ${this.formatPrice(orderData.totalAmount)}
💳 Payment ID: ${orderData.paymentId}
📅 Order Date: ${new Date().toLocaleDateString('en-IN')}

📍 Delivery Address:
${orderData.shippingAddress.street}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}
${orderData.shippingAddress.country}

📋 What's Next?
- We'll process your order within 1-2 business days
- You'll receive a shipping confirmation email with tracking details
- Your items will be delivered within 5-7 business days
- Keep your payment ID handy for any future reference

🚚 Expected Delivery: 5-7 business days

Questions? Contact us at support@ashokkumartextiles.com

Thank you for choosing Ashok Kumar Textiles!
Quality textiles for every occasion
    `.trim();
  }

  async testEmailConnection() {
    try {
      const response = await fetch(`${this.emailServerUrl}/api/health`);
      if (response.ok) {
        const result = await response.json();
        console.log('📧 Gmail email service health check:', result);
        return result.status === 'ok';
      }
      return false;
    } catch (error) {
      console.error('Gmail email service not available:', error);
      return false;
    }
  }

  async sendTestEmail(testEmail) {
    try {
      const response = await fetch(`${this.emailServerUrl}/api/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Test email sent successfully via Gmail:', result.message);
      return true;
    } catch (error) {
      console.error('❌ Test email failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
