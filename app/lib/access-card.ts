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

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 1050;

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
  ctx.moveTo(50, 50);
  ctx.quadraticCurveTo(75, 35, 100, 55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.quadraticCurveTo(35, 75, 55, 100);
  ctx.stroke();

  // Bottom-right corner vine
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - 50, CANVAS_HEIGHT - 50);
  ctx.quadraticCurveTo(CANVAS_WIDTH - 75, CANVAS_HEIGHT - 35, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - 50, CANVAS_HEIGHT - 50);
  ctx.quadraticCurveTo(CANVAS_WIDTH - 35, CANVAS_HEIGHT - 75, CANVAS_WIDTH - 55, CANVAS_HEIGHT - 100);
  ctx.stroke();

  drawSmallFlower(ctx, 100, 55, 0.6);
  drawSmallFlower(ctx, 55, 100, 0.6);
  drawSmallFlower(ctx, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 55, 0.6);
  drawSmallFlower(ctx, CANVAS_WIDTH - 55, CANVAS_HEIGHT - 100, 0.6);
}

function drawPaletteStrip(ctx: any, fontFamily: string) {
  const swatchWidth = 73;
  const gap = 8;
  const total = swatchWidth * palette.length + gap * (palette.length - 1);
  let x = (CANVAS_WIDTH - total) / 2;
  const y = 625;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = `700 7px "${fontFamily}"`;

  for (const [name, color] of palette) {
    ctx.fillStyle = "rgba(255,248,239,0.88)";
    fillRound(ctx, x, y, swatchWidth, 36, 12);
    ctx.fillStyle = color;
    fillRound(ctx, x + 12, y + 6, swatchWidth - 24, 9, 999);
    ctx.fillStyle = "#2F3A22";
    ctx.fillText(name.toUpperCase(), x + swatchWidth / 2, y + 20);
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
  drawFlower(ctx, 80, 80, 1.1, -0.5);
  drawFlower(ctx, 520, 80, 1.0, 2.55);
  drawFlower(ctx, 80, 960, 0.9, -1.2);
  drawFlower(ctx, 520, 960, 1.0, 2.3);
  ctx.globalAlpha = 1;

  // Corner ornaments
  drawCornerOrnaments(ctx, fontFamily);

  // Outer border card
  ctx.fillStyle = "rgba(255,248,239,0.82)";
  fillRound(ctx, 25, 20, CANVAS_WIDTH - 50, CANVAS_HEIGHT - 40, 45);
  ctx.strokeStyle = "rgba(110,13,27,0.15)";
  ctx.lineWidth = 1.5;
  strokeRound(ctx, 25, 20, CANVAS_WIDTH - 50, CANVAS_HEIGHT - 40, 45);

  // Inner card area
  const cardGradient = ctx.createLinearGradient(50, 50, 550, 950);
  cardGradient.addColorStop(0, "#FFFDF8");
  cardGradient.addColorStop(0.45, "#F4E5DB");
  cardGradient.addColorStop(1, "#EADFC9");
  ctx.fillStyle = cardGradient;
  fillRound(ctx, 50, 50, CANVAS_WIDTH - 100, 930, 30);
  ctx.strokeStyle = "rgba(110,13,27,0.12)";
  ctx.lineWidth = 1;
  strokeRound(ctx, 50, 50, CANVAS_WIDTH - 100, 930, 30);

  // === MONOGRAM SEAL — interlocking wedding logo ===
  const sealGradient = ctx.createLinearGradient(215, 95, 385, 250);
  sealGradient.addColorStop(0, "#6E0D1B");
  sealGradient.addColorStop(0.5, "#8B5A46");
  sealGradient.addColorStop(1, "#2F3A22");
  ctx.fillStyle = sealGradient;
  fillRound(ctx, 215, 95, 170, 170, 85);
  ctx.strokeStyle = "rgba(255,248,239,0.75)";
  ctx.lineWidth = 5;
  strokeRound(ctx, 232, 112, 136, 136, 68);

  // Decorative ring border inside seal
  ctx.strokeStyle = "rgba(255,248,239,0.35)";
  ctx.lineWidth = 1.5;
  strokeRound(ctx, 245, 125, 110, 110, 55);

  // Ornamental dots around the ring
  const dotPositions = [
    [300, 127], [300, 225], [247, 178], [353, 178],
    [256, 138], [344, 138], [256, 218], [344, 218]
  ];
  ctx.fillStyle = "#FFF8EF";
  for (const [dx, dy] of dotPositions) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Monogram: large stylized "K" and "E" flanking a diamond
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Left letter: "K"
  ctx.fillStyle = "#FFF8EF";
  ctx.font = `700 48px "${fontFamily}"`;
  ctx.fillText("K", 266, 175);

  // Center decorative heart/diamond
  ctx.save();
  ctx.translate(300, 175);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#EBC2BB";
  ctx.beginPath();
  ctx.rect(-8, -8, 16, 16);
  ctx.fill();
  ctx.restore();

  // Right letter: "E"
  ctx.fillStyle = "#FFF8EF";
  ctx.font = `700 48px "${fontFamily}"`;
  ctx.fillText("E", 334, 175);

  // Small "D" above the heart
  ctx.font = `600 18px "${fontFamily}"`;
  ctx.fillStyle = "#EBC2BB";
  ctx.fillText("D", 300, 142);

  // Small decorative leaves/vines
  ctx.strokeStyle = "rgba(235,194,187,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(232, 130);
  ctx.quadraticCurveTo(218, 120, 214, 138);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(232, 126);
  ctx.quadraticCurveTo(220, 108, 210, 120);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(368, 130);
  ctx.quadraticCurveTo(382, 120, 386, 138);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(368, 126);
  ctx.quadraticCurveTo(380, 108, 390, 120);
  ctx.stroke();

  // Small leaf dots at vine ends
  ctx.fillStyle = "rgba(235,194,187,0.6)";
  for (const [lx, ly] of [[214, 138], [210, 120], [386, 138], [390, 120]]) {
    ctx.beginPath();
    ctx.arc(lx, ly, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // === COUPLE NAMES ===
  ctx.fillStyle = "#6E0D1B";
  ctx.font = `700 28px "${fontFamily}"`;
  ctx.fillText("King-David & Esther", CANVAS_WIDTH / 2, 310);

  ctx.fillStyle = "#2F3A22";
  ctx.font = `600 11px "${fontFamily}"`;
  ctx.fillText("WEDDING ACCESS CARD", CANVAS_WIDTH / 2, 345);

  // === DETAILS ROW ===
  ctx.fillStyle = "#2D241F";
  ctx.font = `500 13px "${fontFamily}"`;
  ctx.textAlign = "center";
  ctx.fillText("Saturday • 22 August 2026 • 10:00 AM", CANVAS_WIDTH / 2, 385);
  ctx.fillStyle = "#6E0D1B";
  ctx.font = `600 14px "${fontFamily}"`;
  ctx.fillText("Camp Young, Ede, Osun State, Nigeria", CANVAS_WIDTH / 2, 410);

  // Divider
  ctx.strokeStyle = "rgba(110,13,27,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 435);
  ctx.lineTo(500, 435);
  ctx.stroke();

  // === GUEST INFO PASS STRIP ===
  const passGradient = ctx.createLinearGradient(75, 460, 525, 540);
  passGradient.addColorStop(0, "#2F3A22");
  passGradient.addColorStop(0.42, "#6E0D1B");
  passGradient.addColorStop(1, "#8B5A46");
  ctx.fillStyle = passGradient;
  fillRound(ctx, 75, 458, 450, 85, 20);

  // Guest name (left side)
  ctx.fillStyle = "#FFF8EF";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `600 11px "${fontFamily}"`;
  ctx.fillText("GUEST", 105, 479);
  fitText(ctx, options.fullName, 200, 22, 12, fontFamily);
  ctx.fillText(options.fullName, 105, 509);

  // Entry code (right side)
  ctx.textAlign = "center";
  ctx.font = `600 11px "${fontFamily}"`;
  ctx.fillText("ENTRY CODE", 375, 479);
  ctx.font = `700 26px "${fontFamily}"`;
  ctx.fillText(options.entryCode, 375, 513);

  // === DETAILS BELOW PASS ===
  ctx.fillStyle = "#2D241F";
  ctx.textAlign = "left";
  ctx.font = `500 12px "${fontFamily}"`;
  ctx.fillText("📋 Wedding ceremony · Reception immediately after", 75, 578);

  ctx.textAlign = "right";
  ctx.fillText(`${options.attendees} Adult${options.attendees !== 1 ? "s" : ""} · Non-transferable`, 525, 578);

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
