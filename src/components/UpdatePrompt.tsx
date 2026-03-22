import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setShowUpdate(true);
          }
        });
      });
    });

    // Check for updates periodically
    const interval = setInterval(() => {
      navigator.serviceWorker.ready.then((reg) => reg.update());
    }, 60 * 60 * 1000); // every hour

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-lg"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-violet-600 p-4 text-white shadow-lg">
            <RefreshCw size={18} />
            <div className="flex-1">
              <p className="text-sm font-semibold">Update Available</p>
              <p className="text-xs text-violet-200">A new version is ready</p>
            </div>
            <button
              onClick={handleUpdate}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-violet-600 transition-all hover:bg-violet-50"
            >
              Update
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
