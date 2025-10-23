// components/Badge.js
import { useState } from 'react';

/**
 * Badge Component
 * Displays a small label/tag with various styles and optional animation
 * 
 * @param {string} children - Badge text content
 * @param {string} variant - Badge style (primary, success, warning, error, info)
 * @param {boolean} animated - Enable pulse animation
 * @param {string} icon - Optional icon component (pass as React component)
 * @param {function} onClose - Optional close button handler
 * @param {string} className - Additional CSS classes
 */
const Badge = ({ 
  children, 
  variant = 'primary', 
  animated = false,
  icon: Icon = null,
  onClose = null,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Handle close action
  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  // Variant color mappings
  const variantClasses = {
    primary: `
      bg-[var(--primary)]/10
      text-[var(--primary)]
      border border-[var(--primary)]/30
    `,
    success: `
      bg-[var(--success)]/10
      text-[var(--success)]
      border border-[var(--success)]/30
    `,
    warning: `
      bg-[var(--warning)]/10
      text-[var(--warning)]
      border border-[var(--warning)]/30
    `,
    error: `
      bg-[var(--error)]/10
      text-[var(--error)]
      border border-[var(--error)]/30
    `,
    info: `
      bg-[var(--secondary)]/10
      text-[var(--secondary)]
      border border-[var(--secondary)]/30
    `,
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 transform
        ${variantClasses[variant] || variantClasses.primary}
        ${animated ? 'animate-pulse-soft' : ''}
        ${onClose ? 'pr-2' : ''}
        ${className}
      `}
      role="status"
      aria-label={`${variant} badge: ${children}`}
    >
      {/* Icon if provided */}
      {Icon && (
        <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      )}

      {/* Badge text */}
      <span>{children}</span>

      {/* Close button if handler provided */}
      {onClose && (
        <button
          onClick={handleClose}
          className={`
            ml-1 inline-flex items-center justify-center rounded-full
            transition-all duration-200 hover:opacity-70
            focus:outline-none focus:ring-2 focus:ring-offset-1
            focus:ring-offset-transparent
          `}
          aria-label={`Close ${children} badge`}
          type="button"
        >
          <svg 
            className="w-3 h-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge;
