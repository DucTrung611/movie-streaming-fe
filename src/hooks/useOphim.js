import { useEffect, useRef, useState } from "react";

/**
 * useOphim(fetcherFn, deps)
 * fetcherFn: () => Promise<T>  — được gọi lại mỗi khi deps đổi
 */
export function useOphim(fetcherFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
          setError(err);
          setLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
