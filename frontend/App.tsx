import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loader from "./components/loader";
import Home from "./pages/home";
import SharedView from "./pages/shared";
import { ThemeProvider } from "./components/theme-provider";
import { ReviewCaseProvider } from "./contexts/ReviewCaseContext";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ReviewCaseProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <Loader />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/share/:shareId" element={<SharedView />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ReviewCaseProvider>
    </ThemeProvider>
  );
}

export default App;
