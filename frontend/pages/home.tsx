import React, { useState } from "react";
import config from "../config/constants";
import { InputGroupIcon } from "../components/input";
import { AnimatePresence, motion } from "motion/react";
import { useReviewCases } from "../contexts/ReviewCaseContext";
import { CaseDetailModal } from "../components/CaseDetailModal";
import { ShareButton } from "../components/ShareButton";

const Home: React.FC = () => {
  const [tierImages, setTierImages] = useState<Record<string, string[]>>({});
  const { cases } = useReviewCases();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const handleTierDecided = (tier: string, url: string) => {
    setTierImages((prev) => ({
      ...prev,
      [tier]: [...(prev[tier] || []), url],
    }));
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedCase(imageUrl);
  };

  const selectedCaseData = cases.find((c) => c.imageUrl === selectedCase);

  return (
    <AnimatePresence initial={false}>
      <div className="h-[90%] mx-auto mt-10 w-[90%]">
        <div className="grid grid-cols-1 gap-10 w-full h-full md:grid-cols-3">
          <div className="col-span-1 h-full flex flex-col md:col-span-2">
            {config.tierList.map((label, index) => (
              <div
                key={index}
                className={`flex ${index !== 0 ? "mt-5" : ""} text-center`}
              >
                <div
                  className={`w-35 h-30 text-3xl flex items-center justify-center rounded-l-md shrink-0`}
                  style={{ backgroundColor: config.colorList[index] }}
                >
                  <p className="text-accent font-medium">{label}</p>
                </div>
                <div className="w-full bg-card rounded-r-md p-2 flex flex-wrap gap-2 items-center">
                  {tierImages[label]?.map((url, i) => (
                    <motion.div
                      layoutId={url}
                      key={i}
                      className="h-20 w-20 rounded-md overflow-hidden relative group cursor-pointer"
                      onClick={() => handleImageClick(url)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.img
                        layoutId={`${url}-img`}
                        src={url}
                        alt={label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="h-full bg-card p-5 rounded-md overflow-hidden">
            <InputGroupIcon onDecided={handleTierDecided} />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <ShareButton />
        </div>
      </div>

      {/* Case Detail Modal */}
      {selectedCase && selectedCaseData && (
        <CaseDetailModal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          caseData={selectedCaseData}
          imageUrl={selectedCase}
        />
      )}
    </AnimatePresence>
  );
};

export default Home;
