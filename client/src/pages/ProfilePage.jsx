import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import GuideCard from '../components/cards/GuideCard';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { handle } = useParams();
  const [searchParams] = useSearchParams();
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'guides');

  const user = state.users.find(u => u.handle === handle);

  if (!user) {
    return (
      <div className={styles.notFound}>
        <p>User not found.</p>
        <Link to="/feed" className={styles.backLink}>← Back to feed</Link>
      </div>
    );
  }

  const userGuides = state.guides.filter(g => g.authorId === user.id && !g.remixOf);
  const userRemixes = state.guides.filter(g => g.authorId === user.id && g.remixOf);
  const savedGuides = state.guides.filter(g => state.savedIds.has(g.id));

  const tabGuides = {
    guides: userGuides,
    remixes: userRemixes,
    saved: savedGuides,
  }[activeTab] || [];

  const counts = {
    guides: userGuides.length,
    remixes: userRemixes.length,
    saved: savedGuides.length,
  };

  function emptyMessage() {
    if (activeTab === 'saved') {
      return 'No saved guides yet. Click ☆ Save on any guide card to save it here.';
    }
    if (activeTab === 'remixes') {
      return `${user.displayName} hasn't remixed any guides yet.`;
    }
    return `${user.displayName} hasn't created any guides yet.`;
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <ProfileHeader user={user} />
        <ProfileTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />

        <div
          className={styles.grid}
          role="tabpanel"
          aria-label={activeTab}
        >
          {tabGuides.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyMsg}>{emptyMessage()}</p>
              {activeTab !== 'saved' && (
                <Link to="/guide/new" className={styles.createLink}>+ Create a guide</Link>
              )}
            </div>
          ) : (
            tabGuides.map(guide => (
              <GuideCard key={guide.id} guide={guide} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
