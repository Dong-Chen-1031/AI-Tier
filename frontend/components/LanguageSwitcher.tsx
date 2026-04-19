import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

const LANGUAGES = [
    { code: "en", label: "EN" },
    { code: "zh-TW", label: "中文" },
];

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const currentLang = LANGUAGES.find((l) =>
        i18n.language.startsWith(l.code === "zh-TW" ? "zh" : l.code),
    )
        ? i18n.language.startsWith("zh")
            ? "zh-TW"
            : "en"
        : "en";

    const toggle = () => {
        const next = currentLang === "en" ? "zh-TW" : "en";
        i18n.changeLanguage(next);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="text-xs font-medium px-2 cursor-pointer"
            title="Switch language">
            {currentLang === "en" ? "中文" : "EN"}
        </Button>
    );
};
