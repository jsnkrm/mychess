import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { INIT_GAME, MOVE } from "./messages";

interface GameOverPayload {
  winner: "white" | "black";
  reason: "checkmate" | "draw" | "stalemate" | "resigned";
}

export class Game {
  private player1: WebSocket;
  private player2: WebSocket;
  private board: Chess;
  private startTime: Date;
  private moveNumber: number;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.player1.send(
      JSON.stringify({ type: INIT_GAME, payload: { color: "white" } }),
    );
    this.player2.send(
      JSON.stringify({ type: INIT_GAME, payload: { color: "black" } }),
    );
    this.moveNumber = 1;
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    console.log(
      "Move Number:",
      this.moveNumber,
      "Player:",
      socket === this.player1 ? "white" : "black",
      "Move:",
      move,
    );
    if (this.moveNumber % 2 === 1 && socket !== this.player1) {
      console.error("Invalid move: Not player's turn");
      return;
    }
    if (this.moveNumber % 2 === 0 && socket !== this.player2) {
      console.error("Invalid move: Not player's turn");
      return;
    }

    try {
      this.board.move(move);
    } catch (error) {
      console.error("Invalid move:", error);
      return;
    }

    const movePayload = JSON.stringify({ type: MOVE, payload: { move } });
    this.player1.send(movePayload);
    this.player2.send(movePayload);

    if (this.checkAndHandleGameOver(socket)) {
      return;
    }

    this.moveNumber++;
  }

  private checkAndHandleGameOver(sender: WebSocket): boolean {
    if (!this.board.isGameOver()) {
      return false;
    }

    if (this.board.isCheckmate()) {
      const winner = sender === this.player1 ? "white" : "black";
      const payload: GameOverPayload = { winner, reason: "checkmate" };
      this.sendGameOver(payload);
      return true;
    }

    if (this.board.isStalemate()) {
      const payload: GameOverPayload = { winner: "white", reason: "stalemate" };
      this.sendGameOver(payload);
      return true;
    }

    if (this.board.isDraw()) {
      const payload: GameOverPayload = { winner: "white", reason: "draw" };
      this.sendGameOver(payload);
      return true;
    }

    return false;
  }

  private sendGameOver(payload: GameOverPayload): void {
    const gameOverMessage = JSON.stringify({ type: "GAME_OVER", payload });
    this.player1.send(gameOverMessage);
    this.player2.send(gameOverMessage);
  }

  hasPlayer(socket: WebSocket): boolean {
    return socket === this.player1 || socket === this.player2;
  }

  resign(socket: WebSocket): void {
    const winner = socket === this.player1 ? "black" : "white";
    console.log(`Player resigned. Winner: ${winner}`);

    const payload: GameOverPayload = { winner, reason: "resigned" };
    this.sendGameOver(payload);
  }
}