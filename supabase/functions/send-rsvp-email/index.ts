import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'rsvp@kingdaviesther.wedding';

interface RsvpPayload {
  full_name: string;
  email: string;
  title?: string;
  entry_code: string;
  attendees: number;
  phone?: string;
}

serve(async (req) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    const payload: RsvpPayload = await req.json();
    const { full_name, email, title, entry_code, attendees, phone } = payload;

    if (!full_name || !email || !entry_code) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers,
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 503,
        headers,
      });
    }

    const displayName = title ? `${title} ${full_name}` : full_name;
    const guestWord = attendees === 1 ? 'guest' : 'guests';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Wedding RSVP Confirmation</title>
        <style>
          body { font-family: Georgia, serif; background: #fbf6ed; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: #7b0014; padding: 28px; text-align: center; }
          .header h1 { color: #fbf6ed; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; margin: 0; font-weight: 600; }
          .header p { color: rgba(251,246,237,0.8); margin: 6px 0 0; font-size: 13px; }
          .body { padding: 28px; color: #2d241f; }
          .body h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; color: #3f481f; margin: 0 0 16px; }
          .body p { font-size: 14px; line-height: 1.7; margin: 0 0 12px; }
          .code-box { background: #f5efe4; border: 2px dashed rgba(123,0,20,0.3); border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
          .code-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(45,36,31,0.55); margin-bottom: 8px; }
          .code-box .code { font-family: 'Courier New', monospace; font-size: 22px; font-weight: 700; color: #7b0014; letter-spacing: 0.08em; }
          .footer { background: #f5efe4; padding: 20px 28px; text-align: center; font-size: 12px; color: rgba(45,36,31,0.5); }
          .footer strong { color: #3f481f; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>King David &amp; Esther</h1>
            <p>Wedding Celebration — August 22, 2026</p>
          </div>
          <div class="body">
            <h2>Dear ${displayName},</h2>
            <p>Thank you for confirming your attendance at our wedding celebration. We are thrilled to have you join us on this special day.</p>
            <p>Your reservation for <strong>${attendees} ${guestWord}</strong> has been recorded.</p>
            <div class="code-box">
              <div class="label">Your Unique Entry Code</div>
              <div class="code">${entry_code}</div>
            </div>
            <p>Please present this code at the entrance on the day of the event. It will be sent to your WhatsApp (${phone || 'as provided'}) as well.</p>
            <p>We look forward to celebrating with you!</p>
            <p style="margin-top:20px; font-style:italic;">With love,<br>King David &amp; Esther</p>
          </div>
          <div class="footer">
            <strong>Date:</strong> Saturday, August 22, 2026 &nbsp;|&nbsp; <strong>Time:</strong> 11:00 AM<br>
            Questions? Contact Sister Rhoda: 08106993435
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `King David & Esther <${FROM_EMAIL}>`,
        to: [email],
        subject: 'Your Wedding Entry Code — King David & Esther',
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: err }), {
        status: 500,
        headers,
      });
    }

    const result = await res.json();
    return new Response(JSON.stringify({ success: true, messageId: result.id }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers,
    });
  }
});
