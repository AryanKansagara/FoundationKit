import { forwardRef, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

/** Native button semantics preserve keyboard activation and disabled behavior. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading = false, disabled, className = '', type = 'button', children, ...props }, ref,
) {
  return <button {...props} ref={ref} type={type} disabled={disabled || loading}
    aria-busy={loading || undefined} className={`fk-button fk-button--${variant} ${className}`}>
    {children}{loading && <span aria-hidden="true"> …</span>}
  </button>;
});

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> & {
  label: string;
  help?: string;
  error?: string;
};

/** Generated IDs support repeated instances without label/description collisions. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, help, error, id, className = '', 'aria-describedby': describedBy, ...props }, ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptions = [describedBy, help && `${inputId}-help`, error && `${inputId}-error`]
    .filter(Boolean).join(' ') || undefined;
  return <div className="fk-field">
    <label htmlFor={inputId}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>
    {help && <p id={`${inputId}-help`} className="fk-help">{help}</p>}
    <input {...props} ref={ref} id={inputId} aria-invalid={error ? true : props['aria-invalid']}
      aria-describedby={descriptions} className={`fk-input ${className}`} />
    {error && <p id={`${inputId}-error`} className="fk-error">{error}</p>}
  </div>;
});

export function Notice({ tone = 'info', children }: {
  tone?: 'info' | 'error'; children: ReactNode;
}) {
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`fk-notice fk-notice--${tone}`}>
    {children}
  </div>;
}

/** Example composition: consumers own validation, requests and secret handling. */
export function AccessRequestForm({ onRequest }: { onRequest: (email: string) => void }) {
  return <form onSubmit={event => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onRequest(String(formData.get('email') ?? ''));
  }}>
    <TextField name="email" label="Work email" type="email" autoComplete="email" required
      help="Use the address associated with your team." />
    <Button type="submit">Request access</Button>
  </form>;
}
