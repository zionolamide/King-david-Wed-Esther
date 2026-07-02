import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export type AccessCardOptions = {
  fullName: string;
  entryCode: string;
  attendees: number;
};

const CARD_WIDTH = 1400;
const CARD_HEIGHT = 900;

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeCssColor(value: string): string {
  const trimmed = value.trim();
  if (/^\d+(deg)?\s+\d+%\s+\d+%$/.test(trimmed) || /^\d+\s+\d+%\s+\d+%$/.test(trimmed)) {
    return `hsl(${trimmed})`;
  }
  return trimmed;
}

function extractRootDeclarations(css: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const rootBlocks: string[] = [];

  const rootPattern = /:root\s*{([\s\S]*?)}/gi;
  let match;
  while ((match = rootPattern.exec(css))) {
    rootBlocks.push(match[1]);
  }

  const layerRootPattern = /@layer\s+base\s*{[\s\S]*?:root\s*{([\s\S]*?)}[\s\S]*?}/gi;
  while ((match = layerRootPattern.exec(css))) {
    rootBlocks.push(match[1]);
  }

  for (const block of rootBlocks) {
    const propPattern = /(--[\w-]+)\s*:\s*([^;]+);/gi;
    let propMatch;
    while ((propMatch = propPattern.exec(block))) {
      const key = propMatch[1].trim();
      const value = propMatch[2].trim();
      vars[key] = normalizeCssColor(value);
    }

    const simplePropPattern = /(color|background(?:-color)?)\s*:\s*([^;]+);/gi;
    while ((propMatch = simplePropPattern.exec(block))) {
      const key = propMatch[1].trim();
      const value = propMatch[2].trim();
      if (key === "color") {
        vars["--root-color"] = normalizeCssColor(value);
      }
      if (key === "background" || key === "background-color") {
        vars["--root-background"] = normalizeCssColor(value);
      }
    }
  }

  return vars;
}

async function loadCssVariables(): Promise<Record<string, string>> {
  const rootFiles = ["app/globals.css", "src/index.css"];
  const variables: Record<string, string> = {};

  for (const rootFile of rootFiles) {
    try {
      const filePath = path.resolve(process.cwd(), rootFile);
      const contents = await fs.readFile(filePath, "utf-8");
      const parsed = extractRootDeclarations(contents);
      Object.assign(variables, parsed);
    } catch {
      // ignore missing files when loading theme variables
    }
  }

  return variables;
}

function selectThemeColor(vars: Record<string, string>, keys: string[], fallback: string): string {
  for (const key of keys) {
    if (vars[key]) {
      return vars[key];
    }
  }
  return fallback;
}

