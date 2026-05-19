"use client";
import { useEffect, useState } from "react";
import { PostData } from "@/types";
import { PostItem } from "./PostItem";
import { YouTubePlayerHandle } from "./YouTubePlayer";

interface Props {
  videoId: string;
  currentUserId: string;
  playerRef: React.RefObject<YouTubePlayerHandle>;
  refreshKey: number;
  onEditPost: (post: PostData) => void;
}

export function PostPanel({ videoId, currentUserId, playerRef, refreshKey, onEditPost }: Props) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ videoId });
    if (filter === "mine") params.set("userId", currentUserId);
    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); });
  }, [videoId, filter, refreshKey, currentUserId]);

  const handleDelete = async (postId: string) => {
    if (!confirm("この投稿を削除しますか？")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 text-sm py-1.5 rounded ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          全投稿
        </button>
        <button
          onClick={() => setFilter("mine")}
          className={`flex-1 text-sm py-1.5 rounded ${filter === "mine" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          自分の投稿
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-4">読み込み中...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">投稿がありません</p>
      ) : (
        <div className="overflow-y-auto flex-1 space-y-3">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              playerRef={playerRef}
              onEdit={onEditPost}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
