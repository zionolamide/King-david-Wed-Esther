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
  background: "#FBF6ED",
  panel: "#F2E4DC",
  primary: "#7B0014",
  moss: "#3F481F",
  accent: "#C89485",
  text: "#2D241F",
  cream: "#FFF8EF",
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

function registerCardFont() {
  const candidates = [
    path.join(process.cwd(), "public", "fonts", "Montserrat-Regular.ttf"),
    "C:\\Windows\\Fonts\\arial.ttf",
    "C:\\Windows\\Fonts\\calibri.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
  ];

  for (const fontPath of candidates) {
    try {
      if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: "KDECardFont" });
        return "KDECardFont";
      }
    } catch {
      // Try the next available font.
    }
  }

  return "sans-serif";
}

function drawWrappedText(
  ctx: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY);
  }

  return currentY + lineHeight;
}

export async function generateAccessCardImage(options: AccessCardOptions) {
  const fontFamily = registerCardFont();
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx: any = canvas.getContext("2d");

  ctx.fillStyle = THEME.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = THEME.panel;
  drawRoundedRect(ctx, 24, 24, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 48, 34);
  ctx.fill();

  ctx.strokeStyle = "rgba(123, 0, 20, 0.18)";
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 24, 24, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 48, 34);
  ctx.stroke();

  ctx.fillStyle = THEME.primary;
  drawRoundedRect(ctx, 58, 58, CANVAS_WIDTH - 116, 100, 28);
  ctx.fill();

  ctx.fillStyle = THEME.cream;
  ctx.font = `700 34px "${fontFamily}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("King David & Esther", CANVAS_WIDTH / 2, 94);
  ctx.font = `500 14px "${fontFamily}"`;
  ctx.fillText("WEDDING ACCESS CARD", CANVAS_WIDTH / 2, 128);

  ctx.fillStyle = THEME.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `500 19px "${fontFamily}"`;
  let y = 190;
  y = drawWrappedText(ctx, "VENUE: Camp Young, Ede-Osogbo Rd, Nijhof Advies - Osun State", 76, y, 648, 28);
  y = drawWrappedText(ctx, "PROGRAM: Wedding ceremony starts at 10am. Reception celebration starts immediately after.", 76, y + 8, 648, 28);

  ctx.font = `700 17px "${fontFamily}"`;
  ctx.fillStyle = THEME.accent;
  ctx.fillText("CHILDREN ARE NOT ALLOWED", 76, y + 10);
  ctx.fillStyle = THEME.primary;
  ctx.fillText("NOT TRANSFERABLE", 76, y + 34);

  ctx.fillStyle = THEME.accent;
  drawRoundedRect(ctx, 76, 340, CANVAS_WIDTH - 152, 2, 1);
  ctx.fill();

  const panelHeight = 104;
  const panelY = CANVAS_HEIGHT - panelHeight - 38;
  ctx.fillStyle = THEME.primary;
  drawRoundedRect(ctx, 58, panelY, CANVAS_WIDTH - 116, panelHeight, 28);
  ctx.fill();

  ctx.fillStyle = THEME.cream;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 25px "${fontFamily}"`;
  ctx.fillText(options.fullName, CANVAS_WIDTH / 2, panelY + 30);

  ctx.font = `700 21px "${fontFamily}"`;
  ctx.fillText(`Unique entry code: ${options.entryCode}`, CANVAS_WIDTH / 2, panelY + 60);

  ctx.font = `500 16px "${fontFamily}"`;
  ctx.fillText(`${options.attendees} adult pass`, CANVAS_WIDTH / 2, panelY + 86);

  return canvas.toBuffer("image/png");
}
