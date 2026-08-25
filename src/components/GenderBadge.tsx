import React from 'react';
import { Venus, Mars, Infinity } from 'lucide-react';
import { ProductCategory } from '../types';

export interface GenderConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  accentClass: string;
}

export function getGenderConfig(category: ProductCategory | string | undefined): GenderConfig {
  switch (category) {
    case 'Mujer':
      return {
        label: 'Mujer',
        icon: Venus,
        textColor: 'text-[#f472b6]',
        bgColor: 'bg-[#f472b6]/15',
        borderColor: 'border-[#f472b6]/35',
        badgeClass: 'bg-[#f472b6]/15 text-[#f472b6] border border-[#f472b6]/35',
        accentClass: 'text-[#f472b6]',
      };
    case 'Hombre':
      return {
        label: 'Hombre',
        icon: Mars,
        textColor: 'text-[#38bdf8]',
        bgColor: 'bg-[#38bdf8]/15',
        borderColor: 'border-[#38bdf8]/35',
        badgeClass: 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35',
        accentClass: 'text-[#38bdf8]',
      };
    case 'Unisex':
    default:
      return {
        label: 'Unisex',
        icon: Infinity,
        textColor: 'text-[#a78bfa]',
        bgColor: 'bg-[#a78bfa]/15',
        borderColor: 'border-[#a78bfa]/35',
        badgeClass: 'bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/35',
        accentClass: 'text-[#a78bfa]',
      };
  }
}

interface GenderBadgeProps {
  category: ProductCategory | string | undefined;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const GenderBadge: React.FC<GenderBadgeProps> = ({
  category,
  size = 'sm',
  showLabel = true,
  className = '',
}) => {
  const config = getGenderConfig(category);
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-1',
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg shrink-0 ${config.badgeClass} ${sizeClasses[size]} ${className}`}
      title={`Categoría / Género: ${config.label}`}
    >
      <Icon className={`${iconSizes[size]} shrink-0`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

interface GenderIconProps {
  category: ProductCategory | string | undefined;
  className?: string;
  sizeClass?: string;
}

export const GenderIcon: React.FC<GenderIconProps> = ({
  category,
  className = '',
  sizeClass = 'w-3.5 h-3.5',
}) => {
  const config = getGenderConfig(category);
  const Icon = config.icon;

  return (
    <Icon
      className={`${sizeClass} ${config.textColor} ${className} shrink-0`}
      title={`Para ${config.label}`}
    />
  );
};
