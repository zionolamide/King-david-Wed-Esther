import { createCanvas, registerFont } from "canvas";
import fs from "fs";
import path from "path";

export type AccessCardOptions = {
  fullName: string;
  entryCode: string;
  attendees: number;
  phone?: string;
  whatsappContacts?: Array<{ name: string; phone: string }>;
};

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 580;

const THEME = {
  background: "#F2E9E4",
  primary: "#5B0C1D",
  accent: "#8F5C4B",
  text: "#3D3330",
  cream: "#F2E9E4",
};

function drawRoundedRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export async function generateAccessCardImage(options: AccessCardOptions) {
  // Attempt to register a local/system font for consistent rendering.
  // Prefer Montserrat if available, then Arial, then DejaVu Sans.
  try {
    const candidates = [
      path.join(process.cwd(), "public", "fonts", "Montserrat-Regular.ttf"),
      "C:\\Windows\\Fonts\\Montserrat-Regular.ttf",
      "C:\\Windows\\Fonts\\Arial.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ];
    for (const p of candidates) {
      try {
        if (p && fs.existsSync(p)) {
          registerFont(p, { family: "KDEFont" });
          break;
        }
      } catch (e) {
        // ignore and try next
      }
    }
  } catch (e) {
    // ignore font registration errors
  }

  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx: any = canvas.getContext("2d");

  // Background
  ctx.fillStyle = THEME.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Header
  ctx.fillStyle = THEME.primary;
  drawRoundedRect(ctx, 24, 24, CANVAS_WIDTH - 48, 100, 20);
  ctx.fill();

  ctx.fillStyle = THEME.cream;
  ctx.font = "bold 34px KDEFont, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("King David & Esther", CANVAS_WIDTH / 2, 72);

  // Middle section details
  ctx.fillStyle = THEME.text;
  ctx.textAlign = "left";
  ctx.font = "600 18px KDEFont, Arial, sans-serif";
  const textX = 40;
  let y = 160;
  const lineHeight = 32;
  const lines = [
    "DATE: Saturday, 22nd August 2026",
    "VENUE: Camp Young, Ede-Osogbo Rd,",
    "Nijhof Advies - Osun State",
    "Wedding ceremony starts at 10am",
    "Reception celebration starts immediately after",
    "",
    "CHILDREN ARE NOT ALLOWED",
    "NOT TRANSFERABLE",
  ];

  for (const line of lines) {
    ctx.fillText(line, textX, y);
    y += line === "" ? lineHeight / 2 : lineHeight;
  }

  // Accent separator
  ctx.fillStyle = THEME.accent;
  drawRoundedRect(ctx, 40, 258, CANVAS_WIDTH - 80, 3, 2);
  ctx.fill();

  // Bottom guest info panel
  const panelHeight = 140;
  const panelY = CANVAS_HEIGHT - panelHeight - 120;
  ctx.fillStyle = THEME.primary;
  drawRoundedRect(ctx, 40, panelY, CANVAS_WIDTH - 80, panelHeight, 24);
  ctx.fill();

  ctx.fillStyle = THEME.cream;
  ctx.textAlign = "center";
  ctx.font = "bold 28px KDEFont, Arial, sans-serif";
  ctx.fillText(options.fullName, CANVAS_WIDTH / 2, panelY + 46);

  ctx.font = "500 18px KDEFont, Arial, sans-serif";
  if (options.phone) {
    ctx.fillText(`WhatsApp: ${options.phone}`, CANVAS_WIDTH / 2, panelY + 84);
  }

  ctx.font = "bolder 26px KDEFont, Arial, sans-serif";
  ctx.fillText(`ENTRY CODE: ${options.entryCode}`, CANVAS_WIDTH / 2, panelY + 106);

  ctx.font = "600 20px KDEFont, Arial, sans-serif";
  ctx.fillText(`${options.attendees} adult pass`, CANVAS_WIDTH / 2, panelY + 136);

  const contactList = options.whatsappContacts ?? [
    { name: "Sister Rhoda", phone: "08106993435" },
    { name: "Brother Joe", phone: "0812765976" },
    { name: "Bro Zion", phone: "09135037695" }
  ];

  const contactY = panelY + panelHeight + 36;
  ctx.fillStyle = THEME.text;
  ctx.textAlign = "left";
  ctx.font = "700 18px KDEFont, Arial, sans-serif";
  ctx.fillText("RSVP WhatsApp contacts:", textX, contactY);

  ctx.font = "500 16px KDEFont, Arial, sans-serif";
  let contactLineY = contactY + 28;
  contactList.slice(0, 3).forEach((contact) => {
    ctx.fillText(`• ${contact.name}: ${contact.phone}`, textX, contactLineY);
    contactLineY += 24;
  });

  ctx.font = "500 16px KDEFont, Arial, sans-serif";
  ctx.fillText("Show this card at the entrance.", textX, contactLineY + 14);

  return canvas.toBuffer("image/png");
}
