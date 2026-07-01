/**
 * Email Pipeline Test and Validation
 * This file documents the Nodemailer email pipeline configuration
 */

// Entry Point: app/api/rsvp/route.ts
// - Generates entry code using crypto.randomBytes()
// - Validates email format
// - Sends confirmation email via Nodemailer using Gmail SMTP
// - Returns entry code to frontend

// Required Environment Variables (for production):
// - EMAIL_USER: Gmail address to send from
// - EMAIL_APP_PASSWORD: Gmail app password for SMTP auth
// - SUPABASE_URL: Database URL
// - SUPABASE_SERVICE_ROLE_KEY: Service role key

// Email Template Details:
// - Subject: "Your Official RSVP Confirmation & Entry Code"
// - Recipient: User's email address from form
// - Contains: Entry code displayed prominently
// - Styling: Simple, clean, professional

// Testing Checklist:
// ✓ Entry code generation logic verified
// ✓ Email template HTML structure valid
// ✓ Error handling present for email failures
// ✓ Non-blocking: Email failures don't prevent RSVP
// ✓ EMAIL_USER and EMAIL_APP_PASSWORD check conditional
// ✓ Logging for debugging: console.error

// Important Notes:
// - Email is sent AFTER database insertion succeeds
// - If email fails, RSVP still completes (data already in DB)
// - Entry code is returned to frontend regardless of email status

export const emailPipelineConfig = {
  service: 'Nodemailer',
  templateType: 'transactional',
  contentType: 'text/html',
  encoding: 'utf-8',
  retryOnFailure: false,
  fallbackBehavior: 'silentFail',
  requiredEnvVars: ['EMAIL_USER', 'EMAIL_APP_PASSWORD'],
};

export const emailTemplate = {
  subject: 'Your Official RSVP Confirmation & Entry Code',
  styles: {
    fontFamily: 'Arial, sans-serif',
    colors: {
      primary: '#333333',
      secondary: '#555555',
      accent: '#000000',
      border: '#eaeaea',
    },
  },
  sections: [
    'header',
    'message',
    'entry_code',
    'footer',
  ],
};
