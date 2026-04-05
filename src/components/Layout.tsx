import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import OfflineIndicator from './OfflineIndicator';
import UpdatePrompt from './UpdatePrompt';

export default function Layout() {
  return (
    <div className="min-h-screen bg-warm-50 pb-20 dark:bg-gray-900">
      <OfflineIndicator />
      <UpdatePrompt />
      <main className="mx-auto max-w-lg px-5 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
