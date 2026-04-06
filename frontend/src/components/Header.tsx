interface User {
  name: string;
  isGuest?: boolean;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header = ({ user, onLogout }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30">
          <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-white">
          My<span className="text-amber-400">Chess</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm font-semibold text-slate-900">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-slate-300 font-medium">{user.name}</span>
          {user.isGuest && (
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Guest</span>
          )}
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-red-400"
          aria-label="Logout"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
};