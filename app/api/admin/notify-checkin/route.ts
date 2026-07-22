import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "KDE-admin2026";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: { fullName?: string; entryCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }

  if (!body.fullName || !body.entryCode) {
    return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;

  if (!emailUser || !emailPassword) {
    return NextResponse.json({ ok: false, message: "Email not configured" }, { status: 503 });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPassword },
      socketTimeout: 5_000,
    });

    await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      subject: `✅ Checked In: ${body.fullName}`,
      text: `${body.fullName} has been checked in at the venue.\n\nEntry Code: ${body.entryCode}\nTime: ${new Date().toLocaleString()}`,
    });

    transporter.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Check-in notification failed:", err);
    return NextResponse.json({ ok: false, message: "Email failed" }, { status: 500 });
  }
}
