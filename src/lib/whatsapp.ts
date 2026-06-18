// WhatsApp Click-to-Chat helper — completely free, no API key needed
// Opens WhatsApp with a pre-filled message that the user just taps "Send" on

function encodeMessage(text: string): string {
  return encodeURIComponent(text);
}

export function openWhatsApp(phone: string, message: string): void {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return;
  // Remove leading zero and add country code if missing
  let formattedPhone = cleanPhone;
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '234' + formattedPhone.slice(1);
  }
  if (!formattedPhone.startsWith('234')) {
    formattedPhone = '234' + formattedPhone;
  }
  const url = `https://wa.me/${formattedPhone}?text=${encodeMessage(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function buildGuestConfirmationMessage(options: {
  fullName: string;
  entryCode: string;
  attendees: number;
  date: string;
  time: string;
  venue: string;
}): string {
  return `🎉 *Wedding Invitation Confirmation*

Hello ${options.fullName},

Your RSVP has been received!

🎫 *Entry Code:* ${options.entryCode}
👥 *Guests:* ${options.attendees}
📅 *Date:* ${options.date}
⏰ *Time:* ${options.time}
📍 *Venue:* ${options.venue}

Please keep this entry code safe — you'll need it at the entrance. We look forward to celebrating with you!

With love,
King David & Esther 💕`;
}

export function buildAdminEntryCodeMessage(options: {
  fullName: string;
  entryCode: string;
  attendees: number;
}): string {
  return `🎉 *Wedding Invitation*

Hello ${options.fullName},

Your entry code for King David & Esther's wedding is:

🎫 *${options.entryCode}*
👥 *Number of guests:* ${options.attendees}

Please keep this safe — you'll need it at the entrance.

We can't wait to celebrate with you! 💕`;
}
