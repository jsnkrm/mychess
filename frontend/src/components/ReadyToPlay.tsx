interface ReadyToPlayProps {
  onStartGame: () => void;
}

export const ReadyToPlay = ({ onStartGame }: ReadyToPlayProps) => {
  return (
    <>
      <h2 className="font-display text-xl text-white mb-3">Ready to Play</h2>
      <p className="text-slate-400 text-sm mb-6">
        Find an opponent and start a new game
      </p>
      <button
        onClick={onStartGame}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onStartGame();
          }
        }}
        className="w-full py-3 px-6 rounded-xl btn-primary flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        Find Opponent
      </button>
    </>
  );
};