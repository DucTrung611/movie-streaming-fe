import { useEffect, useRef, useState } from "react";

export interface UseOphimResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * useOphim(fetcherFn, deps)
 * fetcherFn: () => Promise<T>  — được gọi lại mỗi khi deps đổi
 */
export function useOphim<T>(
  fetcherFn: () => Promise<T>,
  deps: React.DependencyList = []
): UseOphimResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const currentId = ++requestId.current;
    setLoading(true);
    setError(null);

    fetcherFn()
      .then((result) => {
        if (currentId === requestId.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (currentId === requestId.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
