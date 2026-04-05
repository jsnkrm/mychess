/* eslint-disable react-hooks/immutability */
import { useCallback, useEffect, useState } from "react";
import { Chessboard } from "../components/Chessboard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export const Game = () => {
  const { socket, user } = useSocket();
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [myColor, setMyColor] = useState<"white" | "black" | null>(null);
  const [turn, setTurn] = useState<"white" | "black">("white");

  const updateBoard = useCallback((move: { from: string; to: string }) => {
    try {
      chess.move(move);
      setBoard(chess.board());
    } catch (error) {
      console.error("Invalid move:", error);
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
          break;

        case MOVE:
          console.log("Move received:", message.payload);
          updateBoard(message.payload.move);
          setTurn(chess.turn() as "white" | "black");
          break;

        case GAME_OVER:
          console.log("Game over! Winner:", message.payload.winner);
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
