// components/Tooltip.js
import { useState } from 'react';

/**
 * Tooltip Component
 * Displays helpful information on hover or focus
 * 
 * @param {React.ReactNode} children - Trigger element
 * @param {string} content - Tooltip text content
 * @param {string} position - Position (top, bottom, left, right)
 * @param {string} theme - Theme (dark, light)
 * @param {string} className - Additional CSS classes
 */
const Tooltip = ({
  children,
  content,
  position = 'top',
  theme = 'dark',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position_state, setPositionState] = useState(position);

  // Position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  // Theme classes
  const themeClasses = {
    dark: 'bg-slate-900 dark:bg-slate-800 text-white',
    light: 'bg-white dark:bg-slate-100 text-slate-900 border border-slate-200 dark:border-slate-300'
  };

  // Arrow classes based on position
  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-slate-900 dark:border-t-slate-800',
    bottom: 'top-[-4px] left-1/2 transform -translate-x-1/2 border-8 border-transparent border-b-slate-900 dark:border-b-slate-800',
    left: 'right-[-4px] top-1/2 transform -translate-y-1/2 border-8 border-transparent border-l-slate-900 dark:border-l-slate-800',
    right: 'left-[-4px] top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-slate-900 dark:border-r-slate-800'
  };

  return (
    <div className={`relative inline-block group ${className}`}>
      {/* Trigger element */}
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          className={`
            absolute ${positionClasses[position_state]}
            px-3 py-2 rounded-lg text-sm font-medium
            whitespace-nowrap z-50 pointer-events-none
            animate-slideInUp
            ${themeClasses[theme]}
            shadow-lg
          `}
          role="tooltip"
        >
          {content}
          <div className={`absolute ${arrowClasses[position_state]}`} />
        </div>
      )}
    </div>
  );
};

/**
 * TooltipWithIcon Component
 * Tooltip with info icon
 */
export const TooltipWithIcon = ({
  content,
  position = 'top',
  ariaLabel = 'More information'
}) => (
  <Tooltip content={content} position={position}>
    <button
      type="button"
      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
      aria-label={ariaLabel}
    >
      <svg
        className="w-3 h-3"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    </button>
  </Tooltip>
);

export default Tooltip;
