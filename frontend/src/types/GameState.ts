import type { Square, PieceSymbol, Color } from "chess.js";

export interface GameState {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket?: WebSocket;
  updateBoard?: (move: { from: Square; to: Square }) => boolean;
  orientation: "white" | "black" | null;
  turn: "white" | "black";
  fen?: string;
  myColor?: "white" | "black";
  started: boolean;
}

export type GameOverReason = "checkmate" | "resigned" | "draw" | "stalemate" | "time";

export interface GameOverPayload {
  winner: "white" | "black";
  reason?: GameOverReason;
}
