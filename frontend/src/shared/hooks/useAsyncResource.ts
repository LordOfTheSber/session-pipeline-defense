import { useEffect, useState } from 'react';

interface AsyncResourceState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useAsyncResource<T>(loader: () => Promise<T>, deps: readonly unknown[]): AsyncResourceState<T> {
  const [state, setState] = useState<AsyncResourceState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    setState({ data: null, isLoading: true, error: null });

    loader()
      .then((data) => {
        if (isMounted) {
          setState({ data, isLoading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Unexpected API error';
          setState({ data: null, isLoading: false, error: message });
        }
      });

    return () => {
      isMounted = false;
    };
  }, deps);

  return state;
}
