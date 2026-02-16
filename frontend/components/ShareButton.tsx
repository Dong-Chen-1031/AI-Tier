import React, { useState, type RefObject } from "react";
import { Button } from "./ui/button";
import { Share2, Check } from "lucide-react";
import { useReviewCases } from "../contexts/ReviewCaseContext";
import axios from "axios";
import config from "../config/constants";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

export const ShareButton: React.FC<{
  className?: string;
  turnstile: RefObject<TurnstileInstance | null>;
}> = ({ className, turnstile }) => {
  const { cases } = useReviewCases();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (cases.length === 0) {
      alert("沒有可分享的案例");
      return;
    }

    setLoading(true);
    try {
      // console.log(turnstile);
      const turnstileToken = await turnstile.current?.getResponsePromise();
      if (!turnstileToken) {
        alert("驗證尚未完成，請等待數秒鐘後再試一次");
        return;
      }
      const response = await axios.post(`${config.api_endpoints}/save-cases`, {
        cases: cases,
        turnstile_token: turnstileToken,
      });

      const shareId = response.data.share_id;
      const shareUrl = `${window.location.origin}/share/${shareId}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to share:", error);
      alert("分享失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || cases.length === 0;

  return (
    <Button
      onClick={handleShare}
      disabled={disabled}
      variant="outline"
      className={`gap-2 ${className} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          已複製連結
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          分享
        </>
      )}
    </Button>
  );
};
