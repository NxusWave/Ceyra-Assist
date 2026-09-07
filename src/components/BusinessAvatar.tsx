import React from 'react';

interface BusinessAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]' },
  sm: { container: 'w-7 h-7', text: 'text-[10px]' },
  md: { container: 'w-8 h-8', text: 'text-xs' },
  lg: { container: 'w-9 h-9', text: 'text-xs' },
  xl: { container: 'w-14 h-14', text: 'text-base' },
  '2xl': { container: 'w-20 h-20', text: 'text-xl' },
};

export function getBusinessInitials(name?: string): string {
  if (!name || !name.trim()) return 'MB';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Standardized round avatar for businesses across the entire application.
 * Always renders a round element (rounded-full).
 * Displays uploaded logo/image if available, otherwise falls back to
 * a gradient circle with the business initials.
 */
export default function BusinessAvatar({
  name = 'My Business',
  avatarUrl,
  size = 'md',
  className = '',
}: BusinessAvatarProps) {
  const { container, text } = sizeClasses[size] || sizeClasses.md;
  const initials = getBusinessInitials(name);

  if (avatarUrl) {
    return (
      <div
        className={`${container} rounded-full overflow-hidden border border-white/15 bg-white/5 flex-shrink-0 shadow-inner ${className}`}
      >
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`${container} rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner border border-white/10 flex-shrink-0 ${text} ${className}`}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
}
