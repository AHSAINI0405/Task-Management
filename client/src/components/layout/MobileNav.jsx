import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Kanban, User } from 'lucide-react';

const NAV = [
  { to: '/',       label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks',  label: 'Kanban',    icon: Kanban },
  { to: '/profile', label: 'Profile',   icon: User },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
