import React, { useState, useCallback } from "react";
import { InputForm } from "@/components/InputForm";
import { TierBoard } from "@/components/TierBoard";
import { SubjectCard } from "@/components/SubjectCard";
import { StreamingText } from "@/components/StreamingText";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStreamText } from "@/hooks/useStreamText";
import { useAudioStream } from "@/hooks/useAudioStream";
import { useTierAnimation } from "@/hooks/useTierAnimation";
import { createTier } from "@/utils/api";

import { AlertCircle, RotateCcw } from "lucide-react";
import type { TierRequest, TierLevel } from "@/types";

type AppMode = "input" | "loading" | "streaming" | "completed";

const Home: React.FC = () => {
  const [mode, setMode] = useState<AppMode>("input");
  const [caseId, setCaseId] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // 自定義 Hooks
  const {
    currentTier,
    triggerAnimation,
    reset: resetAnimation,
  } = useTierAnimation();
  const {
    displayText,
    state: streamState,
    startStreaming,
    reset: resetStream,
  } = useStreamText({
    onMarkerDetected: (tier: TierLevel) => {
      triggerAnimation(tier);
    },
    onComplete: () => {
      setMode("completed");
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorDialog(true);
    },
  });
  const {
    play: playAudio,
    error: audioError,
    reset: resetAudio,
  } = useAudioStream();

  // 處理表單提交
  const handleSubmit = useCallback(
    async (data: TierRequest) => {
      setMode("loading");
      setError(null);
      setSubject(data.subject);

      try {
        // 調用 API 創建銳評
        const response = await createTier(data);
        setCaseId(response.case_id);

        // 開始流式傳輸文本
        setMode("streaming");
        await startStreaming(response.case_id);

        // 播放音頻
        if (data.tts !== false) {
          playAudio(response.case_id);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "未知錯誤";
        setError(`API 調用失敗: ${errorMsg}`);
        setShowErrorDialog(true);
        setMode("input");
      }
    },
    [startStreaming, playAudio],
  );

  // 重新開始
  const handleReset = useCallback(() => {
    setMode("input");
    setCaseId(null);
    setSubject("");
    setError(null);
    resetAnimation();
    resetStream();
    resetAudio();
  }, [resetAnimation, resetStream, resetAudio]);

  // 重試
  const handleRetry = useCallback(() => {
    setShowErrorDialog(false);
    if (caseId) {
      setMode("streaming");
      startStreaming(caseId);
      playAudio(caseId);
    } else {
      setMode("input");
    }
  }, [caseId, startStreaming, playAudio]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 標題 */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">從夯到拉 AI 銳評</h1>
          <p className="text-muted-foreground">
            讓 AI 以專家視角對任何對象進行深度銳評
          </p>
        </header>

        {/* 輸入階段 */}
        {mode === "input" && (
          <div className="flex justify-center animate-in fade-in duration-500">
            <InputForm onSubmit={handleSubmit} />
          </div>
        )}

        {/* 加載中階段 */}
        {mode === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-300">
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
            </div>
            <p className="text-lg text-muted-foreground">正在生成銳評...</p>
          </div>
        )}

        {/* 串流和完成階段 */}
        {(mode === "streaming" || mode === "completed") && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Tier Board */}
            <TierBoard currentTier={currentTier || undefined}>
              <SubjectCard subject={subject} />
            </TierBoard>

            {/* 串流文本 */}
            <StreamingText
              text={displayText}
              isStreaming={streamState === "streaming"}
            />

            {/* 音頻錯誤提示 */}
            {audioError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>音頻播放失敗</AlertTitle>
                <AlertDescription>
                  {audioError.message}，但文本內容仍正常顯示。
                </AlertDescription>
              </Alert>
            )}

            {/* 完成後的操作按鈕 */}
            {mode === "completed" && (
              <div className="flex justify-center animate-in fade-in duration-300">
                <Button onClick={handleReset} size="lg" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  重新評價
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 錯誤對話框 */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                發生錯誤
              </DialogTitle>
              <DialogDescription>{error}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {caseId && (
                <Button onClick={handleRetry} variant="outline">
                  重試
                </Button>
              )}
              <Button
                onClick={() => {
                  setShowErrorDialog(false);
                  handleReset();
                }}
              >
                返回首頁
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Home;
