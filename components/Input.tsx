import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full mb-4">
      {label && <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-gray-200">{label}</label>}
      <input 
        className={`w-full p-3 bg-white dark:bg-darksurface border-2 rounded-lg outline-none transition-colors 
          text-black dark:text-white
          ${error ? 'border-red-500 focus:border-red-600' : 'border-gray-200 dark:border-darkborder focus:border-black dark:focus:border-white'} 
          ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};