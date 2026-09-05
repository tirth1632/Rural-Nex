import { useState, useEffect } from 'react';

/**
 * Debounces a value by the given delay in milliseconds.
 * Returns the debounced value which only updates after the delay
 * has passed since the last change.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
