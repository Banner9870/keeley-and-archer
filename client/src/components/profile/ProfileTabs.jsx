import styles from './ProfileTabs.module.css';

const TABS = [
  { id: 'guides', label: 'Guides' },
  { id: 'remixes', label: 'Remixes' },
  { id: 'saved', label: 'Saved' },
];

export default function ProfileTabs({ activeTab, onChange, counts }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Profile sections">
      {TABS.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {counts[tab.id] > 0 && (
            <span className={styles.count}>{counts[tab.id]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
