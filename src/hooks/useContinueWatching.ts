import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson, STORAGE_KEYS } from "../utils/storage";
import type { ContinueWatchingItem } from "../types/movie";

const EVENT_NAME = "rapchieu:continue-watching-changed";
const MAX_ITEMS = 20;
const MIN_SECONDS_TO_SAVE = 15; // bỏ qua nếu mới xem vài giây (bấm nhầm)
const FINISHED_RATIO = 0.95; // xem >=95% coi như xong, bỏ khỏi danh sách

const loadItems = (): ContinueWatchingItem[] =>
  readJson<ContinueWatchingItem[]>(STORAGE_KEYS.CONTINUE_WATCHING, []);

function persist(items: ContinueWatchingItem[]) {
  writeJson(STORAGE_KEYS.CONTINUE_WATCHING, items);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export type SaveProgressEntry = Omit<ContinueWatchingItem, "updatedAt">;

/**
 * Lịch sử "xem tiếp" lưu local, mỗi phim (slug) chỉ giữ 1 tập gần nhất.
 * getSavedProgress đọc thẳng localStorage (không qua state phản ứng)
 * vì nó chỉ nên gọi 1 lần lúc bắt đầu phát — nếu dùng chung state với
 * saveProgress (ghi định kỳ khi đang phát), VideoPlayer sẽ bị tua/giật
 * lại mỗi lần tiến trình được lưu.
 */
export function useContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>(loadItems);

  useEffect(() => {
    const sync = () => setItems(loadItems());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const getSavedProgress = useCallback(
    (slug: string) => loadItems().find((it) => it.slug === slug),
    []
  );

  const removeProgress = useCallback((slug: string) => {
    const next = loadItems().filter((it) => it.slug !== slug);
    persist(next);
    setItems(next);
  }, []);

  const saveProgress = useCallback(
    (entry: SaveProgressEntry) => {
      const { slug, currentTime, duration } = entry;
      if (
        !slug ||
        !Number.isFinite(currentTime) ||
        !Number.isFinite(duration) ||
        duration <= 0
      )
        return;
      if (currentTime < MIN_SECONDS_TO_SAVE) return;
      if (currentTime / duration >= FINISHED_RATIO) {
        removeProgress(slug);
        return;
      }
      const rest = loadItems().filter((it) => it.slug !== slug);
      const next = [
        { ...entry, updatedAt: Date.now() },
        ...rest,
      ].slice(0, MAX_ITEMS);
      persist(next);
      setItems(next);
    },
    [removeProgress]
  );

  return { items, getSavedProgress, saveProgress, removeProgress };
}
