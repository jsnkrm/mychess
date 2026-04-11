import { Game } from "./Game";
import { WebSocket } from "ws";
import { INIT_GAME, MOVE, RESIGN } from "./messages";

export interface User {
  id: string;
  email: string | null;
  name: string;
  isGuest?: boolean;
}

interface UserSocket {
  socket: WebSocket;
  user: User;
}

export class GameManager {
  private games: Game[];
  private users: Map<WebSocket, User>;
  private pendingUser: UserSocket | null;

  constructor() {
    this.games = [];
    this.users = new Map();
    this.pendingUser = null;
  }

  addUser(socket: WebSocket, user: User) {
    this.users.set(socket, user);

    const existing = this.findGameByUserId(user.id);
    if (existing && !existing.isUserLive(user.id)) {
      existing.reattach(user.id, socket);
    }

    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    const user = this.users.get(socket);
    this.users.delete(socket);

    if (this.pendingUser?.socket === socket) {
      this.pendingUser = null;
    }

    if (user) {
      const game = this.findGameByUserId(user.id);
      if (game && !game.ended && game.hasPlayer(socket)) {
        game.markDisconnected(user.id);
      }
    }
  }

  getUser(socket: WebSocket): User | undefined {
    return this.users.get(socket);
  }

  private findGameByUserId(userId: string): Game | undefined {
    return this.games.find((g) => g.hasUser(userId) && !g.ended);
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());
      const user = this.users.get(socket);

      if (message.type === INIT_GAME) {
        if (!user) return;

        // Reject if user is already in an active game (duplicate tab or
        // reconnecting client that re-emitted INIT_GAME from restored state).
        if (this.findGameByUserId(user.id)) {
          return;
        }

        if (this.pendingUser) {
          if (this.pendingUser.user.id === user.id) {
            // Same user as pending — ignore.
            return;
          }
          const pending = this.pendingUser;
          this.pendingUser = null;
          const game = new Game(
            pending.user.id,
            pending.socket,
            user.id,
            socket,
            (g) => {
              this.games = this.games.filter((x) => x !== g);
            },
          );
          this.games.push(game);
        } else {
          this.pendingUser = { socket, user };
        }
      }
      if (message.type === MOVE) {
        const game = this.games.find((g) => g.hasPlayer(socket));
        if (game) {
          game.makeMove(socket, message.payload.move);
        }
      }
      if (message.type === RESIGN) {
        const game = this.games.find((g) => g.hasPlayer(socket));
        if (game) {
          game.resign(socket);
        }
      }
    });
  }
}
