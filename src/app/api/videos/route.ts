import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  youtubeUrl: z.string().url(),
  title: z.string().min(1).max(200),
  postedAt: z.string(),
});

export async function GET() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, youtubeUrl: true, postedAt: true, createdAt: true },
  });
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未認証" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "管理者のみ登録できます" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容が正しくありません" }, { status: 400 });
  }

  const video = await prisma.video.create({
    data: {
      ...parsed.data,
      postedAt: new Date(parsed.data.postedAt),
      registeredById: session.user.id,
    },
  });
  return NextResponse.json(video, { status: 201 });
}
