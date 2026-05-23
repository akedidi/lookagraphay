'use client';

type PriceDisplayProps = {
  original: number;
  final?: number;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
  className?: string;
};

const sizes = {
  sm: { main: '1rem', old: '0.82rem' },
  md: { main: '1.15rem', old: '0.95rem' },
  lg: { main: '2rem', old: '1.25rem' },
};

export default function PriceDisplay({
  original,
  final,
  active,
  size = 'md',
  light = false,
  className,
}: PriceDisplayProps) {
  const showPromo = active && final != null && final < original;
  const gold = light ? '#E4C97A' : '#C9A84C';
  const muted = light ? 'rgba(245,240,232,0.55)' : 'rgba(61,43,31,0.45)';
  const s = sizes[size];

  if (!showPromo) {
    return (
      <span
        className={className}
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: s.main,
          fontWeight: 400,
          color: gold,
          lineHeight: 1,
          letterSpacing: '0.02em',
        }}
      >
        {original}
        <span style={{ fontSize: '0.75em', fontWeight: 300 }}> €</span>
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}
    >
      <span
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: s.old,
          color: muted,
          textDecoration: 'line-through',
          fontWeight: 300,
        }}
      >
        {original} €
      </span>
      <span
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: s.main,
          fontWeight: 500,
          color: gold,
          letterSpacing: '0.02em',
        }}
      >
        {final}
        <span style={{ fontSize: '0.75em', fontWeight: 300 }}> €</span>
      </span>
    </span>
  );
}
