import type { Square, PieceSymbol, Color } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

export const Chessboard = ({
  board,
  socket,
  updateBoard,
}: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  updateBoard: (move: { from: Square; to: Square }) => void;
}) => {
  const [from, setFrom] = useState<Square | null>(null);
  const [to, setTo] = useState<Square | null>(null);
  return (
    <div className="w-1/2 h-auto rounded-lg shadow-md p-6">
      <div className="grid grid-cols-8 gap-0">
        {board.map((row, i) =>
          row.map((cell, j) => {
            const isLightSquare = (i + j) % 2 === 0;
            const squareColor = isLightSquare ? "bg-gray-200" : "bg-gray-700";
            return (
              <div
                key={`${i}-${j}`}
                className={`w-12 h-12 flex items-center justify-center ${squareColor}`}
                onClick={() => {
                  const currentSquare =
                    `${String.fromCharCode(97 + j)}${8 - i}` as Square;
                  if (!from) {
                    setFrom(currentSquare);
                  } else {
                    setTo(currentSquare);

                    if (from === to) {
                      setFrom(null);
                      setTo(null);
                      return;
                    }

                    //update the the chess board and send the move to the server
                    updateBoard({ from, to: currentSquare });

                    socket.send(
                      JSON.stringify({
                        type: MOVE,
                        payload: {
                          move: {
                            from,
                            to: currentSquare,
                          },
                        },
                      }),
                    );
                    setFrom(null);
                    setTo(null);
                  }
                  console.log("Clicked on square:", from, to);
                }}
              >
                {cell && (
                  <img
                    src={`/${
                      cell.color === "b"
                        ? `b${cell.type.toUpperCase()}`
                        : `w${cell.type.toUpperCase()}`
                    }.svg`}
                    className="w-10 h-10"
                    alt={cell.type}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
};
