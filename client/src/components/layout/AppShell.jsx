import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import MobileNav from './MobileNav.jsx';

export default function AppShell() {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 overflow-x-hidden w-full max-w-full">
      {/* Desktop sidebar - docked and fixed */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-30">
        <Sidebar />
      </aside>

      {/* Main content wrapper - strictly constrained with min-w-0 to prevent browser horizontal scrolling */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen min-w-0 w-full max-w-full overflow-x-hidden">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 w-full max-w-full pb-24 md:pb-6 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
