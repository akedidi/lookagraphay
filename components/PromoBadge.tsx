type PromoBadgeProps = {
  label?: string | null;
  light?: boolean;
};

export default function PromoBadge({ label, light = false }: PromoBadgeProps) {
  const text = label?.trim() || 'Promo';
  return (
    <span
      style={{
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '0.58rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: light ? '#1A1209' : '#F5F0E8',
        background: '#C9A84C',
        padding: '0.2rem 0.45rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}
