import styles from './Select.module.css';

/**
 * Select — styled dropdown for neighborhood selector and similar.
 * @param {{ value: string, label: string }[]} options
 */
export default function Select({
  id,
  label,
  options = [],
  error,
  placeholder,
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
      <div className={styles.selectWrapper}>
        <select
          id={id}
          className={[styles.select, error ? styles.selectError : ''].filter(Boolean).join(' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.arrow} aria-hidden="true">▾</span>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
