import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  User,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../common/Avatar.jsx';

const NAV = [
  { to: '/',      label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/tasks', label: 'Kanban Board', icon: Kanban },
  { to: '/profile', label: 'My Profile', icon: User },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 px-3.5 py-4">
      {/* Jira Style Logo */}
      <div className="px-2 mb-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight block">
            JiraFlow
          </span>
          <span className="text-[11px] font-medium text-slate-400 block truncate">
            Task Management
          </span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 flex flex-col gap-1.5">
        <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
          Planning
        </p>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Current User Card */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <Avatar user={user} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
