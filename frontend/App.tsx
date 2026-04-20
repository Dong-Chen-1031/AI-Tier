import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loader from "./components/loader";
import Home from "./pages/home";
import SharedView from "./pages/shared";
import NotFound from "./pages/not-found";
import { ThemeProvider } from "./components/theme-provider";
import { ReviewCaseProvider } from "./contexts/ReviewCaseContext";
import { LanguageSwitcher } from "./components/LanguageSwitcher";

function App() {
    const { t } = useTranslation();

    useEffect(() => {
        if (!sessionStorage.getItem("backup_alert_shown")) {
            alert(t("alert.geminiBackup"));
            sessionStorage.setItem("backup_alert_shown", "true");
        }
    }, [t]);

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ReviewCaseProvider>
                <BrowserRouter>
                    <div className="fixed top-3 right-4 z-50">
                        <LanguageSwitcher />
                    </div>
                    <Suspense
                        fallback={
                            <div className="flex items-center justify-center min-h-screen">
                                <Loader />
                            </div>
                        }>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/share/:shareId"
                                element={<SharedView />}
                            />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </ReviewCaseProvider>
        </ThemeProvider>
    );
}

export default App;
