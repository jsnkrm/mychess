/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chessboard } from "../components/Chessboard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import type { GameState, GameOverPayload } from "../types/GameState";
import { INIT_GAME, MOVE, GAME_OVER, GAME_STATE_KEY, RESIGN } from "../constants";
import { Header } from "../components/Header";
import { Confetti } from "../components/Confetti";
import { ResignModal } from "../components/ResignModal";
import { GameOverOverlay } from "../components/GameOverOverlay";
import { ReadyToPlay } from "../components/ReadyToPlay";
import { GameInProgress } from "../components/GameInProgress";
import { GameInfo } from "../components/GameInfo";

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
  const [showResignModal, setShowResignModal] = useState(false);
  const [gameOverData, setGameOverData] = useState<GameOverPayload | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
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
          setGameOverData(message.payload as GameOverPayload);
          if (message.payload.winner === myColorRef.current) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          } else {
            setTimeout(() => {
              setGameOverData(null);
              chess.reset();
              setBoard(chess.board());
              setStarted(false);
              setMyColor(null);
              setTurn("white");
            }, 2000);
          }
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
    setGameOverData(null);
    socket.send(JSON.stringify({ type: INIT_GAME }));
  };

  const handleResign = () => {
    socket.send(JSON.stringify({ type: RESIGN }));
    setShowResignModal(false);
  };

  const handlePlayAgain = () => {
    clearGameState();
    chess.reset();
    setBoard(chess.board());
    setStarted(false);
    setMyColor(null);
    setTurn("white");
    setGameOverData(null);
    setShowConfetti(false);
    socket.send(JSON.stringify({ type: INIT_GAME }));
  };

  const isMyTurn = started && turn === (myColor || "white");

  return (
    <div className="min-h-screen bg-pattern">
      <Confetti show={showConfetti} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <Header user={user} onLogout={handleLogout} />

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

            <div className="flex justify-center relative">
              <Chessboard
                board={board}
                socket={socket}
                updateBoard={updateBoard}
                orientation={myColor}
                turn={turn}
                started={started}
              />

              <GameOverOverlay
                gameOverData={gameOverData}
                myColor={myColor}
                onPlayAgain={handlePlayAgain}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-slate-700/50">
              {started ? (
                <GameInProgress
                  turn={turn}
                  myColor={myColor}
                  onResign={() => setShowResignModal(true)}
                />
              ) : (
                <ReadyToPlay onStartGame={handlePlay} />
              )}
            </div>

            <GameInfo started={started} isReconnecting={isReconnecting} />
          </div>
        </div>
      </div>

      {showResignModal && (
        <ResignModal
          onConfirm={handleResign}
          onCancel={() => setShowResignModal(false)}
        />
      )}
    </div>
  );
};

export default Game;