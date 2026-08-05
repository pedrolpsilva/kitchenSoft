import React from 'react';

/* ─── Typography Atom ─── KDS PedroLPS ──────────────────────────── */

type TypographyVariant =
  | 'display'
  | 'station'
  | 'quantity'
  | 'item'
  | 'modifier'
  | 'timer'
  | 'body'
  | 'caption';

interface TypographyProps {
  variant: TypographyVariant;
  children: React.ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

const variantStyles: Record<TypographyVariant, string> = {
  display: 'font-sans font-black text-5xl text-gray-50',
  station: 'font-sans font-bold text-2xl tracking-wider text-zinc-400 uppercase',
  quantity: 'font-sans font-bold text-xl text-amber-500',
  item: 'font-sans font-normal text-xl text-gray-50 leading-tight',
  modifier: 'font-sans font-medium text-lg',
  timer: 'font-mono font-bold text-3xl',
  body: 'font-sans text-base text-gray-50',
  caption: 'font-sans text-sm text-zinc-400',
};

export const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  className = '',
  as: Tag = 'span',
}) => {
  return (
    <Tag className={`${variantStyles[variant]} ${className}`}>
      {children}
    </Tag>
  );
};
