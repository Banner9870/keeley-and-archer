import styles from './Textarea.module.css';

/**
 * Textarea — styled textarea with label, character counter, and optional error state.
 */
export default function Textarea({
  id,
  label,
  maxLength,
  error,
  value = '',
  className,
  ...props
}) {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        maxLength={maxLength}
        value={value}
        className={[styles.textarea, error ? styles.textareaError : ''].filter(Boolean).join(' ')}
        {...props}
      />
      <div className={styles.footer}>
        {error && <p className={styles.error}>{error}</p>}
        {maxLength != null && (
          <p className={styles.counter}>
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
