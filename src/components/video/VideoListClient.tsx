"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { VideoSummary } from "@/types";
import { extractYoutubeId, thumbnailUrl } from "@/lib/utils";
import { AddVideoModal } from "./AddVideoModal";

interface Props {
  isAdmin: boolean;
}

export function VideoListClient({ isAdmin }: Props) {
  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    const res = await fetch("/api/videos");
    const data = await res.json();
    setVideos(data);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  if (loading) return <p className="text-center py-10 text-gray-500">読み込み中...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">動画一覧</h1>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
          >
            + 動画を追加
          </button>
        )}
      </div>

      {videos.length === 0 ? (
        <p className="text-gray-500 text-center py-10">動画が登録されていません</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => {
            const ytId = extractYoutubeId(v.youtubeUrl);
            return (
              <Link
                key={v.id}
                href={`/videos/${v.id}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
              >
                {ytId && (
                  <div className="relative w-full aspect-video bg-gray-100">
                    <Image
                      src={thumbnailUrl(ytId)}
                      alt={v.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-medium text-sm leading-snug">{v.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(v.postedAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showModal && (
        <AddVideoModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchVideos(); }}
        />
      )}
    </div>
  );
}
