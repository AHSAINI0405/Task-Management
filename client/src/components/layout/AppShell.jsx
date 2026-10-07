import { Outlet } from 'react-router-dom';
import Sidebar    from './Sidebar.jsx';
import Topbar     from './Topbar.jsx';
import MobileNav  from './MobileNav.jsx';

export default function AppShell() {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0">
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
