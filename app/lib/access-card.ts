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

const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 520;

let _fontRegistered = false;

const THEME = {
  background: "#2f0c0f",      // Deep Wine
  boxBackground: "#3f1013",   // Lighter Wine
  gold: "#eadfc9",            // Champagne / Gold
  cream: "#f7ede6",           // Soft Cream
  blush: "#e9c0b6",           // Blush Pink
  rose: "#c89485",            // Dusty Rose
  terracotta: "#c97658",      // Terracotta Orange
  border: "rgba(234, 223, 201, 0.25)", // Champagne border line
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
  try {
    if (!_fontRegistered) {
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
            _fontRegistered = true;
            break;
          }
        } catch (e) {
          // ignore and try next
        }
      }
    }
  } catch (e) {
    // ignore font registration errors
  }

  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx: any = canvas.getContext("2d");

  // Base background
  ctx.fillStyle = THEME.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Outer Border (Gold)
  ctx.strokeStyle = THEME.gold;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 20, 20, CANVAS_WIDTH - 40, CANVAS_HEIGHT - 40, 24);
  ctx.stroke();

  // Header
  ctx.fillStyle = THEME.gold;
  ctx.font = "bold 32px KDEFont, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("King David & Esther", CANVAS_WIDTH / 2, 70);

  ctx.fillStyle = THEME.rose;
  ctx.font = "bold 13px KDEFont, Arial, sans-serif";
  ctx.fillText("WEDDING ACCESS PASS", CANVAS_WIDTH / 2, 92);

  // Divider Line
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 110);
  ctx.lineTo(CANVAS_WIDTH - 40, 110);
  ctx.stroke();

  // Left Column: Event details (x = 50 to 360, width = 310)
  ctx.textAlign = "left";
  
  ctx.fillStyle = THEME.rose;
  ctx.font = "bold 13px KDEFont, Arial, sans-serif";
  ctx.fillText("EVENT DETAILS", 50, 145);

  ctx.fillStyle = THEME.blush;
  ctx.font = "bold 11px KDEFont, Arial, sans-serif";
  ctx.fillText("DATE", 50, 175);
  ctx.fillStyle = THEME.cream;
  ctx.font = "bold 15px KDEFont, Arial, sans-serif";
  ctx.fillText("Saturday, 22nd August 2026", 50, 195);

  ctx.fillStyle = THEME.blush;
  ctx.font = "bold 11px KDEFont, Arial, sans-serif";
  ctx.fillText("VENUE", 50, 230);
  ctx.fillStyle = THEME.cream;
  ctx.font = "bold 15px KDEFont, Arial, sans-serif";
  ctx.fillText("Camp Young, Ede", 50, 250);

  ctx.fillStyle = THEME.blush;
  ctx.font = "bold 11px KDEFont, Arial, sans-serif";
  ctx.fillText("TIME", 50, 285);
  ctx.fillStyle = THEME.cream;
  ctx.font = "bold 15px KDEFont, Arial, sans-serif";
  ctx.fillText("Ceremony: 10:00 AM", 50, 305);
  ctx.font = "500 15px KDEFont, Arial, sans-serif";
  ctx.fillText("Reception follows immediately", 50, 325);

  ctx.fillStyle = THEME.terracotta;
  ctx.font = "bold 13px KDEFont, Arial, sans-serif";
  ctx.fillText("IMPORTANT NOTICE", 50, 375);
  
  ctx.fillStyle = THEME.blush;
  ctx.font = "bold 13px KDEFont, Arial, sans-serif";
  ctx.fillText("• STRICTLY ADULTS ONLY", 50, 400);
  ctx.fillText("• CARD IS NON-TRANSFERABLE", 50, 420);

  ctx.fillStyle = THEME.gold;
  ctx.font = "italic 13px KDEFont, Arial, sans-serif";
  ctx.fillText("Please present this card at the entrance.", 50, 455);

  // Right Column: Guest details (x = 400 to 710, width = 310)
  // Draw guest details box
  const boxX = 400;
  const boxY = 135;
  const boxW = 310;
  const boxH = 320;
  
  ctx.fillStyle = THEME.boxBackground;
  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 20);
  ctx.fill();
  
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 20);
  ctx.stroke();

  ctx.textAlign = "center";
  const centerX = boxX + boxW / 2; // 555

  ctx.fillStyle = THEME.rose;
  ctx.font = "bold 11px KDEFont, Arial, sans-serif";
  ctx.fillText("GUEST PASS", centerX, boxY + 35);

  // Guest Name (dynamic scale down if too long)
  let nameFontSize = 22;
  ctx.font = `bold ${nameFontSize}px KDEFont, Arial, sans-serif`;
  while (ctx.measureText(options.fullName).width > boxW - 30 && nameFontSize > 14) {
    nameFontSize -= 1;
    ctx.font = `bold ${nameFontSize}px KDEFont, Arial, sans-serif`;
  }
  ctx.fillStyle = THEME.gold;
  ctx.fillText(options.fullName, centerX, boxY + 80);

  // Phone
  ctx.fillStyle = THEME.cream;
  ctx.font = "500 13px KDEFont, Arial, sans-serif";
  if (options.phone) {
    ctx.fillText(`WhatsApp: ${options.phone}`, centerX, boxY + 115);
  }

  // Entry code pill
  const pillW = 260;
  const pillH = 36;
  const pillX = centerX - pillW / 2;
  const pillY = boxY + 138;
  
  ctx.fillStyle = THEME.gold;
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 18);
  ctx.fill();

  ctx.fillStyle = THEME.background;
  ctx.font = "bold 13px KDEFont, Arial, sans-serif";
  ctx.fillText(`ENTRY CODE: ${options.entryCode}`, centerX, pillY + 23);

  // Adult Pass label
  ctx.fillStyle = THEME.terracotta;
  ctx.font = "bold 13px KDEFont, Arial, sans-serif";
  ctx.fillText(`${options.attendees} ADULT PASS`, centerX, boxY + 210);

  // Dashed ticket tear-off line inside guest pass box
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(boxX + 20, boxY + 245);
  ctx.lineTo(boxX + boxW - 20, boxY + 245);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // Thank you message at the bottom of the card
  ctx.fillStyle = THEME.gold;
  ctx.font = "italic 13px KDEFont, Arial, sans-serif";
  ctx.fillText("Thank you for celebrating with us!", centerX, boxY + 285);

  return canvas.toBuffer("image/png");
}

