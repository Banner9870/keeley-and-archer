import styles from './TextInput.module.css';

/**
 * TextInput — styled text input with label and optional error state.
 */
export default function TextInput({
  id,
  label,
  error,
  type = 'text',
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
      <input
        id={id}
        type={type}
        className={[styles.input, error ? styles.inputError : ''].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
