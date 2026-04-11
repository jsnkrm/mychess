import { WebSocket } from "ws";
import { Chess } from "chess.js";
import {
  INIT_GAME,
  MOVE,
  GAME_OVER,
  OPPONENT_DISCONNECTED,
  OPPONENT_RECONNECTED,
} from "./messages";

const DISCONNECT_GRACE_MS = 30_000;

interface GameOverPayload {
  winner: "white" | "black";
  reason: "checkmate" | "draw" | "stalemate" | "resigned" | "abandoned";
}

interface PlayerSlot {
  userId: string;
  color: "white" | "black";
  socket: WebSocket | null;
  disconnectedAt: number | null;
}

type EndCallback = (game: Game) => void;

export class Game {
  private white: PlayerSlot;
  private black: PlayerSlot;
  private board: Chess;
  private startTime: Date;
  private moveNumber: number;
  private graceTimer: NodeJS.Timeout | null = null;
  private _ended: boolean = false;
  private onEnd: EndCallback;

  constructor(
    whiteUserId: string,
    whiteSocket: WebSocket,
    blackUserId: string,
    blackSocket: WebSocket,
    onEnd: EndCallback,
  ) {
    this.white = {
      userId: whiteUserId,
      color: "white",
      socket: whiteSocket,
      disconnectedAt: null,
    };
    this.black = {
      userId: blackUserId,
      color: "black",
      socket: blackSocket,
      disconnectedAt: null,
    };
    this.onEnd = onEnd;
    this.board = new Chess();
    this.startTime = new Date();
    this.moveNumber = 1;

    whiteSocket.send(
      JSON.stringify({ type: INIT_GAME, payload: { color: "white" } }),
    );
    blackSocket.send(
      JSON.stringify({ type: INIT_GAME, payload: { color: "black" } }),
    );
  }

  get ended(): boolean {
    return this._ended;
  }

  hasPlayer(socket: WebSocket): boolean {
    return this.white.socket === socket || this.black.socket === socket;
  }

  hasUser(userId: string): boolean {
    return this.white.userId === userId || this.black.userId === userId;
  }

  isUserLive(userId: string): boolean {
    const slot = this.slotForUser(userId);
    return !!slot && slot.socket !== null && slot.disconnectedAt === null;
  }

  private slotForUser(userId: string): PlayerSlot | null {
    if (this.white.userId === userId) return this.white;
    if (this.black.userId === userId) return this.black;
    return null;
  }

  private slotForSocket(socket: WebSocket): PlayerSlot | null {
    if (this.white.socket === socket) return this.white;
    if (this.black.socket === socket) return this.black;
    return null;
  }

  private opponentSlot(slot: PlayerSlot): PlayerSlot {
    return slot === this.white ? this.black : this.white;
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    if (this._ended) return;
    if (this.graceTimer) {
      console.error("Move rejected: opponent is in grace period");
      return;
    }

    const slot = this.slotForSocket(socket);
    if (!slot) return;

    const expectedColor = this.moveNumber % 2 === 1 ? "white" : "black";
    if (slot.color !== expectedColor) {
      console.error("Invalid move: Not player's turn");
      return;
    }

    console.log(
      "Move Number:",
      this.moveNumber,
      "Player:",
      slot.color,
      "Move:",
      move,
    );

    try {
      this.board.move(move);
    } catch (error) {
      console.error("Invalid move:", error);
      return;
    }

    const movePayload = JSON.stringify({ type: MOVE, payload: { move } });
    this.sendToBoth(movePayload);

    if (this.checkAndHandleGameOver(slot)) {
      return;
    }

    this.moveNumber++;
  }

  private checkAndHandleGameOver(mover: PlayerSlot): boolean {
    if (!this.board.isGameOver()) {
      return false;
    }

    if (this.board.isCheckmate()) {
      const payload: GameOverPayload = {
        winner: mover.color,
        reason: "checkmate",
      };
      this.endGame(payload);
      return true;
    }

    if (this.board.isStalemate()) {
      const payload: GameOverPayload = { winner: "white", reason: "stalemate" };
      this.endGame(payload);
      return true;
    }

    if (this.board.isDraw()) {
      const payload: GameOverPayload = { winner: "white", reason: "draw" };
      this.endGame(payload);
      return true;
    }

    return false;
  }

  private endGame(payload: GameOverPayload): void {
    if (this._ended) return;
    this._ended = true;
    if (this.graceTimer) {
      clearTimeout(this.graceTimer);
      this.graceTimer = null;
    }
    const message = JSON.stringify({ type: GAME_OVER, payload });
    this.sendToBoth(message);
    this.onEnd(this);
  }

  private sendToBoth(message: string): void {
    if (this.white.socket) this.white.socket.send(message);
    if (this.black.socket) this.black.socket.send(message);
  }

  resign(socket: WebSocket): void {
    if (this._ended) return;
    const slot = this.slotForSocket(socket);
    if (!slot) return;

    const winner: "white" | "black" = slot.color === "white" ? "black" : "white";
    console.log(`Player resigned. Winner: ${winner}`);

    const payload: GameOverPayload = { winner, reason: "resigned" };
    this.endGame(payload);
  }

  markDisconnected(userId: string): void {
    if (this._ended) return;
    const slot = this.slotForUser(userId);
    if (!slot) return;
    if (this.graceTimer) return; // already in grace for some user

    slot.socket = null;
    slot.disconnectedAt = Date.now();

    const opponent = this.opponentSlot(slot);
    const expiresAt = Date.now() + DISCONNECT_GRACE_MS;
    if (opponent.socket) {
      opponent.socket.send(
        JSON.stringify({
          type: OPPONENT_DISCONNECTED,
          payload: { gracePeriodMs: DISCONNECT_GRACE_MS, expiresAt },
        }),
      );
    }

    this.graceTimer = setTimeout(() => {
      this.abandon(userId);
    }, DISCONNECT_GRACE_MS);
  }

  reattach(userId: string, newSocket: WebSocket): boolean {
    if (this._ended) return false;
    const slot = this.slotForUser(userId);
    if (!slot) return false;
    if (slot.socket !== null) return false;

    slot.socket = newSocket;
    slot.disconnectedAt = null;

    if (this.graceTimer) {
      clearTimeout(this.graceTimer);
      this.graceTimer = null;
    }

    const opponent = this.opponentSlot(slot);
    if (opponent.socket) {
      opponent.socket.send(
        JSON.stringify({ type: OPPONENT_RECONNECTED, payload: {} }),
      );
    }

    return true;
  }

  private abandon(userId: string): void {
    if (this._ended) return;
    const slot = this.slotForUser(userId);
    if (!slot) return;

    const winner: "white" | "black" = slot.color === "white" ? "black" : "white";
    console.log(`Player abandoned. Winner: ${winner}`);

    const payload: GameOverPayload = { winner, reason: "abandoned" };
    this.endGame(payload);
  }
}
