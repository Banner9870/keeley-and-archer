import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Chicago flag stripe decoration — two blue horizontal bars */}
      <div className={styles.stripe} aria-hidden="true" />
      <div className={styles.stripe} aria-hidden="true" />

      <div className={styles.inner}>
        <nav className={styles.links} aria-label="Footer navigation">
          <a href="#" className={styles.link}>About chicago.com</a>
          <a href="#" className={styles.link}>How guides work</a>
          <a href="#" className={styles.link}>How the feed is ordered</a>
          <a
            href="https://www.chicagopublicmedia.org"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Chicago Public Media
          </a>
        </nav>
        <p className={styles.tagline}>Made in Chicago, for Chicago.</p>
      </div>
    </footer>
  );
}
