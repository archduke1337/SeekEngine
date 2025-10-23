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
    primary: `bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white 
              hover:from-[var(--primary-dark)] hover:to-[var(--secondary-dark)] hover:shadow-lg
              active:from-[var(--primary-dark)] active:to-[var(--secondary-dark)]
              focus:ring-[var(--primary)]/50`,
    secondary: `bg-[var(--surface-2)] text-[var(--text-primary)]
                hover:bg-[var(--surface-3)] hover:shadow-md
                active:bg-[var(--surface-3)]
                focus:ring-[var(--primary)]/50 border border-[var(--border)]`,
    ghost: `bg-transparent text-[var(--primary)]
            hover:bg-[var(--primary)]/10 hover:shadow-sm
            active:bg-[var(--primary)]/20
            focus:ring-[var(--primary)]/50`,
    danger: `bg-[var(--error)] text-white hover:bg-[var(--error-dark)] hover:shadow-lg
             active:bg-[var(--error-dark)] focus:ring-[var(--error)]/50`,
    success: `bg-[var(--success)] text-white hover:bg-[var(--success-dark)] hover:shadow-lg
              active:bg-[var(--success-dark)] focus:ring-[var(--success)]/50`
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
