import { NextResponse } from "next/server";
import { generateAccessCardImage } from "@/lib/access-card";

type AccessCardRequest = {
  fullName: string;
  entryCode: string;
  attendees: number;
};

export async function POST(request: Request) {
  let payload: AccessCardRequest;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request payload." }, { status: 400 });
  }

  if (!payload.fullName || !payload.entryCode || !payload.attendees) {
    return NextResponse.json({ ok: false, message: "Missing required card data." }, { status: 400 });
  }

  try {
    const imageBuffer = await generateAccessCardImage(payload);
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="KDE2026-access-card.png"`,
      },
    });
  } catch (error) {
    console.error("Access card generation error:", error);
    return NextResponse.json({ ok: false, message: "Failed to generate access card." }, { status: 500 });
  }
}
