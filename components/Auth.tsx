import React, { useState } from 'react';
import { AuthView, User } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { storageService } from '../services/storage';
import { Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  t: (key: any) => string;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, t }) => {
  const [view, setView] = useState<AuthView>(AuthView.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User;
      if (view === AuthView.REGISTER) {
        if (!username || !email || !password) throw new Error(t('error_fields'));
        user = await storageService.register(email, username, password);
      } else {
        if (!email || !password) throw new Error(t('error_fields'));
        user = await storageService.login(email, password);
      }
      
      // Successfully logged in/registered, trigger app state immediately
      onLogin(user);
      
    } catch (err: any) {
      console.error("Auth UI Error:", err);
      let errMsg = err.message || 'Error';
      
      // Handle Firebase Error Codes & Messages
      if (errMsg.includes('email-already-in-use')) {
          errMsg = t('error_exists') + ". Please Log In.";
      } else if (errMsg.includes('user-not-found') || errMsg.includes('wrong-password') || errMsg.includes('invalid-credential')) {
          errMsg = t('error_not_found');
      } else if (errMsg.includes('PERMISSION_DENIED') || (err.code && err.code.includes('PERMISSION_DENIED'))) {
          // Explicitly handle DB permission errors
          errMsg = t('error_permission');
      }
      
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white dark:bg-black transition-colors animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 relative">
          {/* Animated Logo Container */}
          <div className="flex justify-center mb-4">
             <div className="relative group cursor-default">
                 <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                 <span className="relative z-10 text-6xl font-extrabold tracking-tight text-black dark:text-white transition-transform group-hover:scale-110 duration-300 inline-block">M</span>
                 <svg 
                    viewBox="0 0 120 120" 
                    className="absolute -top-[20px] -left-[18px] w-[46px] h-[46px] z-20 pointer-events-none filter drop-shadow-sm animate-[pulse_3s_ease-in-out_infinite]"
                    style={{ overflow: 'visible' }}
                >
                    <path d="M28 80 C 35 20 85 30 95 60 L 80 70 C 70 50 45 50 48 80 Z" fill="#EF4444" />
                    <path d="M15 78 Q 32 72 50 82 L 48 94 Q 30 84 12 90 Z" fill="#FFFFFF" />
                    <circle cx="95" cy="60" r="10" fill="#FFFFFF" />
                </svg>
             </div>
          </div>

          <h1 className="text-4xl font-bold mb-2 tracking-tighter text-black dark:text-white">{t('app_name')}</h1>
          <p className="text-gray-500 dark:text-gray-400">Secure. Fast. Real.</p>
        </div>

        <form onSubmit={handleSubmit} className="animate-slide-in-up">
          {view === AuthView.REGISTER && (
            <Input 
              label={t('username')} 
              placeholder="@username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="animate-fade-in"
            />
          )}
          
          <Input 
            label={t('email')} 
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input 
            label={t('password')} 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
             <div className="mb-4 text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30 animate-message-enter">
                 <p className="text-red-500 text-sm font-bold">{error}</p>
             </div>
          )}

          <Button type="submit" fullWidth disabled={loading} className="mt-2 h-12 flex items-center justify-center relative overflow-hidden">
            {loading ? (
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t('processing')}</span>
                </div>
            ) : (
                <span className="tracking-wide font-bold">{view === AuthView.LOGIN ? t('login') : t('signup')}</span>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {view === AuthView.LOGIN ? t('no_account') : t('has_account')}
            <button 
              onClick={() => {
                setView(view === AuthView.LOGIN ? AuthView.REGISTER : AuthView.LOGIN);
                setError('');
              }}
              className="ml-2 font-bold text-black dark:text-white underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {view === AuthView.LOGIN ? t('signup') : t('login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};