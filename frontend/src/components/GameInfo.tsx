interface GameInfoProps {
  started: boolean;
  isReconnecting: boolean;
}

export const GameInfo = ({ started, isReconnecting }: GameInfoProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-slate-400 text-sm font-medium mb-4">Game Info</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Status</span>
          <span className="text-slate-300">{started ? "Active" : "Idle"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Mode</span>
          <span className="text-slate-300">Classic</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Connection</span>
          <span className={`${isReconnecting ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {isReconnecting ? 'Reconnecting...' : 'Connected'}
          </span>
        </div>
      </div>
    </div>
  );
};