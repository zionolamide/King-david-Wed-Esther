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

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;

let fontRegistered = false;

const palette = [
  ["Sage Green", "#6F7A57"],
  ["Deep Wine", "#6E0D1B"],
  ["Warm Brown", "#8B5A46"],
  ["Terracotta", "#C9785E"],
  ["Dusty Nude", "#D7A79C"],
  ["Blush Pink", "#EBC2BB"],
];

function drawRoundedRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function fillRound(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.fill();
}

function strokeRound(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();
}

function registerCardFont() {
  if (fontRegistered) return "KDEFont";

  const candidates = [
    path.join(process.cwd(), "public", "fonts", "Montserrat-Regular.ttf"),
    "C:\\Windows\\Fonts\\arial.ttf",
    "C:\\Windows\\Fonts\\calibri.ttf",
    "C:\\Windows\\Fonts\\segoeui.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
  ];

  for (const fontPath of candidates) {
    try {
      if (fs.existsSync(fontPath)) {
        registerFont(fontPath, { family: "KDEFont" });
        fontRegistered = true;
        return "KDEFont";
      }
    } catch {
      // Try the next font.
    }
  }

  return "Arial";
}

function fitText(ctx: any, text: string, maxWidth: number, startSize: number, minSize: number, family: string) {
  let size = startSize;
  ctx.font = `700 ${size}px "${family}"`;
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 1;
    ctx.font = `700 ${size}px "${family}"`;
  }
}

function drawWrappedText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = next;
    }
  }

  if (line) ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

function drawFlower(ctx: any, x: number, y: number, scale: number, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  const petals: any[] = [
    ["#EBC2BB", -24, -8, 28, 15, -0.45],
    ["#D7A79C", 24, -8, 28, 15, 0.45],
    ["#C9785E", 0, 24, 26, 14, 1.2],
    ["#FFF8EF", 0, -26, 24, 13, -1.2],
  ];

  for (const [color, px, py, width, height, angle] of petals) {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = "#6E0D1B";
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(111,122,87,0.38)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(8, 22);
  ctx.bezierCurveTo(34, 52, 70, 58, 104, 72);
  ctx.stroke();
  ctx.restore();
}

function drawSmallFlower(ctx: any, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Simple 4-petal flower
  const petalColor = "rgba(235,194,187,0.6)";
  ctx.fillStyle = petalColor;
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 2);
    ctx.beginPath();
    ctx.ellipse(0, -8, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#C9785E";
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCornerOrnaments(ctx: any, fontFamily: string) {
  // Top-left corner vine
  ctx.strokeStyle = "rgba(111,122,87,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 60);
  ctx.quadraticCurveTo(90, 42, 120, 65);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(60, 60);
  ctx.quadraticCurveTo(42, 90, 65, 120);
  ctx.stroke();

  // Bottom-right corner vine
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - 60, CANVAS_HEIGHT - 60);
  ctx.quadraticCurveTo(CANVAS_WIDTH - 90, CANVAS_HEIGHT - 42, CANVAS_WIDTH - 120, CANVAS_HEIGHT - 65);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - 60, CANVAS_HEIGHT - 60);
  ctx.quadraticCurveTo(CANVAS_WIDTH - 42, CANVAS_HEIGHT - 90, CANVAS_WIDTH - 65, CANVAS_HEIGHT - 120);
  ctx.stroke();

  drawSmallFlower(ctx, 120, 65, 0.7);
  drawSmallFlower(ctx, 65, 120, 0.7);
  drawSmallFlower(ctx, CANVAS_WIDTH - 120, CANVAS_HEIGHT - 65, 0.7);
  drawSmallFlower(ctx, CANVAS_WIDTH - 65, CANVAS_HEIGHT - 120, 0.7);
}

function drawPaletteStrip(ctx: any, fontFamily: string) {
  const swatchWidth = 118;
  const gap = 10;
  const total = swatchWidth * palette.length + gap * (palette.length - 1);
  let x = (CANVAS_WIDTH - total) / 2;
  const y = 635;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = `700 7px "${fontFamily}"`;

  for (const [name, color] of palette) {
    ctx.fillStyle = "rgba(255,248,239,0.88)";
    fillRound(ctx, x, y, swatchWidth, 38, 14);
    ctx.fillStyle = color;
    fillRound(ctx, x + 14, y + 7, swatchWidth - 28, 10, 999);
    ctx.fillStyle = "#2F3A22";
    ctx.fillText(name.toUpperCase(), x + swatchWidth / 2, y + 22);
    x += swatchWidth + gap;
  }
}

