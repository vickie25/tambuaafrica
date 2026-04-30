// Email service integration using Resend API and Gmail forwarding

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

class EmailService {
  private resendApiKey: string;
  private companyNotificationEmail: string;

  constructor() {
    this.resendApiKey = import.meta.env.VITE_RESEND_API_KEY || '';
    this.companyNotificationEmail = import.meta.env.VITE_GMAIL_FORWARDING_ADDRESS || 'tambuaafrica@gmail.com';
  }

  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      if (!this.resendApiKey) {
        throw new Error('Resend API key not configured');
      }

      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      
      // Forward to Gmail address as well if not already included
      if (!recipients.includes(this.companyNotificationEmail)) {
        recipients.push(this.companyNotificationEmail);
      }

      const emailData = {
        from: options.from || 'Tambua Africa <no-reply@tambuaafrica.com>',
        to: recipients,
        subject: options.subject,
        html: options.html || this.generateHtmlFromText(options.text || ''),
        text: options.text || '',
        replyTo: options.replyTo || this.companyNotificationEmail,
      };

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email');
      }

      return {
        success: true,
        message: 'Email sent successfully',
        data,
      };
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  async sendBookingConfirmation(bookingData: {
    customerName: string;
    customerEmail: string;
    safariTitle: string;
    preferredDate: string;
    guests: number;
    totalAmount: number;
    bookingId: string;
  }): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Booking Confirmed! 🦁</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your African adventure awaits</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Booking Details</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 8px 0;"><strong>Booking ID:</strong> ${bookingData.bookingId}</p>
            <p style="margin: 8px 0;"><strong>Safari:</strong> ${bookingData.safariTitle}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${bookingData.preferredDate}</p>
            <p style="margin: 8px 0;"><strong>Guests:</strong> ${bookingData.guests}</p>
            <p style="margin: 8px 0;"><strong>Total Amount:</strong> $${(bookingData.totalAmount / 100).toLocaleString()}</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #f0f8ff; border-radius: 10px;">
          <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
          <p style="color: #666;">Our team will contact you within 24 hours to confirm final details and answer any questions.</p>
          <p style="color: #666; margin: 15px 0;">For immediate assistance, reply to this email or call us at +254 700 123 456</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Tambua Africa. All rights reserved.</p>
          <p>Creating unforgettable African experiences since 2008</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: this.companyNotificationEmail,
      subject: `Booking Confirmation: ${bookingData.safariTitle} - ${bookingData.bookingId}`,
      html,
      replyTo: bookingData.customerEmail,
    });
  }

  async sendContactForm(formData: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Contact Inquiry 📧</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone wants to start their African journey</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${formData.name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${formData.email}</p>
            ${formData.phone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${formData.phone}</p>` : ''}
            <div style="margin: 15px 0;">
              <strong style="display: block; margin-bottom: 8px;">Message:</strong>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${formData.message}</div>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Tambua Africa. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: this.companyNotificationEmail,
      subject: `Contact Form: ${formData.name} - ${formData.email}`,
      html,
      replyTo: formData.email,
    });
  }

  private generateHtmlFromText(text: string): string {
    return text
      .split('\n')
      .map(line => line.trim() ? `<p style="margin: 8px 0;">${line}</p>` : '<br>')
      .join('');
  }
}

export const emailService = new EmailService();
export default emailService;
