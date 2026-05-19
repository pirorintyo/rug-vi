"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormValues {
  youtubeUrl: string;
  title: string;
  postedAt: string;
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function AddVideoModal({ onClose, onCreated }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "登録に失敗しました");
    } else {
      onCreated();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">動画を追加</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">YouTube URL</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              {...register("youtubeUrl", { required: true })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.youtubeUrl && <p className="text-red-500 text-xs mt-1">URLを入力してください</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">動画タイトル</label>
            <input
              type="text"
              {...register("title", { required: true })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">タイトルを入力してください</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">投稿日</label>
            <input
              type="date"
              {...register("postedAt", { required: true })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.postedAt && <p className="text-red-500 text-xs mt-1">日付を入力してください</p>}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 rounded py-2 text-sm hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "登録中..." : "登録する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
