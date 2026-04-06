interface ResignModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResignModal = ({ onConfirm, onCancel }: ResignModalProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    } else if (e.key === "Enter") {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resign-title"
      aria-describedby="resign-description"
      onKeyDown={handleKeyDown}
    >
      <p id="resign-description" className="sr-only">
        Resign from the current game. Your opponent will be declared the winner.
      </p>
      <div
        className="bg-card border border-slate-700/50 rounded-2xl p-6 text-center max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="resign-title" className="font-display text-xl font-semibold text-white mb-2">
          Resign from game?
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Your opponent will win.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCancel();
              }
            }}
            className="flex-1 py-2 px-4 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onConfirm();
              }
            }}
            className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus-visible:ring-2 focus-visible:ring-red-400"
          >
            Resign
          </button>
        </div>
      </div>
    </div>
  );
};