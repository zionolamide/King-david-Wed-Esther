import { createCanvas, registerFont } from "canvas";
import fs from "fs";
import path from "path";

export type AccessCardOptions = {
  fullName: string;
  entryCode: string;
  attendees: number;
};

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

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
  // Attempt to register a system font for better text rendering on Windows/Linux
  try {
    const systemFonts = [
      "C:\\Windows\\Fonts\\arial.ttf",
      "C:\\Windows\\Fonts\\calibrib.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
      "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ];
    
    for (const fontPath of systemFonts) {
      if (fs.existsSync(fontPath)) {
        try {
          registerFont(fontPath, { family: "SystemFont" });
          break;
        } catch (e) {
          // Continue to next font if registration fails
        }
      }
    }
  } catch (e) {
    // If font registration fails entirely, canvas will fall back to default fonts
  }

  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx: any = canvas.getContext("2d");

  // Background and glow
  ctx.fillStyle = THEME.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const glowGradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  glowGradient.addColorStop(0, "rgba(255, 239, 216, 0.24)");
  glowGradient.addColorStop(1, "rgba(175, 115, 96, 0.04)");
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Top accent roundel
  ctx.fillStyle = THEME.accent;
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - 100, 100, 72, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - 120, 90, 42, 0, Math.PI * 2);
  ctx.fill();

  // Main card panel
  ctx.fillStyle = THEME.cream;
  drawRoundedRect(ctx, 28, 28, CANVAS_WIDTH - 56, CANVAS_HEIGHT - 56, 30);
  ctx.fill();

  ctx.strokeStyle = THEME.accent;
  ctx.lineWidth = 2.5;
  drawRoundedRect(ctx, 28, 28, CANVAS_WIDTH - 56, CANVAS_HEIGHT - 56, 30);
  ctx.stroke();

  // Title text
  ctx.fillStyle = THEME.primary;
  ctx.font = "700 34px SystemFont, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("King David & Esther", CANVAS_WIDTH / 2, 90);

  // Divider accent bar
  ctx.fillStyle = THEME.accent;
  drawRoundedRect(ctx, 120, 120, CANVAS_WIDTH - 240, 6, 3);
  ctx.fill();

  // Middle section details
  ctx.fillStyle = THEME.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "16px SystemFont, Arial, sans-serif";
  const textX = 48;
  let y = 156;
  const lineHeight = 30;
  const lines = [
    "DATE: Saturday, 22nd August 2026",
    "VENUE: Camp Young, Ede-Osogbo Rd, Nijhof Advies - Osun State",
    "Ceremony: 10:00 AM",
    "Reception: Immediately after ceremony",
    "",
    "ADULTS ONLY | NON-TRANSFERABLE",
  ];

  for (const line of lines) {
    if (line) {
      ctx.fillText(line, textX, y);
    }
    y += lineHeight;
  }

  // Info marker strip
  ctx.fillStyle = "rgba(91, 12, 29, 0.08)";
  drawRoundedRect(ctx, 48, 258, CANVAS_WIDTH - 96, 40, 14);
  ctx.fill();

  ctx.fillStyle = THEME.primary;
  ctx.font = "600 14px SystemFont, Arial, sans-serif";
  ctx.fillText("Please present this access card at the welcome table.", 60, 268);

  // Bottom guest info panel
  const panelHeight = 140;
  const panelY = CANVAS_HEIGHT - panelHeight - 35;
  ctx.fillStyle = THEME.primary;
  drawRoundedRect(ctx, 44, panelY, CANVAS_WIDTH - 88, panelHeight, 26);
  ctx.fill();

  ctx.fillStyle = THEME.cream;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "700 26px SystemFont, Arial, sans-serif";
  ctx.fillText(options.fullName, CANVAS_WIDTH / 2, panelY + 40);

  ctx.font = "600 20px SystemFont, Arial, sans-serif";
  ctx.fillText(`Entry code: ${options.entryCode}`, CANVAS_WIDTH / 2, panelY + 78);

  ctx.font = "500 16px SystemFont, Arial, sans-serif";
  ctx.fillText(`${options.attendees} guest pass`, CANVAS_WIDTH / 2, panelY + 112);

  return canvas.toBuffer("image/png");
}
