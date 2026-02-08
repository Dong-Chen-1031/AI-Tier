import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { ReviewCase } from "../contexts/ReviewCaseContext";

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: ReviewCase;
  imageUrl: string;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  isOpen,
  onClose,
  caseData,
  imageUrl,
}) => {
  if (!isOpen) return null;

  const formattedDate = new Date(caseData.timestamp).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-6">
                {/* Image */}
                <motion.div
                  layoutId={imageUrl}
                  className="w-full aspect-square rounded-lg overflow-hidden mb-4"
                >
                  <motion.img
                    layoutId={`${imageUrl}-img`}
                    src={imageUrl}
                    alt={caseData.formData.subject}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Case Details */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-2">
                      {caseData.formData.subject}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      案例 ID: {caseData.caseId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      時間: {formattedDate}
                    </p>
                  </div>

                  {caseData.tierDecision && (
                    <div className="bg-accent/20 p-3 rounded-md">
                      <p className="text-sm font-medium text-primary">
                        評級: {caseData.tierDecision}
                      </p>
                    </div>
                  )}

                  {caseData.reply && (
                    <div className="bg-accent/10 p-4 rounded-md">
                      <h3 className="text-sm font-semibold text-primary mb-2">
                        銳評內容
                      </h3>
                      <p className="text-foreground">{caseData.reply}</p>
                    </div>
                  )}

                  {/* Form Data */}
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold text-primary mb-3">
                      表單資訊
                    </h3>
                    <div className="space-y-2 text-sm">
                      {caseData.formData.role_name && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">銳評者:</span>
                          <span className="text-foreground">
                            {caseData.formData.role_name}
                          </span>
                        </div>
                      )}
                      {caseData.formData.role_description && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            角色描述:
                          </span>
                          <span className="text-foreground">
                            {caseData.formData.role_description}
                          </span>
                        </div>
                      )}
                      {caseData.formData.style && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">風格:</span>
                          <span className="text-foreground">
                            {caseData.formData.style}
                          </span>
                        </div>
                      )}
                      {caseData.formData.llm_model && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">模型:</span>
                          <span className="text-foreground">
                            {caseData.formData.llm_model}
                          </span>
                        </div>
                      )}
                      {caseData.formData.suggestion && (
                        <div className="mt-2">
                          <span className="text-muted-foreground block mb-1">
                            其他建議:
                          </span>
                          <span className="text-foreground">
                            {caseData.formData.suggestion}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
