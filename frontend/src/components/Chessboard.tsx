import type { Square } from "chess.js";
import { useCallback, useState } from "react";
import { MOVE } from "../constants";
import type { GameState } from "../types/GameState";

const getSquare = (i: number, j: number): Square => {
  const file = String.fromCharCode(97 + j);
  const rank = 8 - i;
  return `${file}${rank}` as Square;
};

const getSquareColor = (isInvalidSquare: boolean, isLightSquare: boolean): string => {
  if (isInvalidSquare) {
    return "bg-red-500";
  }
  return isLightSquare ? "bg-gray-200" : "bg-gray-700";
};

export const Chessboard = ({ board, socket, updateBoard, orientation, turn }: GameState) => {
  const [from, setFrom] = useState<Square | null>(null);
  const [invalidMove, setInvalidMove] = useState<{ from: Square; to: Square } | null>(null);

  const handleSquareClick = useCallback((currentSquare: Square) => {
    if (turn !== (orientation || "white")) {
      return;
    }
    if (!from) {
      setFrom(currentSquare);
    } else {
      if (from === currentSquare) {
        setFrom(null);
        return;
      }

      if (updateBoard && socket) {
        const isValid = updateBoard({ from, to: currentSquare });

        if (!isValid) {
          setInvalidMove({ from, to: currentSquare });
          setTimeout(() => setInvalidMove(null), 2000);
          setFrom(null);
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
    }
  }, [from, orientation, turn, updateBoard, socket]);

  return (
    <div className={`w-1/2 h-auto rounded-lg shadow-md p-6 ${orientation === "black" ? "rotate-180" : ""}`}>
      <div className="grid grid-cols-8 gap-0">
        {board.map((row, i) =>
          row.map((cell, j) => {
            const currentSquareKey = getSquare(i, j);
            const isLightSquare = (i + j) % 2 === 0;
            const isInvalidSquare = !!(invalidMove && (currentSquareKey === invalidMove.from || currentSquareKey === invalidMove.to));
            const squareColor = getSquareColor(isInvalidSquare, isLightSquare);
            
            const turnColor = turn === "white" ? "w" : "b";
            const isMyPiece = cell?.color === turnColor;
            const pieceOpacity = isMyPiece ? "" : "opacity-50";
            
            return (
              <div
                key={`${i}-${j}`}
                className={`w-12 h-12 flex items-center justify-center ${squareColor}`}
                onClick={() => handleSquareClick(currentSquareKey)}
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
