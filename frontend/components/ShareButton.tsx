import React, { useState, type RefObject } from "react";
import { Button } from "./ui/button";
import { Share2, Check } from "lucide-react";
import { useReviewCases } from "../contexts/ReviewCaseContext";
import { useTranslation } from "react-i18next";
import axios from "axios";
import config from "../config/constants";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

export const ShareButton: React.FC<{
    className?: string;
    turnstile: RefObject<TurnstileInstance | null>;
}> = ({ className, turnstile }) => {
    const { cases } = useReviewCases();
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleShare = async () => {
        if (cases.length === 0) {
            alert(t("shareButton.noCase"));
            return;
        }

        setLoading(true);
        try {
            // console.log(turnstile);
            const turnstileToken =
                await turnstile.current?.getResponsePromise();
            if (!turnstileToken) {
                alert(t("shareButton.verifyWait"));
                return;
            }
            const response = await axios.post(
                `${config.api_endpoints}/save-cases`,
                {
                    cases: cases,
                    turnstile_token: turnstileToken,
                },
            );

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
            alert(t("shareButton.error"));
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
            className={`gap-2 ${className} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
            {copied ? (
                <>
                    <Check className="w-4 h-4" />
                    {t("shareButton.copied")}
                </>
            ) : (
                <>
                    <Share2 className="w-4 h-4" />
                    {t("shareButton.share")}
                </>
            )}
        </Button>
    );
};
