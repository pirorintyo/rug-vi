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
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(
  ({ videoId, onReady }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;

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
          },
        });
      };

      if (window.YT && window.YT.Player) {
        // API already loaded
        createPlayer();
      } else {
        // Queue callback (may already be queued by another instance)
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          createPlayer();
        };

        // Inject script only once
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
