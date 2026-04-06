interface GameInProgressProps {
  turn: "white" | "black";
  myColor: "white" | "black" | null;
  onResign: () => void;
}

export const GameInProgress = ({ turn, myColor, onResign }: GameInProgressProps) => {
  return (
    <>
      <h2 className="font-display text-xl text-white mb-3">Game in Progress</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <span className="text-slate-400 text-sm">Current Turn</span>
          <span className={`font-medium capitalize ${turn === myColor ? 'text-amber-400' : 'text-slate-500'}`}>
            {turn}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <span className="text-slate-400 text-sm">Your Color</span>
          <span className="font-medium capitalize text-amber-400">{myColor}</span>
        </div>
        <button
          onClick={onResign}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onResign();
            }
          }}
          className="w-full mt-4 py-2 px-4 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Resign
        </button>
      </div>
    </>
  );
};