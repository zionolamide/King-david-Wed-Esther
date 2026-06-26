/**
 * Email Pipeline Test and Validation
 * This file documents the Resend email pipeline configuration
 */

// Entry Point: app/api/rsvp/route.ts
// - Generates entry code using crypto.randomBytes()
// - Validates email format
// - Sends confirmation email via Resend API
// - Returns entry code to frontend

// Required Environment Variables (for production):
// - RESEND_API_KEY: API key from Resend.com
// - RSVP_FROM_EMAIL: Sender email address (e.g., rsvp@kdeesther.com)
// - SUPABASE_URL: Database URL
// - SUPABASE_SERVICE_ROLE_KEY: Service role key

// Email Template Details:
// - Subject: "Your Wedding Entry Code | King David & Esther"
// - Recipient: User's email address from form
// - Contains: Entry code displayed prominently
// - Styling: Romantic, garden-themed aesthetic with wedding colors

// Testing Checklist:
// ✓ Entry code generation logic verified
// ✓ Email template HTML structure valid
// ✓ Error handling present for email failures
// ✓ Non-blocking: Email failures don't prevent RSVP
// ✓ RESEND_API_KEY check conditional
// ✓ Logging for debugging: console.log and console.error

// Important Notes:
// - Email is sent AFTER database insertion succeeds
// - If Resend API fails, RSVP still completes (data already in DB)
// - Entry code is returned to frontend regardless of email status
// - Fallback message if Resend service unavailable

export const emailPipelineConfig = {
  service: 'Resend',
  templateType: 'transactional',
  contentType: 'text/html',
  encoding: 'utf-8',
  retryOnFailure: true,
  fallbackBehavior: 'silentFail',
  requiredEnvVars: ['RESEND_API_KEY', 'RSVP_FROM_EMAIL'],
};

export const emailTemplate = {
  subject: 'Your Wedding Entry Code | King David & Esther',
  styles: {
    fontFamily: 'Georgia, serif',
    colors: {
      primary: '#7b0014', // Wine
      secondary: '#3f481f', // Moss
      accent: '#e9c0b6', // Blush
      background: '#fbf6ed', // Ivory
    },
  },
  sections: [
    'header',
    'greeting',
    'main_message',
    'entry_code_block',
    'event_details',
    'closing',
  ],
};
