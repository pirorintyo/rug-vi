"use client";
import { formatTime } from "@/lib/utils";

interface Seg {
  startTime: number;
  endTime: number;
}

interface Props {
  duration: number;
  segments: Seg[];
  onSeek: (time: number) => void;
}

const COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-400",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-400",
];

export function SegmentTimeline({ duration, segments, onSeek }: Props) {
  if (!duration) return null;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(duration, ratio * duration)));
  };

  return (
    <div className="mt-2">
      <div
        className="relative h-5 bg-gray-200 rounded cursor-pointer select-none"
        onClick={handleClick}
      >
        {segments.map((seg, i) => {
          const left = (seg.startTime / duration) * 100;
          const width = ((seg.endTime - seg.startTime) / duration) * 100;
          return (
            <div
              key={i}
              title={`区間${i + 1}: ${formatTime(seg.startTime)} - ${formatTime(seg.endTime)}`}
              className={`absolute h-full ${COLORS[i % COLORS.length]} opacity-80 rounded`}
              style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(seg.startTime);
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-0.5 px-0.5">
        <span>0:00</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
