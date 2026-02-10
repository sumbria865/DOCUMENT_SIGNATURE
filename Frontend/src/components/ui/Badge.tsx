import clsx from 'clsx';

interface BadgeProps {
  status: 'PENDING' | 'SIGNED' | 'REJECTED' | 'PARTIALLY_SIGNED';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = ({ status, size = 'md' }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const variants = {
    PENDING: 'bg-warning-50 text-warning-700 ring-1 ring-warning-600/20',
    PARTIALLY_SIGNED: 'bg-primary-50 text-primary-700 ring-1 ring-primary-600/20',
    SIGNED: 'bg-success-50 text-success-700 ring-1 ring-success-600/20',
    REJECTED: 'bg-danger-50 text-danger-700 ring-1 ring-danger-600/20',
  };

  const labels = {
    PENDING: 'Pending',
    PARTIALLY_SIGNED: 'Partially Signed',
    SIGNED: 'Signed',
    REJECTED: 'Rejected',
  };

  return (
    <span className={clsx(baseStyles, sizes[size], variants[status])}>
      <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', {
        'bg-warning-600': status === 'PENDING',
        'bg-primary-600': status === 'PARTIALLY_SIGNED',
        'bg-success-600': status === 'SIGNED',
        'bg-danger-600': status === 'REJECTED',
      })} />
      {labels[status]}
    </span>
  );
};