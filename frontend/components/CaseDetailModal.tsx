import React, { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import type { ReviewCase } from "../contexts/ReviewCaseContext";
import config from "../config/constants";

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: ReviewCase | null;
  imageUrl?: string | null;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  isOpen,
  onClose,
  caseData,
  imageUrl,
}) => {
  // Cache last valid props for exit animation
  const lastCaseData = useRef<ReviewCase | null>(null);
  const lastImageUrl = useRef<string>("");

  if (caseData) lastCaseData.current = caseData;
  if (imageUrl) lastImageUrl.current = imageUrl;

  const displayData = caseData ?? lastCaseData.current;
  const displayImageUrl = imageUrl ?? lastImageUrl.current;

  if (!displayData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="z-20"
          >
            <div
              className="bg-card rounded-lg shadow-xl max-w-2xl w-fit max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-6">
                {/* Image */}
                <motion.div
                  layoutId={displayImageUrl}
                  className="w-full aspect-square rounded-lg overflow-hidden mb-4 z-30"
                >
                  <motion.img
                    layoutId={`${displayImageUrl}-img`}
                    src={displayImageUrl}
                    alt={displayData.formData.subject}
                    className="w-full h-full object-cover "
                  />
                </motion.div>

                {/* Case Details */}
                <div className="space-y-4">
                  <div className="flex gap-2 justify-start items-center">
                    {displayData.tierDecision && (
                      <div
                        className="m-1 px-2 flex items-center justify-center rounded-2xl w-fit"
                        style={{
                          backgroundColor:
                            config.tierMap[displayData.tierDecision] || "white",
                        }}
                      >
                        <p className="text-sm font-medium text-black">
                          {displayData.tierDecision}
                        </p>
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-primary">
                      {displayData.formData.subject}
                    </h2>
                  </div>

                  {displayData.reply && (
                    <div className="bg-accent/10 pl-1 rounded-md">
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        銳評內容：
                      </h3>
                      <p className="text-foreground mb-4">
                        {displayData.reply}
                      </p>
                      {displayData.formData.tts && (
                        <audio
                          controls
                          className="w-full mt-2"
                          src={`${config.api_endpoints}/storage/audio/${displayData.caseId}.mp3`}
                        >
                          您的瀏覽器不支援音訊元素。
                        </audio>
                      )}
                    </div>
                  )}

                  {/* Form Data */}
                  <div className="border-t border-border p-2">
                    <h3 className="text-lg font-semibold text-primary mb-3">
                      表單資訊
                    </h3>
                    <div className="space-y-2 text-sm">
                      {displayData.formData.role_name && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">銳評者:</span>
                          <span className="text-foreground">
                            {displayData.formData.role_name}
                          </span>
                        </div>
                      )}
                      {displayData.formData.role_description && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            角色描述:
                          </span>
                          <span className="text-foreground">
                            {displayData.formData.role_description}
                          </span>
                        </div>
                      )}
                      {displayData.formData.style && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">風格:</span>
                          <span className="text-foreground">
                            {displayData.formData.style}
                          </span>
                        </div>
                      )}
                      {displayData.formData.llm_model && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">模型:</span>
                          <span className="text-foreground">
                            {displayData.formData.llm_model.split("/")[1]}
                          </span>
                        </div>
                      )}
                      {displayData.formData.suggestion && (
                        <div className="mt-2">
                          <span className="text-muted-foreground block mb-1">
                            其他建議:
                          </span>
                          <span className="text-foreground">
                            {displayData.formData.suggestion}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
