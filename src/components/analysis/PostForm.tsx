"use client";
import { useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { PostFormValues, PostData } from "@/types";
import { formatTime, parseTime } from "@/lib/utils";
import { YouTubePlayerHandle } from "./YouTubePlayer";

interface Props {
  videoId: string;
  playerRef: React.RefObject<YouTubePlayerHandle>;
  editingPost?: PostData | null;
  onSubmitted: () => void;
  onCancelEdit?: () => void;
  onSegmentsChange: (segs: { startTime: number; endTime: number }[]) => void;
}

const COLORS = ["border-blue-400", "border-green-400", "border-yellow-400", "border-red-400", "border-purple-400", "border-pink-400"];

export function PostForm({ videoId, playerRef, editingPost, onSubmitted, onCancelEdit, onSegmentsChange }: Props) {
  const defaultValues: PostFormValues = editingPost
    ? {
        segments: editingPost.segments.map((s) => ({
          startTime: formatTime(s.startTime),
          endTime: formatTime(s.endTime),
          comments: s.comments.map((c) => ({ body: c.body })),
        })),
      }
    : { segments: [{ startTime: "00:00", endTime: "00:00", comments: [{ body: "" }] }] };

  const { control, handleSubmit, register, setValue, watch, formState: { isSubmitting, errors } } = useForm<PostFormValues>({ defaultValues });

  const { fields: segFields, append: appendSeg, remove: removeSeg } = useFieldArray({ control, name: "segments" });

  const watchedSegments = watch("segments");

  const setTimeFromPlayer = (segIndex: number, field: "startTime" | "endTime") => {
    const t = playerRef.current?.getCurrentTime() ?? 0;
    setValue(`segments.${segIndex}.${field}`, formatTime(t));
    notifyParent();
  };

  const notifyParent = () => {
    const segs = watchedSegments.map((s) => ({
      startTime: parseTime(s.startTime),
      endTime: parseTime(s.endTime),
    }));
    onSegmentsChange(segs);
  };

  const onSubmit = async (data: PostFormValues) => {
    const payload = {
      videoId,
      segments: data.segments.map((s) => ({
        startTime: parseTime(s.startTime),
        endTime: parseTime(s.endTime),
        comments: s.comments.filter((c) => c.body.trim()),
      })),
    };

    const url = editingPost ? `/api/posts/${editingPost.id}` : "/api/posts";
    const method = editingPost ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) onSubmitted();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} onChange={notifyParent} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-base">
          {editingPost ? "投稿を編集" : "新しい分析投稿"}
        </h2>
        {editingPost && (
          <button type="button" onClick={onCancelEdit} className="text-sm text-gray-500 hover:text-gray-700">
            キャンセル
          </button>
        )}
      </div>

      {segFields.map((segField, si) => (
        <SegmentBlock
          key={segField.id}
          index={si}
          control={control}
          register={register}
          colorClass={COLORS[si % COLORS.length]}
          canRemove={segFields.length > 1}
          onRemove={() => removeSeg(si)}
          onSetTime={(f) => setTimeFromPlayer(si, f)}
        />
      ))}

      <button
        type="button"
        onClick={() => appendSeg({ startTime: "00:00", endTime: "00:00", comments: [{ body: "" }] })}
        className="w-full border-2 border-dashed border-gray-300 rounded py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500"
      >
        + 区間を追加
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "保存中..." : editingPost ? "更新する" : "投稿する"}
      </button>
    </form>
  );
}

// ----- Segment sub-component -----
interface SegmentBlockProps {
  index: number;
  control: ReturnType<typeof useForm<PostFormValues>>["control"];
  register: ReturnType<typeof useForm<PostFormValues>>["register"];
  colorClass: string;
  canRemove: boolean;
  onRemove: () => void;
  onSetTime: (field: "startTime" | "endTime") => void;
}

function SegmentBlock({ index, control, register, colorClass, canRemove, onRemove, onSetTime }: SegmentBlockProps) {
  const { fields: cmtFields, append: appendCmt, remove: removeCmt } =
    useFieldArray({ control, name: `segments.${index}.comments` });

  return (
    <div className={`border-l-4 ${colorClass} pl-3 py-2 bg-gray-50 rounded-r`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">区間 {index + 1}</span>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">
            削除
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-xs text-gray-500">開始 (MM:SS)</label>
          <div className="flex gap-1">
            <input
              {...register(`segments.${index}.startTime`)}
              placeholder="00:00"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <button
              type="button"
              title="現在時刻をセット"
              onClick={() => onSetTime("startTime")}
              className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300 whitespace-nowrap"
            >
              ▶
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500">終了 (MM:SS)</label>
          <div className="flex gap-1">
            <input
              {...register(`segments.${index}.endTime`)}
              placeholder="00:00"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <button
              type="button"
              title="現在時刻をセット"
              onClick={() => onSetTime("endTime")}
              className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300 whitespace-nowrap"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {cmtFields.map((cmtField, ci) => (
          <div key={cmtField.id} className="flex gap-1">
            <input
              {...register(`segments.${index}.comments.${ci}.body`)}
              placeholder={`コメント ${ci + 1}`}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
            />
            {cmtFields.length > 1 && (
              <button
                type="button"
                onClick={() => removeCmt(ci)}
                className="text-xs text-red-400 hover:text-red-600 px-1"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => appendCmt({ body: "" })}
          className="text-xs text-blue-500 hover:text-blue-700 mt-1"
        >
          + コメントを追加
        </button>
      </div>
    </div>
  );
}
