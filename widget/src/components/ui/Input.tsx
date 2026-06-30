import { cn } from '../../utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ icon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: '#64748B' }}
        >
          {icon}
        </span>
      )}
      <input
        className={cn('qc-search-input w-full rounded-xl py-2.5 text-sm', icon ? 'pl-10 pr-4' : 'px-4', className)}
        {...props}
      />
    </div>
  );
}
