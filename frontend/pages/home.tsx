import React, { useState } from "react";
import config from "../config/constants";
import { InputGroupIcon } from "../components/input";
import { AnimatePresence, motion } from "motion/react";
import { useTierContext, type TierData } from "../context/tier-context";
import { XIcon } from "lucide-react";

const ItemDetailModal = ({
  item,
  onClose,
}: {
  item: TierData;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        layoutId={item.id}
        className="relative w-full max-w-lg overflow-hidden rounded-xl bg-card shadow-2xl border border-border z-10"
        transition={{
          type: "spring",
          stiffness: 400, // 增加剛性，讓收回更乾脆
          damping: 35, // 增加阻尼，減少多餘的震盪
          mass: 0.8, // 減少質量，讓動作更輕盈
        }}
      >
        <div className="relative h-64 w-full">
          <motion.img
            // layoutId={`${item.id}-img`}
            src={item.imgUrl}
            className="h-full w-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors cursor-pointer"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">{item.subject}</h2>
            {item.roleName && (
              <p className="text-sm text-muted-foreground">
                銳評者: {item.roleName}
              </p>
            )}
          </div>

          <div className="max-h-[40vh] overflow-y-auto rounded-md bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {item.comment || "..."}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Home: React.FC = () => {
  const { items, addItem, updateItemComment } = useTierContext();
  const [selectedItem, setSelectedItem] = useState<TierData | null>(null);

  const handleTierDecided = (data: {
    id: string;
    tier: string;
    url: string;
    subject: string;
    roleName?: string;
  }) => {
    // Only add if not exists
    if (!items.find((i) => i.id === data.id)) {
      addItem({
        id: data.id, // Using case_id as ID
        imgUrl: data.url,
        tier: data.tier,
        subject: data.subject,
        roleName: data.roleName,
        comment: "", // Will be updated later
      });
    }
  };

  const handleStreamComplete = (comment: string, id: string) => {
    updateItemComment(id, comment);
  };

  return (
    <>
      <AnimatePresence>
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
                  <motion.div
                    layout
                    className="w-full bg-card rounded-r-md p-2 flex flex-wrap gap-2 items-center min-h-[6rem]"
                  >
                    {items
                      .filter((item) => item.tier === label)
                      .map((item) => (
                        <motion.div
                          layoutId={item.id}
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className="h-20 w-20 rounded-md overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.img
                            // layoutId={`${item.id}-img`}
                            src={item.imgUrl}
                            alt={item.subject}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="h-full bg-card p-5 rounded-md">
              <InputGroupIcon
                onDecided={handleTierDecided}
                onStreamComplete={handleStreamComplete}
              />
            </div>
          </div>
        </div>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Home;
