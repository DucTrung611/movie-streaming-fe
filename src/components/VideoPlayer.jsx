import { useEffect, useRef } from "react";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import "./VideoPlayer.css";

/**
 * Phát link HLS (.m3u8) qua hls.js (dùng MSE, ổn định trên Chrome/Edge/
 * Firefox), giao diện điều khiển dùng Plyr (kiểu YouTube/Netflix) thay
 * cho control mặc định của trình duyệt. Chỉ fallback về native
 * <video src> khi hls.js không được hỗ trợ (Safari/iOS cũ) — ưu tiên
 * hls.js vì một số bản Chrome báo canPlayType(...) là "maybe" dù thực
 * tế không phát được HLS gốc.
 */
export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const heights = [...new Set(hls.levels.map((l) => l.height))].sort(
          (a, b) => b - a
        );

        playerRef.current = new Plyr(video, {
          quality: {
            default: 0,
            options: [0, ...heights],
            forced: true,
            onChange: (height) => {
              if (height === 0) {
                hls.currentLevel = -1;
                return;
              }
              const levelIndex = hls.levels.findIndex(
                (l) => l.height === height
              );
              if (levelIndex !== -1) hls.currentLevel = levelIndex;
            },
          },
          i18n: { qualityLabel: { 0: "Tự động" } },
        });
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      playerRef.current = new Plyr(video);
    }

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="video-player"
      controls
      autoPlay
      playsInline
      poster={poster}
    />
  );
}
