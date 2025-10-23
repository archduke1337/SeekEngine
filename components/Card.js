// components/Card.js
import { useState } from 'react';

/**
 * Card Component
 * A versatile container component with optional hover effects and animations
 * 
 * @param {React.ReactNode} children - Card content
 * @param {boolean} hoverable - Enable hover effects
 * @param {boolean} interactive - Enable interactive styles (cursor pointer)
 * @param {boolean} animated - Enable entrance animation
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Optional click handler
 * @param {string} padding - Padding size (sm, md, lg, none)
 * @param {boolean} clickable - Make card clickable
 */
const Card = ({ 
  children, 
  hoverable = true,
  interactive = false,
  animated = true,
  className = '',
  onClick = null,
  padding = 'md',
  clickable = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Padding variants
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    none: 'p-0'
  };

  const isPadding = padding in paddingClasses ? paddingClasses[padding] : paddingClasses.md;

  // Determine classes
  const baseClasses = `
    bg-[var(--surface)] rounded-lg border border-[var(--border)]
    transition-all duration-300 transform
    ${isPadding}
    ${animated ? 'animate-slideInUp' : ''}
    ${hoverable && 'hover:border-[var(--border-medium)] hover:shadow-lg hover:scale-[1.02]'}
    ${interactive && 'cursor-pointer'}
    ${clickable && 'hover:shadow-xl hover:scale-105 cursor-pointer'}
    ${isHovered && hoverable ? 'shadow-lg' : 'shadow-sm'}
    ${className}
  `;

  const handleHover = (state) => {
    if (hoverable) {
      setIsHovered(state);
    }
  };

  return (
    <div
      className={baseClasses}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

/**
 * CardHeader Component
 * Header section for cards with title and optional action
 */
export const CardHeader = ({ 
  title, 
  subtitle = null, 
  action = null,
  className = ''
}) => (
  <div className={`flex items-start justify-between gap-4 pb-4 border-b border-[var(--border)] ${className}`}>
    <div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

/**
 * CardBody Component
 * Main content section for cards
 */
export const CardBody = ({ children, className = '' }) => (
  <div className={`py-4 ${className}`}>
    {children}
  </div>
);

/**
 * CardFooter Component
 * Footer section for cards with actions
 */
export const CardFooter = ({ children, className = '' }) => (
  <div className={`flex items-center justify-end gap-2 pt-4 border-t border-[var(--border)] ${className}`}>
    {children}
  </div>
);

export default Card;
