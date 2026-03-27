import StarIcon from '../shared/StarIcon';
import styles from './ProfileHeader.module.css';

export default function ProfileHeader({ user }) {
  const fullHandle = user.isJournalist
    ? `@${user.handle}.${user.publication === 'WBEZ' ? 'wbez.org' : 'suntimes.com'}`
    : `@${user.handle}.chicago.com`;

  return (
    <div className={styles.header}>
      <div className={styles.avatarCol}>
        <div className={styles.avatar} aria-hidden="true">
          {user.displayName[0]}
        </div>
      </div>

      <div className={styles.info}>
        {user.isJournalist && (
          <div className={styles.newsroomBadge}>
            <StarIcon size={12} color="var(--red)" />
            <span>From the newsroom · {user.publication}</span>
          </div>
        )}
        <h1 className={styles.displayName}>{user.displayName}</h1>
        <p className={styles.handle}>{fullHandle}</p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>📍 {user.neighborhood}</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaItem}>{user.yearsInChicago} years in Chicago</span>
        </div>

        <div className={styles.badges}>
          {user.badges.map(badge => (
            <span key={badge} className={styles.badge}>{badge}</span>
          ))}
        </div>
      </div>

      <button
        className={styles.followBtn}
        onClick={() => {}}
        aria-label={`Follow ${user.displayName}`}
      >
        Follow
      </button>
    </div>
  );
}
