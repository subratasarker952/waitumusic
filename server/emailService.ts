import * as nodemailer from 'nodemailer';

// Email configuration for mail.comeseetv.com
const emailConfig = {
  host: 'mail.comeseetv.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'noreply@mail.comeseetv.com',
    pass: process.env.EMAIL_PASS || '' // Will need to be set in environment
  },
  tls: {
    rejectUnauthorized: false
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: options.from || `"Wai'tuMusic Platform" <noreply@mail.comeseetv.com>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

// Workflow-specific email templates
export async function sendBookingWorkflowEmail(
  type: 'started' | 'step_completed' | 'completed' | 'error',
  booking: any,
  recipient: string,
  additionalData?: any
): Promise<boolean> {
  const templates = {
    started: {
      subject: `Booking Workflow Started - ${booking.eventName}`,
      html: `
        <h2>Booking Workflow Started</h2>
        <p>A comprehensive booking workflow has been initiated for:</p>
        <ul>
          <li><strong>Event:</strong> ${booking.eventName}</li>
          <li><strong>Date:</strong> ${new Date(booking.eventDate).toLocaleDateString()}</li>
          <li><strong>Artist:</strong> ${booking.primaryArtist?.stageName || 'TBD'}</li>
          <li><strong>Status:</strong> ${booking.status}</li>
        </ul>
        <p>The 6-step workflow process is now in progress.</p>
      `
    },
    step_completed: {
      subject: `Workflow Step Completed - ${booking.eventName}`,
      html: `
        <h2>Workflow Step Completed</h2>
        <p>Step ${additionalData?.step} of 6 has been completed for:</p>
        <ul>
          <li><strong>Event:</strong> ${booking.eventName}</li>
          <li><strong>Step:</strong> ${additionalData?.stepName}</li>
          <li><strong>Progress:</strong> ${additionalData?.progress}%</li>
        </ul>
        <p>The workflow is progressing successfully.</p>
      `
    },
    completed: {
      subject: `Booking Workflow Completed - ${booking.eventName}`,
      html: `
        <h2>Booking Workflow Completed</h2>
        <p>All 6 steps of the comprehensive booking workflow have been completed for:</p>
        <ul>
          <li><strong>Event:</strong> ${booking.eventName}</li>
          <li><strong>Date:</strong> ${new Date(booking.eventDate).toLocaleDateString()}</li>
          <li><strong>Artist:</strong> ${booking.primaryArtist?.stageName}</li>
          <li><strong>Final Status:</strong> ${booking.status}</li>
        </ul>
        <p>All contracts and documents are ready for delivery.</p>
      `
    },
    error: {
      subject: `Booking Workflow Error - ${booking.eventName}`,
      html: `
        <h2>Booking Workflow Error</h2>
        <p>An error occurred during the workflow for:</p>
        <ul>
          <li><strong>Event:</strong> ${booking.eventName}</li>
          <li><strong>Error:</strong> ${additionalData?.error}</li>
          <li><strong>Step:</strong> ${additionalData?.step}</li>
        </ul>
        <p>Please review and resolve the issue.</p>
      `
    }
  };

  const template = templates[type];
  return await sendEmail({
    to: recipient,
    subject: template.subject,
    html: template.html
  });
}

// Test email connectivity
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
}

// Newsletter functionality
export async function sendNewsletter(
  newsletterId: number,
  recipients: Array<{email: string; firstName?: string; lastName?: string; unsubscribeToken: string}>,
  newsletter: {title: string; content: string; type: string}
): Promise<{success: boolean; sent: number; failed: number}> {
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      const personalizedContent = newsletter.content
        .replace(/{{firstName}}/g, recipient.firstName || 'Friend')
        .replace(/{{lastName}}/g, recipient.lastName || '')
        .replace(/{{unsubscribeUrl}}/g, `https://waitumusic.com/unsubscribe?token=${recipient.unsubscribeToken}`);

      const success = await sendEmail({
        to: recipient.email,
        subject: newsletter.title,
        html: personalizedContent,
        from: `"Wai'tuMusic Newsletter" <newsletter@mail.comeseetv.com>`
      });

      if (success) {
        sent++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to send newsletter to ${recipient.email}:`, error);
      failed++;
    }
  }

  return { success: sent > 0, sent, failed };
}

export async function sendArtistUpdate(
  artistName: string,
  artistId: number,
  updateContent: {
    title: string;
    content: string;
    releaseInfo?: any;
    showInfo?: any;
  },
  recipients: Array<{email: string; firstName?: string; unsubscribeToken: string}>
): Promise<boolean> {
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${artistName} Update</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Exclusive news from Wai'tuMusic</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #1f2937; margin-top: 0;">${updateContent.title}</h2>
        ${updateContent.content}
        
        ${updateContent.releaseInfo ? `
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">🎵 New Release</h3>
            <p><strong>Title:</strong> ${updateContent.releaseInfo.title}</p>
            <p><strong>Release Date:</strong> ${updateContent.releaseInfo.date}</p>
            ${updateContent.releaseInfo.streamingLinks ? `<p><strong>Listen:</strong> ${updateContent.releaseInfo.streamingLinks}</p>` : ''}
          </div>
        ` : ''}
        
        ${updateContent.showInfo ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">🎤 Upcoming Show</h3>
            <p><strong>Event:</strong> ${updateContent.showInfo.event}</p>
            <p><strong>Date:</strong> ${updateContent.showInfo.date}</p>
            <p><strong>Venue:</strong> ${updateContent.showInfo.venue}</p>
            ${updateContent.showInfo.ticketLink ? `<p><strong>Tickets:</strong> <a href="${updateContent.showInfo.ticketLink}">Get Tickets</a></p>` : ''}
          </div>
        ` : ''}
      </div>
      
      <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          You're receiving this because you subscribed to ${artistName} updates.<br>
          <a href="{{unsubscribeUrl}}" style="color: #6b7280;">Unsubscribe</a> | 
          <a href="https://waitumusic.com" style="color: #6b7280;">Visit Wai'tuMusic</a>
        </p>
      </div>
    </div>
  `;

  let successCount = 0;
  
  for (const recipient of recipients) {
    try {
      const personalizedTemplate = emailTemplate
        .replace(/{{firstName}}/g, recipient.firstName || 'Friend')
        .replace(/{{unsubscribeUrl}}/g, `https://waitumusic.com/unsubscribe?token=${recipient.unsubscribeToken}`);

      const success = await sendEmail({
        to: recipient.email,
        subject: `${artistName}: ${updateContent.title}`,
        html: personalizedTemplate,
        from: `"${artistName} via Wai'tuMusic" <newsletter@mail.comeseetv.com>`
      });

      if (success) successCount++;
    } catch (error) {
      console.error(`Failed to send artist update to ${recipient.email}:`, error);
    }
  }

  return successCount > 0;
}

