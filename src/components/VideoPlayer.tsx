import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import "./VideoPlayer.css";

const SEEK_SECONDS = 10;
const DOUBLE_TAP_WINDOW_MS = 300;

// Trên điện thoại, bỏ nút loa/thanh âm lượng của Plyr — người dùng
// chỉnh âm lượng bằng nút cứng của máy sẽ nhanh và quen thuộc hơn.
// Âm lượng video mặc định giữ nguyên 100% (mức mặc định của Plyr).
const TOUCH_CONTROLS = [
  "play-large",
  "play",
  "progress",
  "current-time",
  "captions",
  "settings",
  "pip",
  "airplay",
  "fullscreen",
];

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
type GestureSide = "left" | "right";

function mountGestureLayer(
  video: HTMLVideoElement,
  { onTap }: { onTap: (side: GestureSide, isDoubleTap: boolean) => void }
): HTMLDivElement | null {
  const wrapper = video.parentElement;
  if (!wrapper) return null;

  const layer = document.createElement("div");
  layer.className = "video-gesture-layer";
  layer.setAttribute("aria-hidden", "true");

  const lastTap: { side: GestureSide | null; time: number } = {
    side: null,
    time: 0,
  };

  function makeZone(side: GestureSide) {
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
    // Plyr tự lắng nghe "dblclick" trên container để bật/tắt toàn màn
    // hình (xem plyr/dist/plyr.js, fullscreen.js). Sự kiện dblclick của
    // trình duyệt vẫn nổi bọt lên container dù ta chỉ bắt "click" ở
    // trên — nếu không chặn, chạm đúp để tua sẽ vô tình kích hoạt luôn
    // toàn màn hình (và khoá xoay ngang đi kèm). Chặn nổi bọt ở đây để
    // chạm đúp chỉ tua, không xoay/toàn màn hình.
    zone.addEventListener("dblclick", (event) => event.stopPropagation());
    return zone;
  }

  function showFeedback(zone: HTMLDivElement, side: GestureSide) {
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
interface VideoPlayerProps {
  src: string;
  poster?: string;
  resumeTime?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  /** Gọi khi việc phát bị lỗi không thể tự phục hồi (link hỏng, bị chặn
   * hotlink, mạng chập chờn quá số lần thử lại...) — nơi gọi component
   * này có thể chuyển sang server/nguồn phát khác. */
  onFatalError?: () => void;
}

const PLAYBACK_ERROR_MESSAGE =
  "Không phát được video. Vui lòng thử server khác hoặc tải lại trang.";

export default function VideoPlayer({
  src,
  poster,
  resumeTime,
  onProgress,
  onFatalError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerRef = useRef<Plyr | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setPlaybackError(null);
    let handleLoadedMetadata: (() => void) | undefined;
    let gestureLayerEl: HTMLDivElement | null = null;
    const resumeAt = resumeTime ?? 0;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    // hls.js có thể tự phục hồi lỗi mạng bằng cách nạp lại — nhưng nếu
    // lỗi lặp lại liên tục (link chết hẳn, không phải chập chờn tạm
    // thời) thì phải dừng thử và báo lỗi thay vì lặp vô hạn.
    let networkRetryCount = 0;
    const MAX_NETWORK_RETRIES = 3;

    function reportFatalError() {
      setPlaybackError(PLAYBACK_ERROR_MESSAGE);
      onFatalError?.();
    }

    function seek(delta: number) {
      if (!video || !Number.isFinite(video.duration)) return;
      video.currentTime = Math.min(
        Math.max(0, video.currentTime + delta),
        video.duration
      );
    }

    // Chạm 1 lần: hiện lại thanh điều khiển + phát tiếp nếu đang dừng
    // (lớp gesture che mất nút play to giữa màn hình của Plyr nên phải
    // tự làm thay). Chạm 2 lần liên tiếp cùng 1 bên: tua ±10s.
    function handleGestureTap(side: GestureSide, isDoubleTap: boolean) {
      if (!video) return;
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
          // Plyr merge options bằng cách duyệt qua mọi key có mặt trong
          // object truyền vào — kể cả khi giá trị là undefined — nên
          // key "controls" chỉ được thêm vào object khi thật sự cần ghi
          // đè (thiết bị cảm ứng). Nếu luôn truyền "controls: undefined"
          // trên desktop, nó sẽ GHI ĐÈ mất bộ điều khiển mặc định đầy
          // đủ của Plyr bằng rỗng, làm mất hẳn thanh điều khiển video.
          ...(isTouch ? { controls: TOUCH_CONTROLS } : {}),
          // iosNative: true bắt Plyr dùng webkitEnterFullscreen() — trình
          // toàn màn hình gốc của iOS — thay vì tự vẽ toàn màn hình bằng
          // CSS (mặc định của Plyr). Chỉ trình toàn màn hình gốc mới tự
          // xoay ngang theo nội dung video khi xoay máy; kiểu "giả toàn
          // màn hình" bằng CSS không có khả năng này trên Safari/iOS.
          fullscreen: { iosNative: true },
          // global: true để mũi tên trái/phải tua ±10s (mặc định của
          // Plyr) hoạt động bất cứ lúc nào đang ở trang xem phim, không
          // cần bấm chuột vào player trước — Plyr tự bỏ qua khi đang gõ
          // trong input/textarea nên không xung đột với các control khác.
          keyboard: { focused: true, global: true },
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

        if (resumeAt > 0) {
          video.currentTime = resumeAt;
        }
      });

      // Trước đây không có handler nào cho Hls.Events.ERROR — bất kỳ lỗi
      // mạng/media nào (đứt mạng lúc tải segment, link bị chặn hotlink,
      // manifest hỏng...) đều khiến trình phát đứng hình lặng lẽ, không
      // có cách phục hồi lẫn thông báo cho người xem. Giờ tự thử tải lại
      // khi lỗi mạng, tự phục hồi khi lỗi media, và chỉ báo lỗi hẳn khi
      // đã thử hết cách hoặc gặp lỗi không thể phục hồi.
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            networkRetryCount += 1;
            if (networkRetryCount <= MAX_NETWORK_RETRIES) {
              hls.startLoad();
            } else {
              hls.destroy();
              reportFatalError();
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            reportFatalError();
            break;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      playerRef.current = new Plyr(video, {
        ...(isTouch ? { controls: TOUCH_CONTROLS } : {}),
        // Nhánh này chạy trên Safari/iOS thật (không hỗ trợ hls.js qua
        // MSE) — bật toàn màn hình gốc để có thể tự xoay ngang khi xoay
        // máy, xem giải thích ở nhánh Hls.isSupported() phía trên.
        fullscreen: { iosNative: true },
        keyboard: { focused: true, global: true },
      });
      gestureLayerEl = mountGestureLayer(video, { onTap: handleGestureTap });

      // Safari không có sự kiện MANIFEST_PARSED — dùng loadedmetadata
      // để biết lúc nào video đã có thời lượng, rồi mới tua tới vị trí
      // đã lưu.
      if (resumeAt > 0) {
        handleLoadedMetadata = () => {
          video.currentTime = resumeAt;
        };
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
      }

      video.addEventListener("error", reportFatalError);
    } else {
      // Trình duyệt không hỗ trợ MSE lẫn HLS gốc (vd. Firefox/Chrome đời
      // cũ) — không có cách nào phát được link .m3u8 này.
      reportFatalError();
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
      video.removeEventListener("error", reportFatalError);
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
    <div className="video-player-wrap">
      <video
        ref={videoRef}
        className="video-player"
        controls
        autoPlay
        playsInline
        poster={poster}
      />
      {playbackError && (
        <div className="video-player__error">
          <p>{playbackError}</p>
        </div>
      )}
    </div>
  );
}
