import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, User, Heart, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Step = 'phone' | 'otp' | 'details';

export default function Register() {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, register, login } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);

  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
  };

  const handleSendOTP = async () => {
    if (phone.length < 10) return;
    setError('');
    setLoading(true);

    const result = await sendOTP(phone);
    setLoading(false);

    if (result.success) {
      setStep('otp');
    } else {
      setError(result.error || 'Failed to send code');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) return;
    setError('');
    setLoading(true);

    const result = await verifyOTP(phone, otp);
    setLoading(false);

    if (result.success) {
      if (result.userExists) {
        setUserExists(true);
        setStep('details');
      } else {
        setStep('details');
      }
    } else {
      setError(result.error || 'Invalid code');
    }
  };

  const handleRegister = async () => {
    if (userExists) {
      // Login existing user
      if (!password) return;
      setError('');
      setLoading(true);
      const result = await login(phone, password);
      setLoading(false);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed');
      }
      return;
    }

    if (!name || !password || password !== confirmPassword) {
      setError('Please fill all fields and make sure passwords match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);
    const result = await register(phone, password, name);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-50 px-6 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100">
            <Heart className="h-8 w-8 text-rose-500" fill="currentColor" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-gray-800 dark:text-white">
            {step === 'phone' ? 'Create Account' : step === 'otp' ? 'Verify Phone' : userExists ? 'Welcome Back' : 'Set Up Profile'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {step === 'phone'
              ? 'Enter your phone number to get started'
              : step === 'otp'
                ? `We sent a code to ${formatPhoneDisplay(phone)}`
                : userExists
                  ? 'Enter your password to sign in'
                  : 'Choose a name and password'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Phone */}
          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="tel"
                    value={formatPhoneDisplay(phone)}
                    onChange={handlePhoneChange}
                    placeholder="(765) 977-7008"
                    autoFocus
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}

              <button
                onClick={handleSendOTP}
                disabled={phone.length < 10 || loading}
                className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 disabled:opacity-40 active:scale-[0.98]"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </motion.div>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Verification Code
                </label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    autoFocus
                    maxLength={6}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-center text-lg tracking-[0.5em] outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={otp.length < 6 || loading}
                className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 disabled:opacity-40 active:scale-[0.98]"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                className="flex w-full items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={14} />
                Change phone number
              </button>
            </motion.div>
          )}

          {/* Step 3: Details (register or login) */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {!userExists && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    Your Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Karley Kean"
                      autoFocus
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={userExists ? 'Enter your password' : 'Create a password (6+ chars)'}
                    autoFocus={userExists}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {!userExists && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}

              <button
                onClick={handleRegister}
                disabled={loading || (!userExists && (!name || !password || password !== confirmPassword))}
                className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 disabled:opacity-40 active:scale-[0.98]"
              >
                {loading ? 'Please wait...' : userExists ? 'Sign In' : 'Create Account'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-rose-500 hover:text-rose-600">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
