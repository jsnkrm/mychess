import type { Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../constants";
import type { GameState } from "../types/GameState";

const getSquareColor = (
  isInvalidSquare: boolean,
  isLightSquare: boolean,
  cell: { color: "w" | "b"; type: string } | null,
  turn: "white" | "black"
): string => {
  if (isInvalidSquare) {
    return "bg-red-500";
  }

  if (!cell) {
    return isLightSquare ? "bg-gray-200" : "bg-gray-700";
  }

  const isWhitePiece = cell.color === "w";
  const isBlackPiece = cell.color === "b";
  const isMyPiece = (turn === "white" && isWhitePiece) || (turn === "black" && isBlackPiece);
  const isOpponentPiece = (turn === "white" && isBlackPiece) || (turn === "black" && isWhitePiece);

  switch (true) {
    case isMyPiece:
      return isLightSquare ? "bg-green-200" : "bg-green-600";
    case isOpponentPiece:
      return isLightSquare ? "bg-red-200" : "bg-red-600";
    default:
      return isLightSquare ? "bg-gray-200" : "bg-gray-700";
  }
};

export const Chessboard = ({ board, socket, updateBoard, orientation, turn }: GameState) => {
  const [from, setFrom] = useState<Square | null>(null);
  const [to, setTo] = useState<Square | null>(null);
  const [invalidMove, setInvalidMove] = useState<{ from: Square; to: Square } | null>(null);

  const getSquare = (i: number, j: number): Square => {
    const file = String.fromCharCode(97 + j);
    const rank = 8 - i;
    return `${file}${rank}` as Square;
  };
  return (
    <div className={`w-1/2 h-auto rounded-lg shadow-md p-6 ${orientation === "black" ? "rotate-180" : ""}`}>
      <div className="grid grid-cols-8 gap-0">
        {board.map((row, i) =>
          row.map((cell, j) => {
            const currentSquareKey = getSquare(i, j);
            const isLightSquare = (i + j) % 2 === 0;
            const isInvalidSquare = !!(invalidMove && (currentSquareKey === invalidMove.from || currentSquareKey === invalidMove.to));
            const squareColor = getSquareColor(isInvalidSquare, isLightSquare, cell, turn);
            const isMyTurn = turn === (orientation || "white");
            const isMyPiece = cell && ((turn === "white" && cell.color === "w") || (turn === "black" && cell.color === "b"));
            const pieceOpacity = isMyTurn && cell && !isMyPiece ? "opacity-50" : "";
            return (
              <div
                key={`${i}-${j}`}
                className={`w-12 h-12 flex items-center justify-center ${squareColor}`}
                onClick={() => {
                  if (turn !== (orientation || "white")) {
                    return;
                  }
                  const currentSquare = getSquare(i, j);
                  if (!from) {
                    setFrom(currentSquare);
                  } else {
                    setTo(currentSquare);

                    if (from === to) {
                      setFrom(null);
                      setTo(null);
                      return;
                    }

                    if (updateBoard && socket) {
                      const isValid = updateBoard({ from, to: currentSquare });

                      if (!isValid) {
                        setInvalidMove({ from, to: currentSquare });
                        setTimeout(() => setInvalidMove(null), 2000);
                        setFrom(null);
                        setTo(null);
                        return;
                      }

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
                    }
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
                    className={`w-10 h-10 ${orientation === "black" ? "rotate-180" : ""} ${pieceOpacity}`}
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
