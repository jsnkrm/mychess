import type { Square } from "chess.js";
import { useCallback, useMemo, useState } from "react";
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
  return isLightSquare ? "bg-[#e8dfd0]" : "bg-[#b58863]";
};

export const Chessboard = ({ board, socket, updateBoard, orientation, turn }: GameState) => {
  const [from, setFrom] = useState<Square | null>(null);
  const [invalidMove, setInvalidMove] = useState<{ from: Square; to: Square } | null>(null);

  const isMyTurn = turn === (orientation || "white");

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentSquare: Square) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSquareClick(currentSquare);
    }
  }, [handleSquareClick]);

  const squares = useMemo(() => {
    return board.map((row, i) =>
      row.map((cell, j) => {
        const currentSquareKey = getSquare(i, j);
        const isLightSquare = (i + j) % 2 === 0;
        const isInvalidSquare = !!(invalidMove && (currentSquareKey === invalidMove.from || currentSquareKey === invalidMove.to));
        const squareColor = getSquareColor(isInvalidSquare, isLightSquare);
        
        const turnColor = turn === "white" ? "w" : "b";
        const isMyPiece = cell?.color === turnColor;
        
        return {
          key: currentSquareKey,
          row: i,
          col: j,
          squareColor,
          cell,
          isMyPiece,
        };
      }),
    );
  }, [board, invalidMove, turn]);

  return (
    <div className={`w-full max-w-[480px] aspect-square rounded-lg shadow-xl p-2 ${orientation === "black" ? "rotate-180" : ""}`}>
      <div className="grid grid-cols-8 gap-0 rounded-lg overflow-hidden">
        {squares.map((row, i) =>
          row.map((square, j) => (
            <button
              key={`${square.key}-${i}-${j}`}
              className={`w-full aspect-square flex items-center justify-center ${square.squareColor} transition-all duration-150 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset outline-none cursor-pointer`}
              onClick={() => handleSquareClick(square.key)}
              onKeyDown={(e) => handleKeyDown(e, square.key)}
              aria-label={`${square.key}${square.cell ? `, ${square.cell.color} ${square.cell.type}` : ""}`}
              disabled={!isMyTurn}
              type="button"
            >
              {square.cell && (
                <img
                  src={`/${
                    square.cell.color === "b"
                      ? `b${square.cell.type.toUpperCase()}`
                      : `w${square.cell.type.toUpperCase()}`
                  }.svg`}
                  className={`w-10 h-10 ${orientation === "black" ? "rotate-180" : ""} ${!square.isMyPiece ? "opacity-50" : ""}`}
                  alt={`${square.cell.color === "w" ? "white" : "black"} ${square.cell.type}`}
                  width={40}
                  height={40}
                />
              )}
            </button>
          )),
        )}
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {invalidMove && "Invalid move"}
      </div>
    </div>
  );
};
