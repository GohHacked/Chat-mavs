import React from 'react';
import { User } from '../types';
import { Users } from 'lucide-react';

interface AvatarProps {
  user?: User; // Made optional for group use case
  isGroup?: boolean; // New prop
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  onClick?: () => void;
  withRing?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ user, isGroup = false, size = 'md', className = '', onClick, withRing = false }) => {
  const sizeClasses = {
    xs: 'h-5 w-5 text-[9px]',
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-10 w-10 text-sm', 
    lg: 'h-14 w-14 text-xl',
    xl: 'h-16 w-16 text-2xl',
    xxl: 'h-28 w-28 text-4xl', 
  };

  // Group Avatar Logic
  if (isGroup) {
      return (
        <div 
          onClick={onClick}
          className={`${sizeClasses[size]} flex-shrink-0 rounded-2xl flex items-center justify-center font-bold relative overflow-hidden transition-all bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 ${className}`}
        >
            <Users className="text-white w-[60%] h-[60%]" />
        </div>
      );
  }

  if (!user) return null;

  const displayName = user.displayName || user.username || '?';
  const initial = displayName[0].toUpperCase();

  return (
    <div className={`relative ${withRing ? 'p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600' : ''}`}>
        <div 
        onClick={onClick}
        className={`
            ${sizeClasses[size]} 
            flex-shrink-0 rounded-full flex items-center justify-center font-bold relative overflow-hidden transition-all 
            ${withRing ? 'border-2 border-white dark:border-black' : 'border border-black/5 dark:border-white/10'}
            ${className}
        `}
        style={{ backgroundColor: user.avatarUrl ? 'transparent' : (user.avatarColor || '#888') }}
        >
        {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
        ) : (
            <span className="text-white drop-shadow-md select-none">
            {initial}
            </span>
        )}
        </div>
        {/* Online Indicator for large avatars if needed */}
        {size !== 'xs' && size !== 'sm' && user.isOnline && !withRing && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
        )}
    </div>
  );
};