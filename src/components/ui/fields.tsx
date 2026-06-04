import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { parseNumber } from '../../lib/format';

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      {label && <span className="label">{label}</span>}
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-coffee-500">{hint}</span>
      )}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  error?: string;
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <input
        className="input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

/** Numeric input with a local text buffer so partial edits feel natural. */
export function NumberInput({
  value,
  onChange,
  min = 0,
  step,
  placeholder,
  suffix,
  className,
}: {
  value: number | undefined;
  onChange: (v: number | null) => void;
  min?: number;
  step?: number;
  placeholder?: string;
  suffix?: string;
  className?: string;
}) {
  const [text, setText] = useState(value === undefined || Number.isNaN(value) ? '' : String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value === undefined || Number.isNaN(value) ? '' : String(value));
  }, [value, focused]);

  return (
    <div className={cn('relative', className)}>
      <input
        className={cn('input', suffix && 'pr-10')}
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setText(e.target.value);
          const n = parseNumber(e.target.value);
          if (n === null) onChange(null);
          else onChange(min !== undefined && n < min ? min : n);
        }}
        min={min}
        step={step}
        type="number"
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-coffee-500">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  step,
  suffix,
  hint,
  error,
  placeholder,
}: {
  label?: string;
  value: number | undefined;
  onChange: (v: number | null) => void;
  min?: number;
  step?: number;
  suffix?: string;
  hint?: ReactNode;
  error?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <NumberInput
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        suffix={suffix}
        placeholder={placeholder}
      />
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
  className,
}: {
  label?: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
