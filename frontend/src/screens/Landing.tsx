import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pattern px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <header className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30">
            <svg className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="font-display text-6xl md:text-7xl font-semibold text-white mb-4 tracking-tight">
            My<span className="text-amber-400">Chess</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-xl mx-auto font-light">
            Experience the timeless game in a refined digital setting
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-card rounded-2xl p-6 border border-slate-700/50">
              <img
                src="/chessboard.jpg"
                alt="Chess Board"
                className="w-full h-auto rounded-xl shadow-lg"
                width={400}
                height={300}
              />
              <div className="absolute -bottom-4 -right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg">
                <span className="text-sm font-medium">2 Player</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card rounded-2xl p-8 border border-slate-700/50">
              <h2 className="font-display text-2xl text-white mb-4">Join the Game</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Challenge your friends to an elegant game of chess. 
                Clean interface, smooth gameplay, timeless experience.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleSignIn}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSignIn();
                    }
                  }}
                  className="w-full py-4 px-6 rounded-xl btn-primary flex items-center justify-center gap-3 text-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-slate-500">or</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/game")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate("/game");
                    }
                  }}
                  className="w-full py-4 px-6 rounded-xl btn-secondary flex items-center justify-center gap-3 text-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Play as Guest
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-slate-500 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                No account required
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Free to play
              </span>
            </div>
          </div>
        </div>

        <footer className="mt-20 text-center text-slate-600 text-sm">
          <p>© 2024 MyChess. Built with care for chess enthusiasts.</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;