export async function sendWelcomeNewsletter(
  email: string,
  firstName?: string,
  unsubscribeToken?: string
): Promise<boolean> {
  const welcomeTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Wai'tuMusic!</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your gateway to Caribbean Neo Soul</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #1f2937; margin-top: 0;">Hello ${firstName || 'Music Lover'}! 🎵</h2>
        
        <p>Thank you for subscribing to the Wai'tuMusic newsletter! You're now part of our exclusive community that gets the latest updates on:</p>
        
        <ul style="color: #4b5563; line-height: 1.6;">
          <li><strong>New Releases</strong> - Be the first to hear new music from our managed artists</li>
          <li><strong>Exclusive Content</strong> - Behind-the-scenes content, interviews, and stories</li>
          <li><strong>Show Announcements</strong> - Get early access to tickets and special events</li>
          <li><strong>Artist Updates</strong> - Personal updates from Lí-Lí Octave, JCro, Janet Azzouz, and Princess Trinidad</li>
        </ul>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #065f46; margin-top: 0;">🌟 Featured Artist: Lí-Lí Octave</h3>
          <p style="color: #047857;">Dominican-born Caribbean Neo Soul Queen with a four-octave vocal range. Listen to her latest album "Play on Venus (Live)" now!</p>
        </div>
        
        <p>Stay tuned for exclusive content and be part of the Wai'tuMusic family!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://waitumusic.com" style="background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore Wai'tuMusic</a>
        </div>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          ${unsubscribeToken ? `<a href="https://waitumusic.com/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280;">Unsubscribe</a> | ` : ''}
          <a href="https://waitumusic.com" style="color: #6b7280;">Visit Website</a>
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: "Welcome to Wai'tuMusic - Your Caribbean Neo Soul Journey Begins! 🎵",
    html: welcomeTemplate,
    from: `"Wai'tuMusic" <newsletter@mail.comeseetv.com>`
  });
}