export function buildAccessCardSvg(options: AccessCardOptions, themeVars: Record<string, string>) {
  const background = selectThemeColor(themeVars, ["--card", "--background", "--surface", "--root-background"], "#fbf6ed");
  const surface = selectThemeColor(themeVars, ["--card", "--background", "--surface"], "#fff7eb");
  const foreground = selectThemeColor(themeVars, ["--card-foreground", "--foreground", "--on-surface", "--root-color"], "#2d241f");
  const primary = selectThemeColor(themeVars, ["--primary", "--accent", "--wine", "--border"], "#7b0014");
  const primaryForeground = selectThemeColor(themeVars, ["--primary-foreground", "--card-foreground", "--on-primary"], "#fbf6ed");
  const secondary = selectThemeColor(themeVars, ["--secondary", "--muted", "--surface"], "#c89485");
  const border = selectThemeColor(themeVars, ["--border", "--ring", "--primary"], "#7b0014");
  const muted = selectThemeColor(themeVars, ["--muted", "--secondary", "--accent"], "#eadfc9");

  const safeFullName = escapeSvgText(options.fullName);
  const safeEntryCode = escapeSvgText(options.entryCode);
  const passText = `${options.attendees} pass${options.attendees === 1 ? "" : "es"}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="backgroundGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${background}" />
      <stop offset="100%" stop-color="${secondary}" stop-opacity="0.35" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="100%" stop-color="${secondary}" />
    </linearGradient>
  </defs>

  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="64" fill="${background}" />
  <rect x="32" y="32" width="${CARD_WIDTH - 64}" height="${CARD_HEIGHT - 64}" rx="54" fill="url(#backgroundGradient)" stroke="${border}" stroke-opacity="0.14" stroke-width="2" />

  <rect x="68" y="78" width="${CARD_WIDTH - 136}" height="210" rx="40" fill="${surface}" />
  <rect x="68" y="78" width="${CARD_WIDTH - 136}" height="210" rx="40" fill="url(#accentGradient)" opacity="0.12" />

  <text x="116" y="150" fill="${primary}" font-family="'Cormorant Garamond', Georgia, serif" font-size="58" font-weight="700">King David &amp; Esther</text>
  <text x="116" y="212" fill="${foreground}" font-family="'Montserrat', Arial, sans-serif" font-size="34" letter-spacing="0.14em">KDE2026</text>

  <line x1="116" y1="240" x2="1284" y2="240" stroke="${border}" stroke-width="2" stroke-opacity="0.16" />

  <text x="116" y="300" fill="${foreground}" font-family="'Montserrat', Arial, sans-serif" font-size="26" font-weight="600">Date</text>
  <text x="116" y="340" fill="${primary}" font-family="'Montserrat', Arial, sans-serif" font-size="30">Saturday, 22nd August 2026</text>

  <text x="116" y="400" fill="${foreground}" font-family="'Montserrat', Arial, sans-serif" font-size="26" font-weight="600">Venue</text>
  <text x="116" y="440" fill="${primary}" font-family="'Montserrat', Arial, sans-serif" font-size="30">Camp Young, Ede</text>

  <text x="116" y="500" fill="${foreground}" font-family="'Montserrat', Arial, sans-serif" font-size="22" opacity="0.86">Camp Young, Ede, Osun State, Nigeria</text>

  <rect x="116" y="530" width="1040" height="2" fill="${border}" opacity="0.12" />

  <text x="116" y="580" fill="${foreground}" font-family="'Montserrat', Arial, sans-serif" font-size="24" font-weight="600">Schedule</text>
  <text x="116" y="620" fill="${foreground}" font-family="'Montserrat', Arial, sans-serif" font-size="24">11:00 AM — Wedding ceremony</text>
  <text x="116" y="655" fill="${foreground}" font-family="'Montserrat', Arial, sans-serif" font-size="24">Reception follows immediately</text>
  <text x="116" y="690" fill="${foreground}" font-family="'Montserrat', Arial, sans-serif" font-size="24">Dinner, music and memories</text>

  <rect x="68" y="725" width="${CARD_WIDTH - 136}" height="132" rx="36" fill="${primary}" />
  <text x="116" y="790" fill="${primaryForeground}" font-family="'Montserrat', Arial, sans-serif" font-size="24" font-weight="600">${safeFullName}</text>
  <text x="116" y="835" fill="${primaryForeground}" font-family="'Montserrat', Arial, sans-serif" font-size="22">Code: ${safeEntryCode}</text>
  <text x="116" y="875" fill="${primaryForeground}" font-family="'Montserrat', Arial, sans-serif" font-size="22">${passText}</text>

  <text x="980" y="790" text-anchor="end" fill="${primaryForeground}" font-family="'Montserrat', Arial, sans-serif" font-size="18" font-weight="600">CHILDREN ARE NOT ALLOWED</text>
  <text x="980" y="825" text-anchor="end" fill="${primaryForeground}" font-family="'Montserrat', Arial, sans-serif" font-size="18" font-weight="600">NOT TRANSFERABLE</text>
</svg>`;
}

export async function generateAccessCardImage(options: AccessCardOptions) {
  const themeVars = await loadCssVariables();
  const svg = buildAccessCardSvg(options, themeVars);
  return sharp(Buffer.from(svg)).png({ quality: 100 }).toBuffer();
}
