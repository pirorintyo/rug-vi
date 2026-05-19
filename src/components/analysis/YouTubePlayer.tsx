"use client";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

export interface YouTubePlayerHandle {
  getCurrentTime: () => number;
  seekTo: (time: number) => void;
  getDuration: () => number;
}

interface Props {
  videoId: string;
  onReady?: (duration: number) => void;
  onPausedChange?: (paused: boolean) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(
  ({ videoId, onReady, onPausedChange }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const onReadyRef = useRef(onReady);
    const onPausedChangeRef = useRef(onPausedChange);
    onReadyRef.current = onReady;
    onPausedChangeRef.current = onPausedChange;

    const playerId = `yt-player-${videoId}`;

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => playerRef.current?.getCurrentTime() ?? 0,
      seekTo: (t: number) => playerRef.current?.seekTo(t, true),
      getDuration: () => playerRef.current?.getDuration() ?? 0,
    }));

    useEffect(() => {
      const createPlayer = () => {
        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch { /* ignore */ }
          playerRef.current = null;
        }
        playerRef.current = new window.YT.Player(playerId, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onReady: (e: any) => {
              onReadyRef.current?.(e.target.getDuration());
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onStateChange: (e: any) => {
              // YT.PlayerState: PLAYING=1, PAUSED=2, ENDED=0
              if (e.data === 1) onPausedChangeRef.current?.(false);
              if (e.data === 2 || e.data === 0) onPausedChangeRef.current?.(true);
            },
          },
        });
      };

      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          createPlayer();
        };

        if (!document.getElementById("yt-api-script")) {
          const script = document.createElement("script");
          script.id = "yt-api-script";
          script.src = "https://www.youtube.com/iframe_api";
          document.head.appendChild(script);
        }
      }

      return () => {
        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch { /* ignore */ }
          playerRef.current = null;
        }
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId]);

    return (
      <div className="w-full aspect-video bg-black rounded overflow-hidden">
        <div id={playerId} className="w-full h-full" />
      </div>
    );
  }
);
YouTubePlayer.displayName = "YouTubePlayer";
