import { createHash, timingSafeEqual } from "node:crypto";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SECRET;
  if (!password || !secret) return NextResponse.json({ error: "Вход администратора не настроен." }, { status: 503 });

  let submitted = "";
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && "password" in body && typeof body.password === "string") submitted = body.password;
  } catch {}

  const expectedHash = createHash("sha256").update(password).digest();
  const submittedHash = createHash("sha256").update(submitted).digest();
  if (!timingSafeEqual(expectedHash, submittedHash)) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return NextResponse.json({ error: "Неверный пароль." }, { status: 401 });
  }

  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(secret));
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
