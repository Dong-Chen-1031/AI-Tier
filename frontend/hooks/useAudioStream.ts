import { useState, useCallback, useRef, useEffect } from "react";
import { getTtsUrl } from "@/utils/api";

export function useAudioStream() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 創建 audio 元素
    audioRef.current = new Audio();

    // 監聽播放事件
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setError(new Error("Audio playback failed"));
      setIsPlaying(false);
    };

    audioRef.current.addEventListener("play", handlePlay);
    audioRef.current.addEventListener("pause", handlePause);
    audioRef.current.addEventListener("ended", handleEnded);
    audioRef.current.addEventListener("error", handleError as any);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("play", handlePlay);
        audioRef.current.removeEventListener("pause", handlePause);
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("error", handleError as any);
      }
    };
  }, []);

  const play = useCallback(async (caseId: string) => {
    if (!audioRef.current) return;

    try {
      setError(null);
      audioRef.current.src = getTtsUrl(caseId);
      await audioRef.current.play();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to play audio");
      setError(error);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    setError(null);
  }, []);

  return {
    isPlaying,
    error,
    play,
    pause,
    reset,
    audioElement: audioRef.current,
  };
}
