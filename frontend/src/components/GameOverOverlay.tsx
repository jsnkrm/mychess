import type { GameOverPayload } from "../types/GameState";

interface GameOverOverlayProps {
  gameOverData: GameOverPayload | null;
  myColor: "white" | "black" | null;
  onPlayAgain: () => void;
}

export const GameOverOverlay = ({ gameOverData, myColor, onPlayAgain }: GameOverOverlayProps) => {
  if (!gameOverData) return null;

  const getGameOverMessage = () => {
    const iWon = gameOverData.winner === myColor;
    const reason = gameOverData.reason;

    if (iWon) {
      if (reason === "resigned") return "You won! Opponent resigned";
      if (reason === "checkmate") return "You won! Checkmate";
      if (reason === "draw") return "You won! Draw";
      return "You won!";
    } else {
      if (reason === "resigned") return "You resigned";
      if (reason === "checkmate") return "Checkmate! You lost";
      if (reason === "draw") return "Draw";
      return "You lost";
    }
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
      <div className="bg-card border border-slate-700/50 rounded-2xl p-8 text-center max-w-sm mx-4">
        <h2 className="font-display text-2xl font-semibold text-white mb-2">
          {getGameOverMessage()}
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          {gameOverData.winner === myColor
            ? "Great game!"
            : "Better luck next time."}
        </p>
        <button
          onClick={onPlayAgain}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onPlayAgain();
            }
          }}
          className="w-full py-3 px-6 rounded-xl btn-primary flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Play Again
        </button>
      </div>
    </div>
  );
};