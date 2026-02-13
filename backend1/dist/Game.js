"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({ type: messages_1.INIT_GAME, payload: { color: "white" } }));
        this.player2.send(JSON.stringify({ type: messages_1.INIT_GAME, payload: { color: "black" } }));
        this.moveNumber = 1;
    }
    makeMove(socket, move) {
        console.log("Move Number:", this.moveNumber, "Player:", socket === this.player1 ? "white" : "black", "Move:", move);
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
        }
        catch (error) {
            console.error("Invalid move:", error);
        }
        if (this.board.isGameOver()) {
            this.player1.send(JSON.stringify({
                type: "GAME_OVER",
                payload: { winner: this.board.turn() === "w" ? "black" : "white" },
            }));
            this.player2.send(JSON.stringify({
                type: "GAME_OVER",
                payload: { winner: this.board.turn() === "w" ? "black" : "white" },
            }));
            return;
        }
        this.moveNumber++;
        if (this.moveNumber % 2 === 0) {
            this.player2.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: {
                    move: move,
                },
            }));
        }
        else {
            this.player1.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: {
                    move: move,
                },
            }));
        }
    }
    hasPlayer(socket) {
        return socket === this.player1 || socket === this.player2;
    }
}
exports.Game = Game;
