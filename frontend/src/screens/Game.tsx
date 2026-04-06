/* eslint-disable react-hooks/immutability */
import { useCallback, useEffect, useRef, useState } from "react";
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
  const { socket, user } = useSocket();
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [myColor, setMyColor] = useState<"white" | "black" | null>(null);
  const [turn, setTurn] = useState<"white" | "black">("white");
  const myColorRef = useRef(myColor);
  myColorRef.current = myColor;

  useEffect(() => {
    const savedState = loadGameState();
    if (savedState && savedState.fen && savedState.myColor) {
      chess.load(savedState.fen);
      setBoard(chess.board());
      setMyColor(savedState.myColor);
      setTurn(savedState.turn);
      setStarted(savedState.started);
    }
  }, [chess]);

  const updateBoard = useCallback((move: { from: string; to: string }): boolean => {
    try {
      const result = chess.move(move);
      if (!result) {
        console.error("Invalid move:", move);
        return false;
      }
      setBoard(chess.board());
      return true;
    } catch (error) {
      console.error("Invalid move:", error);
      return false;
    }
  }, [chess]);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      switch (message.type) {
        case INIT_GAME:
          console.log("Game initialized with color:", message.payload.color);
          setMyColor(message.payload.color);
          setBoard(chess.board());
          setStarted(true);
          setTurn("white");
          saveGameState(chess.fen(), message.payload.color, "white", true);
          break;

        case MOVE:
          console.log("Move received:", message.payload);
          updateBoard(message.payload.move);
          {
            const newTurn = chess.turn() === 'w' ? "white" : "black";
            setTurn(newTurn);
            saveGameState(chess.fen(), myColorRef.current!, newTurn, true);
          }
          break;

        case GAME_OVER:
          console.log("Game over! Winner:", message.payload.winner);
          clearGameState();
          break;

        default:
          console.warn("Unknown message type:", message.type);
      }
    };
  }, [socket, chess, updateBoard]);

  if (!socket || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-4xl">Connecting to the server...</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="absolute top-4 left-4">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-600">
          <span className="text-white font-medium tracking-wide">{user.name}</span>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
      <div className="flex items-center justify-center w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <Chessboard
          board={board}
          socket={socket}
          updateBoard={updateBoard}
          orientation={myColor}
          turn={turn}
          started={started}
        />
        <div className="w-1/2 p-6">
          <p className="text-gray-600 mb-4 text-4xl">
            {started
              ? "Game is running!"
              : "Waiting for an opponent to join the game..."}
          </p>
          {started && (
            <p className="text-gray-600 mb-4 text-xl">
              {turn === myColor ? "Your turn" : "Opponent's turn"}
            </p>
          )}
          {started ? null : (
            <div className="flex justify-center">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => {
                  clearGameState();
                  socket.send(JSON.stringify({ type: INIT_GAME }));
                }}
              >
                Play
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
