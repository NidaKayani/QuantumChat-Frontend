import logoSrc from '../../assets/logo.png';

interface LogoProps {
  size?: number;
  logoUrl?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Logo({ size = 32, logoUrl, alt = 'Quantum Chat', className, style }: LogoProps) {
  return (
    <img
      src={logoUrl || logoSrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{
        objectFit: 'contain',
        borderRadius: size > 40 ? 12 : 8,
        ...style,
      }}
      draggable={false}
      onError={(e) => {
        if (logoUrl) (e.target as HTMLImageElement).src = logoSrc;
      }}
    />
  );
}
