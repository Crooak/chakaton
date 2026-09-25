import { type ReactNode, type MouseEvent } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  title?: string;
}

const VARIANT_STYLES: Record<Variant, { bg: string; color: string; border: string; hoverBg: string }> = {
  primary: {
    bg: '#1B4E9B',
    color: '#FFFFFF',
    border: 'transparent',
    hoverBg: '#16407F',
  },
  secondary: {
    bg: '#FFFFFF',
    color: '#0F172A',
    border: '#E2E8F0',
    hoverBg: '#F5F7FA',
  },
  ghost: {
    bg: 'transparent',
    color: '#475569',
    border: 'transparent',
    hoverBg: '#F5F7FA',
  },
  danger: {
    bg: '#B42318',
    color: '#FFFFFF',
    border: 'transparent',
    hoverBg: '#9A1E14',
  },
};

const SIZE_STYLES: Record<Size, { height: number; padding: string; fontSize: number }> = {
  sm: { height: 28, padding: '0 10px', fontSize: 12 },
  md: { height: 36, padding: '0 14px', fontSize: 13 },
  lg: { height: 40, padding: '0 18px', fontSize: 14 },
};

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  title,
}: Props) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: s.height,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 500,
        fontFamily: 'inherit',
        color: disabled ? '#94A3B8' : v.color,
        backgroundColor: disabled ? '#F1F5F9' : v.bg,
        border: `1px solid ${disabled ? '#E2E8F0' : v.border}`,
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        transition: 'background-color 120ms ease, opacity 120ms ease',
        outline: 'none',
      }}
      onMouseEnter={e => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = v.hoverBg;
      }}
      onMouseLeave={e => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = v.bg;
      }}
    >
      {children}
    </button>
  );
}
