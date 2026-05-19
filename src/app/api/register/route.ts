import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(50),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容が正しくありません" }, { status: 400 });
  }

  const { email, displayName, password } = parsed.data;

  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
  if (allowedDomain) {
    const domain = email.split("@")[1];
    if (domain !== allowedDomain) {
      return NextResponse.json(
        { error: `登録できるのは @${allowedDomain} のメールアドレスのみです` },
        { status: 403 }
      );
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, displayName, passwordHash },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
