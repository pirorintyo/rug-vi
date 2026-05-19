import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VideoAnalysisClient } from "@/components/analysis/VideoAnalysisClient";

export default async function VideoPage({ params }: { params: { id: string } }) {
  const [session, video] = await Promise.all([
    getServerSession(authOptions),
    prisma.video.findUnique({ where: { id: params.id } }),
  ]);

  if (!video) notFound();

  return (
    <VideoAnalysisClient
      video={{
        id: video.id,
        title: video.title,
        youtubeUrl: video.youtubeUrl,
        postedAt: video.postedAt.toISOString(),
        createdAt: video.createdAt.toISOString(),
      }}
      currentUserId={session!.user.id}
    />
  );
}
