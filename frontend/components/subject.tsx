import * as motion from "motion/react-client";
import { useState } from "react";

export default function EnterAnimation({
  imgUrl,
  layoutId,
}: {
  imgUrl: string;
  layoutId?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0 }}
      animate={isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
      transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
      }}
      className="h-20 w-20 rounded-md overflow-hidden relative"
    >
      <motion.img
        layoutId={layoutId ? `${layoutId}-img` : undefined}
        src={imgUrl}
        onLoad={() => setIsLoaded(true)}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}
