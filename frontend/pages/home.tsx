import React, { useState } from "react";
import config from "../config/constants";
import { InputGroupIcon } from "../components/input";
import { AnimatePresence, motion } from "motion/react";

const Home: React.FC = () => {
  const [tierImages, setTierImages] = useState<Record<string, string[]>>({});

  const handleTierDecided = (tier: string, url: string) => {
    setTierImages((prev) => ({
      ...prev,
      [tier]: [...(prev[tier] || []), url],
    }));
  };

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
                      className="h-20 w-20 rounded-md overflow-hidden relative group"
                    >
                      <motion.img
                        layoutId={`${url}-img`}
                        src={url}
                        alt={label}
                        className="w-full h-full object-cover"
                      />
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
      </div>
    </AnimatePresence>
  );
};

export default Home;
