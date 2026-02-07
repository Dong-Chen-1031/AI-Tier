import { useState, useCallback, useRef } from "react";
import { getTextStream } from "@/utils/api";
import { parseMarkers, removeMarkers } from "@/utils/parseMarkers";
import type { TierLevel, StreamState } from "@/types";

interface UseStreamTextOptions {
  onMarkerDetected?: (tier: TierLevel) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useStreamText(options: UseStreamTextOptions = {}) {
  const [text, setText] = useState<string>("");
  const [displayText, setDisplayText] = useState<string>("");
  const [state, setState] = useState<StreamState>("idle");
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastProcessedLengthRef = useRef<number>(0);

  const startStreaming = useCallback(
    async (caseId: string) => {
      setState("loading");
      setText("");
      setDisplayText("");
      setError(null);
      lastProcessedLengthRef.current = 0;

      try {
        abortControllerRef.current = new AbortController();
        const stream = await getTextStream(caseId);
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        setState("streaming");

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          setText((prev) => {
            const newText = prev + chunk;

            // 檢查新增部分是否包含標記
            const newPortion = newText.slice(lastProcessedLengthRef.current);
            const markers = parseMarkers(newPortion);

            // 如果發現標記，觸發回調
            if (markers.length > 0 && options.onMarkerDetected) {
              markers.forEach((marker) => {
                options.onMarkerDetected!(marker.tier);
              });
            }

            lastProcessedLengthRef.current = newText.length;

            // 更新顯示文本（移除標記）
            setDisplayText(removeMarkers(newText));

            return newText;
          });
        }

        setState("completed");
        options.onComplete?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        setState("error");
        options.onError?.(error);
      }
    },
    [options],
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setText("");
    setDisplayText("");
    setState("idle");
    setError(null);
    lastProcessedLengthRef.current = 0;
  }, []);

  return {
    text,
    displayText,
    state,
    error,
    startStreaming,
    reset,
  };
}
