import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import "./App.css";

const Landing = lazy(() => import("./screens/Landing").then(m => ({ default: m.Landing })));
const Game = lazy(() => import("./screens/Game").then(m => ({ default: m.Game })));

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      window.location.replace(window.location.origin + "/game");
    }
  }, []);

  return (
    <div className="h-screen bg-slate-900">
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
