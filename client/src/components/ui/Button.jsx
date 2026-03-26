import styles from './Button.module.css';

/**
 * Button — primary (red), secondary (outlined), and ghost variants.
 * @param {'primary'|'secondary'|'ghost'} variant
 */
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  className,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
