import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline';
    loading?: boolean;
}

export function Button({ children, variant = 'primary', loading, className, ...props }: ButtonProps) {
  return (
    <button 
      className={twMerge(clsx(
        'w-full py-3 px-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2',
        {
          'bg-slate-900 text-white hover:bg-slate-800': variant === 'primary',
          'bg-transparent border border-slate-200 text-slate-700 hover:border-slate-900': variant === 'outline'
        },
        className
      ))}
      disabled={loading}
      {...props}
    >
      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
    </button>
  );
}