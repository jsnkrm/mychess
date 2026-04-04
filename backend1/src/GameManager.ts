import { Game } from "./Game";
import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages";

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
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    this.users.delete(socket);
    if (this.pendingUser?.socket === socket) {
      this.pendingUser = null;
    }
  }

  getUser(socket: WebSocket): User | undefined {
    return this.users.get(socket);
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());
      const user = this.users.get(socket);

      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          const game = new Game(this.pendingUser.socket, socket);
          this.games.push(game);
          this.pendingUser = null;
        } else if (user) {
          this.pendingUser = { socket, user };
        }
      }
      if (message.type === MOVE) {
        const game = this.games.find((g) => g.hasPlayer(socket));
        if (game) {
          game.makeMove(socket, message.payload.move);
        }
      }
    });
  }
}
