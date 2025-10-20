// components/Button.js
import { useState } from 'react';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  isLoading = false, 
  className = '',
  variant = 'primary',
  size = 'md',
  icon: Icon = null,
  tooltip = null
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
    xl: 'px-10 py-3.5 text-lg'
  };

  // Color variants
  const variantClasses = {
    primary: `bg-gradient-to-r from-indigo-600 to-indigo-700 text-white 
              hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg
              active:from-indigo-800 active:to-indigo-900
              focus:ring-indigo-500/50`,
    secondary: `bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white
                hover:bg-slate-300 dark:hover:bg-slate-600 hover:shadow-md
                active:bg-slate-400 dark:active:bg-slate-500
                focus:ring-slate-500/50`,
    ghost: `bg-transparent text-indigo-600 dark:text-indigo-400
            hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:shadow-sm
            active:bg-indigo-100 dark:active:bg-indigo-900/30
            focus:ring-indigo-500/50`,
    danger: `bg-red-600 text-white hover:bg-red-700 hover:shadow-lg
             active:bg-red-800 focus:ring-red-500/50`,
    success: `bg-green-600 text-white hover:bg-green-700 hover:shadow-lg
              active:bg-green-800 focus:ring-green-500/50`
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        onMouseEnter={() => tooltip && setShowTooltip(true)}
        onMouseLeave={() => tooltip && setShowTooltip(false)}
        className={`
          relative inline-flex items-center justify-center
          font-medium rounded-lg
          transition-all duration-200 transform
          hover:scale-[1.02] active:scale-[0.98]
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg 
              className="animate-spin h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {typeof children === 'string' ? children : 'Loading...'}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            {children}
          </span>
        )}
      </button>

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 
                        bg-slate-900 text-white text-xs rounded whitespace-nowrap
                        animate-slideInDown shadow-lg">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-slate-900" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Button;
