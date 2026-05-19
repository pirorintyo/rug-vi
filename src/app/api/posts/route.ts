import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const commentSchema = z.object({ body: z.string().min(1) });
const segmentSchema = z.object({
  startTime: z.number().min(0),
  endTime: z.number().min(0),
  comments: z.array(commentSchema),
});
const createSchema = z.object({
  videoId: z.string(),
  segments: z.array(segmentSchema).min(1),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  const userId = searchParams.get("userId");

  const where: Record<string, string> = {};
  if (videoId) where.videoId = videoId;
  if (userId) where.userId = userId;

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, displayName: true } },
      segments: {
        orderBy: { startTime: "asc" },
        include: { comments: { orderBy: { order: "asc" } } },
      },
    },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容が正しくありません" }, { status: 400 });
  }

  const { videoId, segments } = parsed.data;

  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      videoId,
      segments: {
        create: segments.map((seg, si) => ({
          startTime: seg.startTime,
          endTime: seg.endTime,
          order: si,
          comments: {
            create: seg.comments.map((c, ci) => ({
              body: c.body,
              order: ci,
            })),
          },
        })),
      },
    },
    include: {
      user: { select: { id: true, displayName: true } },
      segments: {
        orderBy: { startTime: "asc" },
        include: { comments: { orderBy: { order: "asc" } } },
      },
    },
  });
  return NextResponse.json(post, { status: 201 });
}
