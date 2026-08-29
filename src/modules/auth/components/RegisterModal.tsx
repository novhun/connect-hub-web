import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, UserPlus, Loader2, Sparkles, Briefcase } from 'lucide-react';
import { authApi } from '../api';
import { User } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { triggerRealGoogleLogin } from '../../../services/googleAuth';
import appLogo from '../../../../src/assets/icons/icon.png';

interface RegisterModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  onClose,
  onSuccess,
  onSwitchToLogin,
}) => {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.register({
        name,
        email,
        password,
        role: role || 'Member',
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(
        err.message ||
          (language === 'km'
            ? 'ការចុះឈ្មោះបរាជ័យ។ សូមព្យាយាមម្តងទៀត។'
            : 'Registration failed. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const user = await triggerRealGoogleLogin();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      if (!err.message?.includes('closed')) {
        setError(
          err.message ||
            (language === 'km'
              ? 'ការចុះឈ្មោះតាម Google បរាជ័យ។ សូមព្យាយាមម្តងទៀត។'
              : 'Google Sign-Up failed. Please try again.')
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 shadow-md shrink-0">
              <img src={appLogo} alt="Connect-Hub" className="w-full h-full object-contain" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ចូលរួម Connect-Hub' : 'Join Connect-Hub'}</span>
            </div>
          </div>
          <h2 className="text-2xl font-black">
            {language === 'km' ? 'បង្កើតគណនីថ្មី' : 'Create Account'}
          </h2>
          <p className="text-xs text-purple-100 mt-1">
            {language === 'km'
              ? 'ចាប់ផ្តើមភ្ជាប់ទំនាក់ទំនងជាមួយសហគមន៍ទូទាំងពិភពលោក'
              : 'Start connecting with communities worldwide'}
          </p>
        </div>

        <div className="p-6 space-y-3.5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Google Sign-Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-2xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {googleLoading
                ? language === 'km'
                  ? 'កំពុងភ្ជាប់ Google...'
                  : 'Connecting Google...'
                : language === 'km'
                ? 'ចុះឈ្មោះជាមួយ Google'
                : 'Sign up with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">
              {language === 'km' ? 'ឬ បំពេញព័ត៌មានខាងក្រោម' : 'or fill in the details'}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {language === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {language === 'km' ? 'អាសយដ្ឋានអ៊ីមែល' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {language === 'km' ? 'មុខតំណែង / ជំនាញ' : 'Role / Headline'}
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {language === 'km' ? 'ពាក្យសម្ងាត់' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>
                {loading
                  ? language === 'km'
                    ? 'កំពុងបង្កើតគណនី...'
                    : 'Creating Account...'
                  : language === 'km'
                  ? 'ចុះឈ្មោះ'
                  : 'Sign Up'}
              </span>
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-gray-500">
                {language === 'km' ? 'មានគណនីរួចហើយមែនទេ? ' : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                {language === 'km' ? 'ចូលគណនី' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
