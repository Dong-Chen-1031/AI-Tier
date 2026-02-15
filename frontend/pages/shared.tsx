import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import config from "../config/constants";
import type { ReviewCase } from "../contexts/ReviewCaseContext";
import { motion } from "motion/react";
import Loader from "../components/loader";
import { CaseDetailModal } from "../components/CaseDetailModal";
import { Button } from "@/components/ui/button";

const SharedView: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [cases, setCases] = useState<ReviewCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<ReviewCase | null>(null);

  useEffect(() => {
    document.title = "分享的銳評結果 — AI 銳評產生器";
    return () => {
      document.title = "AI 銳評產生器 — 用 AI 幫你的圖片做 Tier List 排名";
    };
  }, []);

  useEffect(() => {
    const fetchSharedCases = async () => {
      try {
        const response = await axios.get(
          `${config.api_endpoints}/share/${shareId}`,
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
          <h2 className="text-2xl font-bold text-red-700 mb-4">錯誤</h2>
          <p className="text-muted-foreground">{error}</p>
          <Link to="/" className="inline-block mt-6">
            <Button>建立你的銳評</Button>
          </Link>
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
    <div className="h-[90%] mt-8 mx-auto w-[90%] pb-10">
      <header className="mb-8 text-center flex justify-between items-center">
        <div className="w-32"></div>
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            分享的銳評結果
          </h1>
          {/* <p className="text-muted-foreground">共 {cases.length} 個 Case</p> */}
        </div>
        <Link to="/" className="inline-block">
          <Button>建立你的銳評</Button>
        </Link>
      </header>

      <main className="space-y-5">
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
                  layoutId={caseData.imageUrl}
                >
                  <motion.img
                    layoutId={`${caseData.imageUrl}-img`}
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
      </main>

      {/* Case Detail Modal */}
      <CaseDetailModal
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        caseData={selectedCase}
        imageUrl={selectedCase?.imageUrl}
      />
    </div>
  );
};

export default SharedView;
