import styles from './Toggle.module.css';

/**
 * Toggle — Public/Private privacy switch.
 * Displays two labeled options; the active one is highlighted.
 */
export default function Toggle({
  id,
  label,
  options = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
  ],
  value,
  onChange,
  className,
}) {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.toggle} role="group" aria-label={label}>
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={[styles.option, value === opt.value ? styles.active : ''].filter(Boolean).join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
