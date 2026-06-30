import { cn, getInitials } from '../../utils/helpers';
import { theme } from '../../theme';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { wh: 36, font: 12 },
  md: { wh: 44, font: 14 },
  lg: { wh: 52, font: 16 },
};

export function Avatar({ name, src, size = 'md', isOnline, className }: AvatarProps) {
  const s = sizeMap[size];

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: s.wh,
            height: s.wh,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2px solid ${theme.colors.navy600}`,
          }}
        />
      ) : (
        <div
          style={{
            width: s.wh,
            height: s.wh,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.accentDark} 100%)`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: s.font,
            border: `2px solid ${theme.colors.navy600}`,
          }}
        >
          {getInitials(name)}
        </div>
      )}
      {isOnline !== undefined && (
        <span
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: isOnline ? theme.colors.success : theme.colors.navy600,
            border: `2px solid ${theme.colors.navy900}`,
          }}
        />
      )}
    </div>
  );
}
