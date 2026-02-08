import React, { useState } from "react";
import { Button } from "./ui/button";
import { Share2, Check } from "lucide-react";
import { useReviewCases } from "../contexts/ReviewCaseContext";
import axios from "axios";
import config from "../config/constants";

export const ShareButton: React.FC = () => {
  const { cases, exportToJSON } = useReviewCases();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (cases.length === 0) {
      alert("沒有可分享的案例");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${config.api_endpoints}/save-cases`, {
        cases: cases,
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

  return (
    <Button
      onClick={handleShare}
      disabled={loading || cases.length === 0}
      variant="outline"
      className="gap-2"
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
