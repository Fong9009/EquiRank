import nodemailer from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email content interface
interface EmailContent {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter for sending emails
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  };

  return nodemailer.createTransporter(config);
};

// Send email function
export const sendEmail = async (emailContent: EmailContent): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@equirank.com',
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text || emailContent.html.replace(/<[^>]*>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  // Account approval email
  accountApproved: (userName: string, userEmail: string) => ({
    subject: 'Your EquiRank Account Has Been Approved! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #51C342; margin: 0;">EquiRank</h1>
          <p style="color: #666; margin: 10px 0;">Powering The Next Generation Of Investment</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">🎉 Account Approved!</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${userName}</strong>,
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your EquiRank account has been approved by our admin team. 
            You can now access your investment dashboard and start using all the features.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" 
               style="background: linear-gradient(135deg, #51C342, #B9EB72); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;">
              Login to Your Dashboard
            </a>
          </div>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions or need assistance, please don't hesitate to 
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/contact-us" style="color: #51C342;">contact our support team</a>.
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 0;">
            Welcome to EquiRank!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 EquiRank. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  // Admin reply to contact message
  adminReply: (userName: string, userEmail: string, adminMessage: string, originalSubject: string) => ({
    subject: `Re: ${originalSubject} - EquiRank Support`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #51C342; margin: 0;">EquiRank</h1>
          <p style="color: #666; margin: 10px 0;">Powering The Next Generation Of Investment</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">📧 Response to Your Message</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${userName}</strong>,
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Thank you for contacting EquiRank. Here's our response to your message regarding:
            <strong>"${originalSubject}"</strong>
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #51C342; margin: 20px 0;">
            <p style="color: #333; line-height: 1.6; margin: 0; font-style: italic;">
              "${adminMessage}"
            </p>
          </div>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            If you have any follow-up questions or need further assistance, please 
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/contact-us" style="color: #51C342;">contact us again</a>.
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 0;">
            Best regards,<br>
            The EquiRank Support Team
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 EquiRank. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  // Account rejection email
  accountRejected: (userName: string, userEmail: string, reason?: string) => ({
    subject: 'EquiRank Account Application Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #51C342; margin: 0;">EquiRank</h1>
          <p style="color: #666; margin: 10px 0;">Powering The Next Generation Of Investment</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">📋 Account Application Update</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${userName}</strong>,
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your interest in EquiRank. After careful review of your application, 
            we regret to inform you that we are unable to approve your account at this time.
          </p>
          
          ${reason ? `
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-weight: bold;">Reason:</p>
            <p style="color: #856404; margin: 5px 0 0 0;">${reason}</p>
          </div>
          ` : ''}
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            We encourage you to review your application and consider reapplying in the future. 
            If you have any questions about this decision, please 
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/contact-us" style="color: #51C342;">contact our support team</a>.
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 0;">
            Thank you for your understanding.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 EquiRank. All rights reserved.</p>
        </div>
      </div>
    `
  })
};

// Helper functions for specific email types
export const sendAccountApprovalEmail = async (userEmail: string, userName: string): Promise<boolean> => {
  const emailContent = emailTemplates.accountApproved(userName, userEmail);
  return await sendEmail({
    to: userEmail,
    ...emailContent
  });
};

export const sendAdminReplyEmail = async (
  userEmail: string, 
  userName: string, 
  adminMessage: string, 
  originalSubject: string
): Promise<boolean> => {
  const emailContent = emailTemplates.adminReply(userName, userEmail, adminMessage, originalSubject);
  return await sendEmail({
    to: userEmail,
    ...emailContent
  });
};

export const sendAccountRejectionEmail = async (
  userEmail: string, 
  userName: string, 
  reason?: string
): Promise<boolean> => {
  const emailContent = emailTemplates.accountRejected(userName, userEmail, reason);
  return await sendEmail({
    to: userEmail,
    ...emailContent
  });
};
