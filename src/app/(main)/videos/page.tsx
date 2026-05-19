import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VideoListClient } from "@/components/video/VideoListClient";

export default async function VideosPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "ADMIN";
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <VideoListClient isAdmin={isAdmin} />
    </div>
  );
}
