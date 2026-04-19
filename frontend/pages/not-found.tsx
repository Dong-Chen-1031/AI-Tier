import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const NotFound: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <motion.div
                className="text-center max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>
                <motion.p
                    className="text-8xl font-bold text-primary mb-2"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 12,
                    }}>
                    404
                </motion.p>
                <h1 className="text-2xl font-semibold text-foreground mb-3">
                    {t("notFound.title")}
                </h1>
                <p className="text-muted-foreground mb-8">
                    {t("notFound.description")}
                </p>
                <Link to="/">
                    <Button size="lg">{t("notFound.back")}</Button>
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
