import { useLocation } from 'react-router-dom';
import { Moon, Sun, Layers } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../common/Avatar.jsx';

const PAGE_TITLES = {
  '/':         'Project Overview',
  '/tasks':    'Kanban Board & Tasks',
  '/profile':  'Account Settings',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { dark, toggle } = useTheme();
  const { user } = useAuth();
  const title = PAGE_TITLES[pathname] ?? 'JiraFlow';

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <Avatar user={user} size="sm" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {user?.name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
