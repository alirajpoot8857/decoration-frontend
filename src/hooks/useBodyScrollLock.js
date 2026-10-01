'use client';

import { useEffect } from 'react';

/**
 * Custom React hook to reliably lock body scroll when a modal or drawer is open.
 * Prevents background jumping and ensures touch scrolls only affect the active modal.
 */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isLocked]);
}

export default useBodyScrollLock;