export async function generateAccessCardImage(options: AccessCardOptions) {
  const fontFamily = registerCardFont();
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx: any = canvas.getContext("2d");

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  bg.addColorStop(0, "#FFFFFF");
  bg.addColorStop(0.4, "#FBF6ED");
  bg.addColorStop(1, "#EADFC9");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Decorative flowers in background
  ctx.globalAlpha = 0.18;
  drawFlower(ctx, 96, 100, 1.35, -0.5);
  drawFlower(ctx, 910, 100, 1.18, 2.55);
  drawFlower(ctx, 88, 580, 1.0, -1.2);
  drawFlower(ctx, 920, 570, 1.1, 2.3);
  ctx.globalAlpha = 1;

  // Corner ornaments
  drawCornerOrnaments(ctx, fontFamily);

  // Outer border card
  ctx.fillStyle = "rgba(255,248,239,0.82)";
  fillRound(ctx, 30, 25, CANVAS_WIDTH - 60, CANVAS_HEIGHT - 50, 50);
  ctx.strokeStyle = "rgba(110,13,27,0.15)";
  ctx.lineWidth = 1.5;
  strokeRound(ctx, 30, 25, CANVAS_WIDTH - 60, CANVAS_HEIGHT - 50, 50);

  // Inner card area
  const cardGradient = ctx.createLinearGradient(70, 65, 930, 500);
  cardGradient.addColorStop(0, "#FFFDF8");
  cardGradient.addColorStop(0.45, "#F4E5DB");
  cardGradient.addColorStop(1, "#EADFC9");
  ctx.fillStyle = cardGradient;
  fillRound(ctx, 70, 65, CANVAS_WIDTH - 140, 480, 36);
  ctx.strokeStyle = "rgba(110,13,27,0.12)";
  ctx.lineWidth = 1;
  strokeRound(ctx, 70, 65, CANVAS_WIDTH - 140, 480, 36);

  // === MONOGRAM SEAL — interlocking wedding logo ===
  const sealGradient = ctx.createLinearGradient(380, 90, 620, 290);
  sealGradient.addColorStop(0, "#6E0D1B");
  sealGradient.addColorStop(0.5, "#8B5A46");
  sealGradient.addColorStop(1, "#2F3A22");
  ctx.fillStyle = sealGradient;
  fillRound(ctx, 400, 92, 200, 200, 100);
  ctx.strokeStyle = "rgba(255,248,239,0.75)";
  ctx.lineWidth = 6;
  strokeRound(ctx, 418, 110, 164, 164, 82);

  // Decorative ring border inside seal
  ctx.strokeStyle = "rgba(255,248,239,0.35)";
  ctx.lineWidth = 1.5;
  strokeRound(ctx, 432, 124, 136, 136, 68);

  // Ornamental dots around the ring (top, bottom, left, right)
  const dotPositions = [
    [500, 126], [500, 274], [434, 200], [566, 200],
    [445, 138], [555, 138], [445, 262], [555, 262]
  ];
  ctx.fillStyle = "#FFF8EF";
  for (const [dx, dy] of dotPositions) {
    ctx.beginPath();
    ctx.arc(dx, dy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Monogram: large stylized "K" and "E" flanking a small "&" or decorative heart
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Left letter: "K"
  ctx.fillStyle = "#FFF8EF";
  ctx.font = `700 52px "${fontFamily}"`;
  ctx.fillText("K", 460, 192);

  // Center decorative heart/diamond
  ctx.save();
  ctx.translate(500, 192);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#EBC2BB";
  ctx.beginPath();
  ctx.rect(-8, -8, 16, 16);
  ctx.fill();
  ctx.restore();

  // Right letter: "E"
  ctx.fillStyle = "#FFF8EF";
  ctx.font = `700 52px "${fontFamily}"`;
  ctx.fillText("E", 540, 192);

  // Small "D" above the heart
  ctx.font = `600 20px "${fontFamily}"`;
  ctx.fillStyle = "#EBC2BB";
  ctx.fillText("D", 500, 160);

  // Small decorative leaves/vines curving from the seal sides
  ctx.strokeStyle = "rgba(235,194,187,0.5)";
  ctx.lineWidth = 2.5;
  // Left vine
  ctx.beginPath();
  ctx.moveTo(418, 150);
  ctx.quadraticCurveTo(395, 140, 390, 160);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(418, 145);
  ctx.quadraticCurveTo(400, 120, 385, 135);
  ctx.stroke();
  // Right vine
  ctx.beginPath();
  ctx.moveTo(582, 150);
  ctx.quadraticCurveTo(605, 140, 610, 160);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(582, 145);
  ctx.quadraticCurveTo(600, 120, 615, 135);
  ctx.stroke();

  // Small leaf dots at vine ends
  ctx.fillStyle = "rgba(235,194,187,0.6)";
  for (const [lx, ly] of [[390, 160], [385, 135], [610, 160], [615, 135]]) {
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // === COUPLE NAMES ===
  ctx.fillStyle = "#6E0D1B";
  ctx.font = `700 32px "${fontFamily}"`;
  ctx.fillText("King-David & Esther", CANVAS_WIDTH / 2, 335);

  ctx.fillStyle = "#2F3A22";
  ctx.font = `600 13px "${fontFamily}"`;
  ctx.fillText("WEDDING ACCESS PASS", CANVAS_WIDTH / 2, 370);

  // === DETAILS ROW ===
  ctx.fillStyle = "#2D241F";
  ctx.font = `500 15px "${fontFamily}"`;
  ctx.textAlign = "center";
  ctx.fillText("Saturday • 22 August 2026 • 10:00 AM", CANVAS_WIDTH / 2, 408);
  ctx.fillStyle = "#6E0D1B";
  ctx.font = `600 16px "${fontFamily}"`;
  ctx.fillText("Camp Young, Ede, Osun State, Nigeria", CANVAS_WIDTH / 2, 432);

  // Divider
  ctx.strokeStyle = "rgba(110,13,27,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(140, 450);
  ctx.lineTo(860, 450);
  ctx.stroke();

  // === GUEST INFO PASS STRIP ===
  const passGradient = ctx.createLinearGradient(100, 470, 900, 540);
  passGradient.addColorStop(0, "#2F3A22");
  passGradient.addColorStop(0.42, "#6E0D1B");
  passGradient.addColorStop(1, "#8B5A46");
  ctx.fillStyle = passGradient;
  fillRound(ctx, 100, 468, 800, 75, 24);

  // Guest name
  ctx.fillStyle = "#FFF8EF";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `600 14px "${fontFamily}"`;
  ctx.fillText("GUEST", 130, 490);
  fitText(ctx, options.fullName, 320, 26, 14, fontFamily);
  ctx.fillText(options.fullName, 130, 518);

  // Entry code
  ctx.textAlign = "center";
  ctx.font = `600 12px "${fontFamily}"`;
  ctx.fillText("ENTRY CODE", 672, 490);
  ctx.font = `700 30px "${fontFamily}"`;
  ctx.fillText(options.entryCode, 672, 525);

  // === DETAILS BELOW PASS ===
  ctx.fillStyle = "#2D241F";
  ctx.textAlign = "left";
  ctx.font = `500 13px "${fontFamily}"`;
  ctx.fillText("📋 Wedding ceremony · Reception immediately after", 130, 568);

  ctx.textAlign = "right";
  ctx.fillText(`${options.attendees} Adult${options.attendees !== 1 ? "s" : ""} · Non-transferable`, 870, 568);

  // === PALETTE STRIP ===
  drawPaletteStrip(ctx, fontFamily);

  // === WATERMARK ===
  ctx.fillStyle = "rgba(110,13,27,0.04)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 9px "${fontFamily}"`;
  ctx.fillText("KING DAVID & ESTHER · 22 AUG 2026", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 14);

  return canvas.toBuffer("image/png");
}
