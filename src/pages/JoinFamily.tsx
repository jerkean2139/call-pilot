import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function JoinFamily() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<'joining' | 'success' | 'error'>('joining');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!code) return;

    if (!isAuthenticated) {
      // Store the invite code and redirect to register
      localStorage.setItem('living-legacy-pending-invite', code);
      navigate('/register');
      return;
    }

    // Auto-join
    fetch('/api/family/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else {
          setStatus('success');
          setMessage(data.familyOwner ? `You joined ${data.familyOwner}'s family!` : 'Joined successfully!');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [code, isAuthenticated, token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-50 px-4 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        {status === 'joining' && (
          <>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
            <h2 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
              Joining family...
            </h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="mb-2 font-heading text-xl font-bold text-gray-800 dark:text-white">
              Welcome to the Family!
            </h2>
            <p className="mb-6 text-sm text-gray-500">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-rose-600"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
              <Users className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="mb-2 font-heading text-xl font-bold text-gray-800 dark:text-white">
              Couldn't Join
            </h2>
            <p className="mb-6 text-sm text-gray-500">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="rounded-xl bg-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-300"
            >
              Go Home
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
