import React from 'react';
import { trackButtonClick } from '@/lib/analytics';

/* --- ButtonKDS Atom --- KDS PedroLPS ----------------------------- */

type ButtonVariant = 'primary' | 'amber' | 'danger';

interface ButtonKDSProps {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-500 text-black ',
  amber: 'bg-amber-500 text-black ',
  danger: 'bg-red-600 text-gray-50 ',
};

export const ButtonKDS: React.FC<ButtonKDSProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const handleClick = () => {
    trackButtonClick(label, 'button_kds', { variant });
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full h-16 min-h-[64px] rounded font-sans font-bold text-lg
        select-none transition-all duration-75
        active:scale-[0.97] active:opacity-80
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {label}
    </button>
  );
};



