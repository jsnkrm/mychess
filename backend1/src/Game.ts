import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { INIT_GAME, MOVE } from "./messages";
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
    }

    if (this.board.isGameOver()) {
      this.player1.send(
        JSON.stringify({
          type: "GAME_OVER",
          payload: { winner: this.board.turn() === "w" ? "black" : "white" },
        }),
      );
      this.player2.send(
        JSON.stringify({
          type: "GAME_OVER",
          payload: { winner: this.board.turn() === "w" ? "black" : "white" },
        }),
      );
      return;
    }
    this.moveNumber++;

    if (this.moveNumber % 2 === 0) {
      this.player2.send(
        JSON.stringify({
          type: MOVE,
          payload: {
            move: move,
          },
        }),
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: {
            move: move,
          },
        }),
      );
    }
  }

  hasPlayer(socket: WebSocket): boolean {
    return socket === this.player1 || socket === this.player2;
  }
}
