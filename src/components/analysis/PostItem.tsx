"use client";
import { PostData } from "@/types";
import { formatTime } from "@/lib/utils";
import { YouTubePlayerHandle } from "./YouTubePlayer";

const SEG_COLORS = ["text-blue-600", "text-green-600", "text-yellow-600", "text-red-600", "text-purple-600"];

interface Props {
  post: PostData;
  currentUserId: string;
  playerRef: React.RefObject<YouTubePlayerHandle>;
  onEdit: (post: PostData) => void;
  onDelete: (id: string) => void;
}

export function PostItem({ post, currentUserId, playerRef, onEdit, onDelete }: Props) {
  const isOwner = post.userId === currentUserId;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-sm font-medium">{post.user.displayName}</span>
          <span className="text-xs text-gray-400 ml-2">
            {new Date(post.createdAt).toLocaleDateString("ja-JP")}
          </span>
        </div>
        {isOwner && (
          <div className="flex gap-2 text-xs">
            <button onClick={() => onEdit(post)} className="text-blue-500 hover:text-blue-700">編集</button>
            <button onClick={() => onDelete(post.id)} className="text-red-400 hover:text-red-600">削除</button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {post.segments.map((seg, i) => (
          <div key={seg.id} className="pl-2 border-l-2 border-gray-200">
            <button
              onClick={() => playerRef.current?.seekTo(seg.startTime)}
              className={`text-sm font-medium ${SEG_COLORS[i % SEG_COLORS.length]} hover:underline`}
            >
              ▶ {formatTime(seg.startTime)} 〜 {formatTime(seg.endTime)}
            </button>
            <ul className="mt-1 space-y-0.5">
              {seg.comments.map((c) => (
                <li key={c.id} className="text-sm text-gray-700 pl-2">
                  {c.body}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
