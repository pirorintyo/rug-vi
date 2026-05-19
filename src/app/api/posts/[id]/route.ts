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
const updateSchema = z.object({
  segments: z.array(segmentSchema).min(1),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.userId !== session.user.id) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容が正しくありません" }, { status: 400 });
  }

  // Delete existing segments (cascade deletes comments)
  await prisma.segment.deleteMany({ where: { postId: params.id } });

  const updated = await prisma.post.update({
    where: { id: params.id },
    data: {
      segments: {
        create: parsed.data.segments.map((seg, si) => ({
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
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.userId !== session.user.id) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
