import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loader from "./components/loader";
import Home from "./pages/home";
import { ThemeProvider } from "./components/theme-provider";
import { TierProvider } from "./context/tier-context";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TierProvider>
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
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TierProvider>
    </ThemeProvider>
  );
}

export default App;
