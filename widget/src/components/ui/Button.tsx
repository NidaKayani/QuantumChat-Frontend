import { cn } from '../../utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold transition-colors disabled:opacity-50',
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        variant === 'primary' && 'bg-linkedin-blue text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-white text-linkedin-blue border border-linkedin-blue hover:bg-blue-50',
        variant === 'ghost' && 'text-linkedin-muted hover:bg-gray-100',
        variant === 'danger' && 'text-red-600 hover:bg-red-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
