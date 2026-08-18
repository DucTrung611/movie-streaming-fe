import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson, STORAGE_KEYS } from "../utils/storage";
import type { ContinueWatchingItem } from "../types/movie";

const EVENT_NAME = "rapchieu:continue-watching-changed";
const MAX_ITEMS = 40; // mỗi tập là 1 mục riêng (trước đây 20 mục = 20 phim)
const MIN_SECONDS_TO_SAVE = 15; // bỏ qua nếu mới xem vài giây (bấm nhầm)
const FINISHED_RATIO = 0.95; // xem >=95% coi như xong, bỏ khỏi danh sách

const loadItems = (): ContinueWatchingItem[] =>
  readJson<ContinueWatchingItem[]>(STORAGE_KEYS.CONTINUE_WATCHING, []);

function persist(items: ContinueWatchingItem[]) {
  writeJson(STORAGE_KEYS.CONTINUE_WATCHING, items);
  window.dispatchEvent(new Event(EVENT_NAME));
}

/** Chỉ giữ 1 thẻ/phim (tập xem gần nhất) để hiện ở trang chủ — thứ tự
 * mảng gốc đã là "mới nhất trước" (saveProgress luôn unshift), nên chỉ
 * cần lấy phần tử đầu tiên gặp của mỗi slug. */
function dedupeLatestPerMovie(items: ContinueWatchingItem[]): ContinueWatchingItem[] {
  const seen = new Set<string>();
  const result: ContinueWatchingItem[] = [];
  for (const it of items) {
    if (seen.has(it.slug)) continue;
    seen.add(it.slug);
    result.push(it);
  }
  return result;
}

export type SaveProgressEntry = Omit<ContinueWatchingItem, "updatedAt">;

/**
 * Lịch sử "xem tiếp" lưu local, MỖI TẬP một mục riêng (key = slug +
 * episodeSlug). Trước đây mỗi phim chỉ giữ đúng 1 tập gần nhất nên đổi
 * server hoặc xem tập khác sẽ ghi đè mất tiến trình của tập đang xem
 * dở trước đó. `items` trả về (dùng cho trang chủ) vẫn chỉ hiện 1
 * thẻ/phim — chọn tập được xem gần nhất — nhưng dữ liệu gốc trong
 * localStorage giữ riêng từng tập nên mở lại đúng tập cũ vẫn tua đúng
 * chỗ, không bị tập khác ghi đè.
 *
 * getSavedProgress đọc thẳng localStorage (không qua state phản ứng)
 * vì nó chỉ nên gọi 1 lần lúc bắt đầu phát — nếu dùng chung state với
 * saveProgress (ghi định kỳ khi đang phát), VideoPlayer sẽ bị tua/giật
 * lại mỗi lần tiến trình được lưu.
 */
export function useContinueWatching() {
  const [rawItems, setRawItems] = useState<ContinueWatchingItem[]>(loadItems);

  useEffect(() => {
    const sync = () => setRawItems(loadItems());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const getSavedProgress = useCallback(
    // episodeSlug bỏ trống -> lấy tập được xem gần nhất của phim đó.
    (slug: string, episodeSlug?: string) =>
      loadItems().find(
        (it) => it.slug === slug && (!episodeSlug || it.episodeSlug === episodeSlug)
      ),
    []
  );

  const removeProgress = useCallback((slug: string, episodeSlug?: string) => {
    // episodeSlug bỏ trống -> xoá mọi tập đã lưu của phim đó.
    const next = loadItems().filter(
      (it) => !(it.slug === slug && (!episodeSlug || it.episodeSlug === episodeSlug))
    );
    persist(next);
    setRawItems(next);
  }, []);

  const saveProgress = useCallback(
    (entry: SaveProgressEntry) => {
      const { slug, episodeSlug, currentTime, duration } = entry;
      if (
        !slug ||
        !episodeSlug ||
        !Number.isFinite(currentTime) ||
        !Number.isFinite(duration) ||
        duration <= 0
      )
        return;
      if (currentTime < MIN_SECONDS_TO_SAVE) return;
      if (currentTime / duration >= FINISHED_RATIO) {
        removeProgress(slug, episodeSlug);
        return;
      }
      const rest = loadItems().filter(
        (it) => !(it.slug === slug && it.episodeSlug === episodeSlug)
      );
      const next = [
        { ...entry, updatedAt: Date.now() },
        ...rest,
      ].slice(0, MAX_ITEMS);
      persist(next);
      setRawItems(next);
    },
    [removeProgress]
  );

  const items = dedupeLatestPerMovie(rawItems);

  return { items, getSavedProgress, saveProgress, removeProgress };
}
