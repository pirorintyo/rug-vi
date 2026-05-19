"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { VideoSummary, PostData } from "@/types";
import { extractYoutubeId } from "@/lib/utils";
import { YouTubePlayer, YouTubePlayerHandle } from "./YouTubePlayer";
import { SegmentTimeline } from "./SegmentTimeline";
import { PostForm } from "./PostForm";
import { PostPanel } from "./PostPanel";

interface Props {
  video: VideoSummary;
  currentUserId: string;
}

export function VideoAnalysisClient({ video, currentUserId }: Props) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const [duration, setDuration] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewSegments, setPreviewSegments] = useState<{ startTime: number; endTime: number }[]>([]);

  const ytId = extractYoutubeId(video.youtubeUrl);

  const handleSubmitted = () => {
    setEditingPost(null);
    setRefreshKey((k) => k + 1);
    setPreviewSegments([]);
  };

  if (!ytId) {
    return <p className="text-center py-10 text-red-500">無効なYouTube URLです</p>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-3">
        <Link href="/videos" className="text-sm text-gray-500 hover:text-gray-700">← 一覧</Link>
        <h1 className="text-sm font-semibold truncate flex-1">{video.title}</h1>
        <button
          onClick={() => setIsPanelOpen((o) => !o)}
          className={`text-sm px-3 py-1.5 rounded font-medium ${isPanelOpen ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          {isPanelOpen ? "投稿を閉じる" : "投稿を見る"}
        </button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: player + form */}
        <div className={`flex flex-col overflow-y-auto p-4 gap-4 transition-all duration-200 ${isPanelOpen ? "w-full lg:w-3/5" : "w-full max-w-3xl mx-auto"}`}>
          {/* YouTube player */}
          <YouTubePlayer
            ref={playerRef}
            videoId={ytId}
            onReady={(d) => setDuration(d)}
          />

          {/* Custom timeline */}
          <SegmentTimeline
            duration={duration}
            segments={previewSegments}
            onSeek={(t) => playerRef.current?.seekTo(t)}
          />

          {/* Post form */}
          <div className="bg-white rounded-lg shadow p-4">
            <PostForm
              videoId={video.id}
              playerRef={playerRef}
              editingPost={editingPost}
              onSubmitted={handleSubmitted}
              onCancelEdit={() => { setEditingPost(null); setPreviewSegments([]); }}
              onSegmentsChange={setPreviewSegments}
            />
          </div>
        </div>

        {/* Right: post panel */}
        {isPanelOpen && (
          <div className="hidden lg:flex flex-col w-2/5 border-l bg-gray-50 p-4 overflow-hidden">
            <h2 className="font-semibold text-sm mb-3">この動画の投稿</h2>
            <PostPanel
              videoId={video.id}
              currentUserId={currentUserId}
              playerRef={playerRef}
              refreshKey={refreshKey}
              onEditPost={(post) => {
                setEditingPost(post);
                setPreviewSegments(post.segments.map((s) => ({ startTime: s.startTime, endTime: s.endTime })));
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile panel overlay */}
      {isPanelOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsPanelOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">この動画の投稿</h2>
              <button onClick={() => setIsPanelOpen(false)} className="text-gray-500 text-lg">×</button>
            </div>
            <PostPanel
              videoId={video.id}
              currentUserId={currentUserId}
              playerRef={playerRef}
              refreshKey={refreshKey}
              onEditPost={(post) => {
                setEditingPost(post);
                setIsPanelOpen(false);
                setPreviewSegments(post.segments.map((s) => ({ startTime: s.startTime, endTime: s.endTime })));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
