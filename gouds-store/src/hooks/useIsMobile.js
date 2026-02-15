import { useState, useEffect } from 'react';

/**
 * Returns true on mobile/tablet (<1024px), false on desktop.
 * Uses matchMedia for efficient, listener-based detection.
 * Returns null on first server render to avoid hydration mismatch.
 */
const useIsMobile = (breakpoint = 1024) => {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mql.matches);

    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
