import { useEffect, useRef } from "react";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import "./VideoPlayer.css";

const SEEK_SECONDS = 10;
const DOUBLE_TAP_WINDOW_MS = 300;

/**
 * Gắn lớp bắt cử chỉ chạm đúp ±10s vào ĐÚNG bên trong DOM mà Plyr tự
 * dựng lên (video.parentElement, tức .plyr__video-wrapper) — chứ
 * không phải làm anh em của cả khối .plyr. Plyr tự đặt
 * ".plyr { position: relative; z-index: 0 }" nên nó tạo ra 1 stacking
 * context riêng: nếu lớp gesture nằm NGOÀI .plyr, z-index của nó dù
 * cao đến đâu cũng đè lên TOÀN BỘ .plyr (kể cả thanh điều khiển bên
 * trong), làm mất khả năng bấm play/tua/settings. Chèn thẳng vào bên
 * trong thì z-index mới so sánh đúng ngữ cảnh với .plyr__controls.
 *
 * Dùng DOM thuần (không qua JSX) vì đây là node nằm ngoài tầm quản lý
 * của React (Plyr tự ý viết lại DOM quanh <video>).
 */
function mountGestureLayer(video, { onTap }) {
  const wrapper = video.parentElement;
  if (!wrapper) return null;

  const layer = document.createElement("div");
  layer.className = "video-gesture-layer";
  layer.setAttribute("aria-hidden", "true");

  const lastTap = { side: null, time: 0 };

  function makeZone(side) {
    const zone = document.createElement("div");
    zone.className = "video-gesture-layer__zone";
    zone.addEventListener("click", () => {
      const now = Date.now();
      const isDoubleTap =
        lastTap.side === side && now - lastTap.time < DOUBLE_TAP_WINDOW_MS;

      onTap(side, isDoubleTap);

      if (isDoubleTap) {
        lastTap.side = null;
        lastTap.time = 0;
        showFeedback(zone, side);
      } else {
        lastTap.side = side;
        lastTap.time = now;
      }
    });
    return zone;
  }

  function showFeedback(zone, side) {
    const badge = document.createElement("span");
    badge.className = "video-gesture-layer__feedback";
    badge.textContent =
      side === "left" ? `‹‹ ${SEEK_SECONDS}s` : `${SEEK_SECONDS}s ››`;
    zone.appendChild(badge);
    setTimeout(() => badge.remove(), 650);
  }

  const left = makeZone("left");
  const right = makeZone("right");
  layer.appendChild(left);
  layer.appendChild(right);
  wrapper.appendChild(layer);

  return layer;
}

/**
 * Phát link HLS (.m3u8) qua hls.js (dùng MSE, ổn định trên Chrome/Edge/
 * Firefox), giao diện điều khiển dùng Plyr (kiểu YouTube/Netflix) thay
 * cho control mặc định của trình duyệt. Chỉ fallback về native
 * <video src> khi hls.js không được hỗ trợ (Safari/iOS cũ) — ưu tiên
 * hls.js vì một số bản Chrome báo canPlayType(...) là "maybe" dù thực
 * tế không phát được HLS gốc.
 *
 * Ngoài ra tự thêm 2 hành vi kiểu app xem phim lớn mà Plyr không có
 * sẵn: chạm đúp trái/phải để tua ±10s, và tự vào/thoát toàn màn hình
 * kèm khoá màn hình ngang khi xoay máy (chỉ Android/Chrome hỗ trợ khoá
 * xoay qua JS — iOS Safari không có API này nên sẽ tự bỏ qua).
 */
