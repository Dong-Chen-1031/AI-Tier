import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import config from "../config/constants";
import { ReviewCase } from "../contexts/ReviewCaseContext";
import { motion } from "motion/react";
import Loader from "../components/loader";
import { CaseDetailModal } from "../components/CaseDetailModal";

const SharedView: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [cases, setCases] = useState<ReviewCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<ReviewCase | null>(null);

  useEffect(() => {
    const fetchSharedCases = async () => {
      try {
        const response = await axios.get(
          `${config.api_endpoints}/share/${shareId}`
        );
        setCases(response.data.cases);
      } catch (err) {
        console.error("Failed to fetch shared cases:", err);
        setError("無法載入分享的案例");
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedCases();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">錯誤</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Group cases by tier
  const tierGroups: Record<string, ReviewCase[]> = {};
  cases.forEach((c) => {
    if (c.tierDecision) {
      if (!tierGroups[c.tierDecision]) {
        tierGroups[c.tierDecision] = [];
      }
      tierGroups[c.tierDecision].push(c);
    }
  });

  const tierList = ["夯", "頂級", "人上人", "NPC", "拉完了"];
  const colorList = ["#F00", "#FFBF00", "#FF0", "#FFF2CC", "#FFF"];

  return (
    <div className="h-screen mx-auto mt-10 w-[90%] pb-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">分享的銳評結果</h1>
        <p className="text-muted-foreground">
          共 {cases.length} 個案例
        </p>
      </div>

      <div className="space-y-5">
        {tierList.map((label, index) => (
          <div key={index} className="flex text-center">
            <div
              className="w-35 h-30 text-3xl flex items-center justify-center rounded-l-md shrink-0"
              style={{ backgroundColor: colorList[index] }}
            >
              <p className="text-accent font-medium">{label}</p>
            </div>
            <div className="w-full bg-card rounded-r-md p-2 flex flex-wrap gap-2 items-center">
              {tierGroups[label]?.map((caseData, i) => (
                <motion.div
                  key={i}
                  className="h-20 w-20 rounded-md overflow-hidden relative group cursor-pointer"
                  onClick={() => setSelectedCase(caseData)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <img
                    src={caseData.imageUrl}
                    alt={caseData.formData.subject}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          caseData={selectedCase}
          imageUrl={selectedCase.imageUrl}
        />
      )}
    </div>
  );
};

export default SharedView;
