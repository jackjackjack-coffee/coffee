import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn bg-rose-600 text-white hover:bg-rose-700',
};

export function Button({ variant = 'primary', className, type = 'button', ...rest }: Props) {
  return <button type={type} className={cn(VARIANT[variant], className)} {...rest} />;
}
