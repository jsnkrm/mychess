import { useEffect, useState } from "react";
import type { OpponentStatus } from "../hooks/useSocket";

interface GameInfoProps {
  started: boolean;
  isReconnecting: boolean;
  opponentStatus: OpponentStatus;
}

export const GameInfo = ({ started, isReconnecting, opponentStatus }: GameInfoProps) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!opponentStatus.disconnected || !opponentStatus.expiresAt) {
      setSecondsLeft(null);
      return;
    }

    const expiresAt = opponentStatus.expiresAt;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [opponentStatus.disconnected, opponentStatus.expiresAt]);

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
      {opponentStatus.disconnected && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 p-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 text-sm"
        >
          Opponent disconnected
          {secondsLeft !== null && (
            <> — forfeits in {secondsLeft}s</>
          )}
        </div>
      )}
    </div>
  );
};
