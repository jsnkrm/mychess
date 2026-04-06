/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chessboard } from "../components/Chessboard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import type { GameState } from "../types/GameState";
import { INIT_GAME, MOVE, GAME_OVER, GAME_STATE_KEY } from "../constants";

export { INIT_GAME, MOVE, GAME_OVER } from "../constants";

const saveGameState = (fen: string, myColor: "white" | "black", turn: "white" | "black", started: boolean) => {
  const state: GameState = { fen, myColor, turn, started, orientation: myColor, board: [] };
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
};

const loadGameState = (): GameState | null => {
  const saved = localStorage.getItem(GAME_STATE_KEY);
  if (!saved) return null;
  try {
    const state = JSON.parse(saved) as GameState;
    return state.started ? state : null;
  } catch {
    return null;
  }
};

const clearGameState = () => {
  localStorage.removeItem(GAME_STATE_KEY);
};

export const Game = () => {
  const { socket, user, isConnecting, isReconnecting } = useSocket();
  const navigate = useNavigate();
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState(() => chess.board());
  const [started, setStarted] = useState(false);
  const [myColor, setMyColor] = useState<"white" | "black" | null>(null);
  const [turn, setTurn] = useState<"white" | "black">("white");
  const myColorRef = useRef<"white" | "black" | null>(null);

  useEffect(() => {
    myColorRef.current = myColor;
  }, [myColor]);

  useEffect(() => {
    const savedState = loadGameState();
    if (savedState && savedState.fen && savedState.myColor) {
      chess.load(savedState.fen);
      setBoard(chess.board());
      setMyColor(savedState.myColor);
      setTurn(savedState.turn);
      setStarted(savedState.started);
    }
  }, []);

  useEffect(() => {
    return () => {
      clearGameState();
      chess.reset();
    };
  }, []);

  const updateBoard = useCallback((move: { from: string; to: string }): boolean => {
    try {
      const result = chess.move(move);
      if (!result) {
        return false;
      }
      setBoard(chess.board());
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case INIT_GAME:
          setMyColor(message.payload.color);
          setBoard(chess.board());
          setStarted(true);
          setTurn("white");
          saveGameState(chess.fen(), message.payload.color, "white", true);
          break;

        case MOVE:
          updateBoard(message.payload.move);
          {
            const newTurn = chess.turn() === 'w' ? "white" : "black";
            setTurn(newTurn);
            saveGameState(chess.fen(), myColorRef.current!, newTurn, true);
          }
          break;

        case GAME_OVER:
          clearGameState();
          break;
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, updateBoard]);

  if (isConnecting || !socket || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pattern">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-300 text-xl font-medium">Connecting to the server…</p>
          {isReconnecting && <p className="text-slate-500 mt-2">Reconnecting…</p>}
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handlePlay = () => {
    clearGameState();
    chess.reset();
    setBoard(chess.board());
    setStarted(false);
    setMyColor(null);
    setTurn("white");
    socket.send(JSON.stringify({ type: INIT_GAME }));
  };

  const isMyTurn = started && turn === (myColor || "white");

  return (
    <div className="min-h-screen bg-pattern">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30">
              <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="font-display text-2xl font-semibold text-white">
              My<span className="text-amber-400">Chess</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-slate-700/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm font-semibold text-slate-900">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-300 font-medium">{user.name}</span>
              {user.isGuest && (
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Guest</span>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-red-400"
              aria-label="Logout"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          <div className="bg-card rounded-2xl p-6 border border-slate-700/50 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-emerald-400 animate-pulse-soft' : 'bg-slate-600'}`}></div>
                <span className="text-slate-400 text-sm">
                  {started ? (isMyTurn ? "Your turn" : "Opponent's turn") : "Waiting for opponent"}
                </span>
              </div>
              {myColor && (
                <div className="text-slate-500 text-sm">
                  Playing as <span className="text-amber-400 capitalize">{myColor}</span>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Chessboard
                board={board}
                socket={socket}
                updateBoard={updateBoard}
                orientation={myColor}
                turn={turn}
                started={started}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-slate-700/50">
              {!started ? (
                <>
                  <h2 className="font-display text-xl text-white mb-3">Ready to Play</h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Find an opponent and start a new game
                  </p>
                  <button
                    onClick={handlePlay}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handlePlay();
                      }
                    }}
                    className="w-full py-3 px-6 rounded-xl btn-primary flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Find Opponent
                  </button>
                </>
              ) : (
                <>
                  <h2 className="font-display text-xl text-white mb-3">Game in Progress</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400 text-sm">Current Turn</span>
                      <span className={`font-medium capitalize ${turn === myColor ? 'text-amber-400' : 'text-slate-500'}`}>
                        {turn}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400 text-sm">Your Color</span>
                      <span className="font-medium capitalize text-amber-400">{myColor}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-card rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-slate-400 text-sm font-medium mb-4">Game Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="text-slate-300">{started ? "Active" : "Idle"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode</span>
                  <span className="text-slate-300">Classic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Connection</span>
                  <span className={`${isReconnecting ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {isReconnecting ? 'Reconnecting...' : 'Connected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;