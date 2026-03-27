// RemixBanner.jsx — persistent strip shown throughout the remix flow
// Displays: "Remixing '[title]' by @handle"

import styles from './RemixBanner.module.css';

function getAuthorHandle(author) {
  if (!author) return null;
  if (author.isJournalist) {
    const domain = author.publication === 'WBEZ' ? 'wbez.org' : 'suntimes.com';
    return `@${author.handle}.${domain}`;
  }
  return `@${author.handle}.chicago.com`;
}

export default function RemixBanner({ originalGuide, originalAuthor }) {
  if (!originalGuide) return null;
  const handle = getAuthorHandle(originalAuthor);

  return (
    <div className={styles.banner} role="status">
      <span className={styles.icon} aria-hidden="true">✦</span>
      <span className={styles.text}>
        Remixing <strong>"{originalGuide.title}"</strong>
        {handle && <span className={styles.author}> by {handle}</span>}
      </span>
    </div>
  );
}
