import React from 'react';
import { User } from 'lucide-react';

const AuthStatusBanner = ({ isAuthReady, userId, syncBadge }) => {
  if (!isAuthReady || !userId) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-400 p-3 bg-slate-800/50 rounded-lg border border-slate-700/60">
      <div className="flex items-center space-x-2">
        <User className="w-4 h-4 text-blue-400" />
        <span>Kullanıcı Kimliği: {userId}</span>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${syncBadge.className}`}>
        {syncBadge.text}
      </span>
    </div>
  );
};

export default AuthStatusBanner;