export default function VideoPlayer({ src, poster, resumeTime, onProgress }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let handleLoadedMetadata;
    let gestureLayerEl;

    function seek(delta) {
      if (!Number.isFinite(video.duration)) return;
      video.currentTime = Math.min(
        Math.max(0, video.currentTime + delta),
        video.duration
      );
    }

    // Chạm 1 lần: hiện lại thanh điều khiển + phát tiếp nếu đang dừng
    // (lớp gesture che mất nút play to giữa màn hình của Plyr nên phải
    // tự làm thay). Chạm 2 lần liên tiếp cùng 1 bên: tua ±10s.
    function handleGestureTap(side, isDoubleTap) {
      playerRef.current?.toggleControls(true);
      if (video.paused) video.play();
      if (isDoubleTap) seek(side === "left" ? -SEEK_SECONDS : SEEK_SECONDS);
    }

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
        gestureLayerEl = mountGestureLayer(video, { onTap: handleGestureTap });

        if (resumeTime > 0) {
          video.currentTime = resumeTime;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      playerRef.current = new Plyr(video);
      gestureLayerEl = mountGestureLayer(video, { onTap: handleGestureTap });

      // Safari không có sự kiện MANIFEST_PARSED — dùng loadedmetadata
      // để biết lúc nào video đã có thời lượng, rồi mới tua tới vị trí
      // đã lưu.
      if (resumeTime > 0) {
        handleLoadedMetadata = () => {
          video.currentTime = resumeTime;
        };
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
      }
    }

    // Lưu tiến trình xem: throttle timeupdate (tối đa mỗi 5s) để không
    // ghi localStorage liên tục; luôn lưu ngay khi pause để không mất
    // vị trí lúc người dùng dừng xem.
    let lastSavedTime = 0;
    const handleTimeUpdate = () => {
      if (!onProgress) return;
      const { currentTime, duration } = video;
      if (!Number.isFinite(duration) || duration <= 0) return;
      if (currentTime - lastSavedTime < 5) return;
      lastSavedTime = currentTime;
      onProgress(currentTime, duration);
    };
    const handlePause = () => {
      if (!onProgress) return;
      const { currentTime, duration } = video;
      if (Number.isFinite(duration) && duration > 0) {
        onProgress(currentTime, duration);
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("pause", handlePause);

    return () => {
      handlePause(); // lưu vị trí lần cuối trước khi đổi tập/rời trang
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("pause", handlePause);
      if (handleLoadedMetadata) {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      }
      gestureLayerEl?.remove();
      playerRef.current?.destroy();
      playerRef.current = null;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Khoá màn hình ngang khi vào toàn màn hình, mở khoá khi thoát —
  // chủ yếu có tác dụng trên Android/Chrome, iOS Safari chưa hỗ trợ
  // Screen Orientation API nên lệnh lock() sẽ tự thất bại trong im lặng.
  useEffect(() => {
    function handleFullscreenChange() {
      if (document.fullscreenElement) {
        screen.orientation?.lock?.("landscape").catch(() => {});
      } else {
        screen.orientation?.unlock?.();
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Xoay máy sang ngang khi đang phát trên điện thoại → tự vào toàn màn
  // hình (giống YouTube/Netflix); xoay lại dọc → tự thoát. Chỉ áp dụng
  // cho thiết bị cảm ứng để không ảnh hưởng khi người dùng desktop thu
  // nhỏ/phóng to cửa sổ trình duyệt.
  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    function isLandscape() {
      return (
        screen.orientation?.type?.startsWith("landscape") ??
        window.innerWidth > window.innerHeight
      );
    }

    function handleOrientationChange() {
      const video = videoRef.current;
      const player = playerRef.current;
      if (!video || !player) return;

      if (isLandscape()) {
        if (!document.fullscreenElement && !video.paused) {
          player.fullscreen.enter();
        }
      } else if (document.fullscreenElement) {
        player.fullscreen.exit();
      }
    }

    const orientation = screen.orientation;
    if (orientation?.addEventListener) {
      orientation.addEventListener("change", handleOrientationChange);
      return () =>
        orientation.removeEventListener("change", handleOrientationChange);
    }
    window.addEventListener("orientationchange", handleOrientationChange);
    return () =>
      window.removeEventListener("orientationchange", handleOrientationChange);
  }, []);

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
