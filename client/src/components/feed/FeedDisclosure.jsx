import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import styles from './FeedDisclosure.module.css';

/**
 * FeedDisclosure — "How your feed is ordered" link + modal.
 * Modal copy is dynamic — reflects user's actual current selections.
 */
export default function FeedDisclosure() {
  const { state } = useAppContext();
  const [open, setOpen] = useState(false);
  const modalRef = useRef(null);

  const { selectedNeighborhoods, selectedCategories } = state.feedPreferences;

  function openModal() { setOpen(true); }
  function closeModal() { setOpen(false); }

  function handleChangeSettings() {
    closeModal();
    // Scroll to the sidebar filter panel
    setTimeout(() => {
      const el = document.getElementById('neighborhood-filter');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') closeModal();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const neighborhoodText = selectedNeighborhoods.length > 0
    ? selectedNeighborhoods.join(', ')
    : 'no neighborhoods selected';

  const categoryText = selectedCategories.length > 0
    ? selectedCategories.join(', ')
    : 'no categories selected';

  return (
    <>
      <button className={styles.trigger} onClick={openModal} aria-expanded={open}>
        ⓘ How your feed is ordered
      </button>

      {open && (
        <div className={styles.overlay} onClick={closeModal} role="dialog" aria-modal="true" aria-label="Feed ordering explanation">
          <div
            className={styles.modal}
            ref={modalRef}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>How your feed is ordered</h2>
              <button className={styles.closeBtn} onClick={closeModal} aria-label="Close">✕</button>
            </div>

            <p className={styles.body}>
              Your feed is showing content from{' '}
              <strong>{neighborhoodText}</strong>{' '}
              and matching{' '}
              <strong>{categoryText}</strong>.{' '}
              Editor's Picks always appear first.
            </p>

            <div className={styles.orderList}>
              <div className={styles.orderItem}>
                <span className={styles.orderNum}>1</span>
                <div>
                  <strong>Editor's Picks</strong>
                  <p>Guides hand-selected by the chicago.com team — always at the top.</p>
                </div>
              </div>
              <div className={styles.orderItem}>
                <span className={styles.orderNum}>2</span>
                <div>
                  <strong>Your Neighborhoods</strong>
                  <p>Most recent content tagged to your selected neighborhoods.</p>
                </div>
              </div>
              <div className={styles.orderItem}>
                <span className={styles.orderNum}>3</span>
                <div>
                  <strong>Your Categories</strong>
                  <p>Guides and articles matching your selected interest categories.</p>
                </div>
              </div>
            </div>

            <p className={styles.noAlgo}>
              No algorithm. No engagement optimization. Just your neighborhoods and interests.
            </p>

            <button className={styles.changeBtn} onClick={handleChangeSettings}>
              Change your settings →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
