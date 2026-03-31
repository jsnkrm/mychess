import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { Landing } from "./screens/Landing";
import { Game } from "./screens/Game";
import { Login } from "./screens/Login";
import { useEffect, useState } from "react";

function App() {
  const [token] = useState(() => {
    // Check URL or LocalStorage immediately before first render
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("token") || localStorage.getItem("token") || null;
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  return (
    <div className="h-screen bg-slate-900">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/game"
            element={token ? <Game /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
