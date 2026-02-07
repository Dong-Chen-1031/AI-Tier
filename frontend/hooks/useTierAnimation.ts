import { useState, useCallback } from "react";
import type { TierLevel } from "@/types";

export function useTierAnimation() {
  const [currentTier, setCurrentTier] = useState<TierLevel | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = useCallback((tier: TierLevel) => {
    setIsAnimating(true);
    setCurrentTier(tier);

    // 動畫持續時間後重置動畫狀態（但保留 tier）
    setTimeout(() => {
      setIsAnimating(false);
    }, 1500); // 與 Framer Motion 的動畫持續時間一致
  }, []);

  const reset = useCallback(() => {
    setCurrentTier(null);
    setIsAnimating(false);
  }, []);

  return {
    currentTier,
    isAnimating,
    triggerAnimation,
    reset,
  };
}
