import { useApp, Grade } from '../context/AppContext';
import { ReactElement } from 'react';

interface GradeBadgeProps {
  grade: Grade;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function GradeBadge({ grade, size = 'md', showLabel = true }: GradeBadgeProps) {
  const { getGradeInfo } = useApp();
  const info = getGradeInfo(grade);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClasses[size]}`}
      style={{ backgroundColor: info.bg, color: info.color }}
    >
      <span>{info.emoji}</span>
      {showLabel && <span>{info.label}</span>}
    </span>
  );
}

interface GradeIconProps {
  grade: Grade;
  size?: number;
}

export function GradeIcon({ grade, size = 48 }: GradeIconProps) {
  const { getGradeInfo } = useApp();
  const info = getGradeInfo(grade);

  const icons: Record<Grade, ReactElement> = {
    '별': (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill={info.bg} stroke={info.color} strokeWidth="2" />
        {/* Star shape */}
        <path
          d="M24 10 L26.5 19 L36 19 L28.8 24.5 L31.3 33.5 L24 28 L16.7 33.5 L19.2 24.5 L12 19 L21.5 19 Z"
          fill={info.color}
          opacity="0.85"
        />
      </svg>
    ),
    '행성': (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill={info.bg} stroke={info.color} strokeWidth="2" />
        {/* Planet body */}
        <circle cx="24" cy="24" r="9" fill={info.color} />
        <circle cx="24" cy="24" r="9" fill="url(#planetShine)" opacity="0.4" />
        {/* Ring */}
        <ellipse cx="24" cy="24" rx="16" ry="5" stroke={info.color} strokeWidth="2" fill="none" opacity="0.7" />
        <defs>
          <radialGradient id="planetShine" cx="35%" cy="35%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    ),
    '로켓': (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill={info.bg} stroke={info.color} strokeWidth="2" />
        {/* Rocket body */}
        <path d="M24 10 C20 14 19 19 19 24 L29 24 C29 19 28 14 24 10Z" fill={info.color} />
        {/* Rocket nose */}
        <path d="M24 10 C22 10 21 12 21 14 L27 14 C27 12 26 10 24 10Z" fill={info.color} opacity="0.7" />
        {/* Rocket window */}
        <circle cx="24" cy="21" r="2.5" fill="white" opacity="0.7" />
        {/* Rocket fins */}
        <path d="M19 24 L15 30 L19 28Z" fill={info.color} opacity="0.8" />
        <path d="M29 24 L33 30 L29 28Z" fill={info.color} opacity="0.8" />
        {/* Rocket flame */}
        <path d="M21 28 C22 33 24 35 24 35 C24 35 26 33 27 28Z" fill="#F5C518" opacity="0.9" />
        <path d="M22 28 C23 31 24 33 24 33 C24 33 25 31 26 28Z" fill="#FF6B35" opacity="0.8" />
      </svg>
    ),
    'UFO': (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="#FFF8E1" stroke="#F5C518" strokeWidth="2" />
        {/* UFO dome */}
        <ellipse cx="24" cy="21" rx="8" ry="6" fill="#F5C518" opacity="0.8" />
        <ellipse cx="24" cy="21" rx="5" ry="4" fill="#FFE566" opacity="0.6" />
        {/* UFO body */}
        <ellipse cx="24" cy="26" rx="13" ry="4" fill="#F5C518" />
        {/* UFO lights */}
        <circle cx="17" cy="26" r="2" fill="white" opacity="0.9" />
        <circle cx="24" cy="27" r="2" fill="white" opacity="0.9" />
        <circle cx="31" cy="26" r="2" fill="white" opacity="0.9" />
        {/* Sparkles */}
        <circle cx="10" cy="12" r="1.5" fill="#F5C518" opacity="0.7" />
        <circle cx="38" cy="14" r="1" fill="#F5C518" opacity="0.8" />
        <circle cx="8" cy="34" r="1" fill="#F5C518" opacity="0.6" />
        <circle cx="40" cy="32" r="1.5" fill="#F5C518" opacity="0.7" />
        <path d="M6 22 L7.5 24 L9 22 L7.5 20 Z" fill="#F5C518" opacity="0.6" />
        <path d="M39 28 L40.5 30 L42 28 L40.5 26 Z" fill="#F5C518" opacity="0.6" />
      </svg>
    ),
  };

  return icons[grade];
}
