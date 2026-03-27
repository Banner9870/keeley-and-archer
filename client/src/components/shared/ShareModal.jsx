import { useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import styles from './ShareModal.module.css';

/**
 * ShareModal — mock share sheet with copyable URL.
 * Reads shareModalOpen / shareModalUrl from AppContext.
 * Dispatches CLOSE_SHARE_MODAL on close.
 */
export default function ShareModal() {
  const { state, dispatch } = useAppContext();
  const { shareModalOpen, shareModalUrl } = state;
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  function close() {
    dispatch({ type: 'CLOSE_SHARE_MODAL' });
  }

  function handleCopy() {
    if (inputRef.current) {
      inputRef.current.select();
      navigator.clipboard.writeText(shareModalUrl).catch(() => {
        document.execCommand('copy');
      });
    }
  }

  // Close on Escape
  useEffect(() => {
    if (!shareModalOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shareModalOpen]);

  // Focus trap: focus the input when opened
  useEffect(() => {
    if (shareModalOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [shareModalOpen]);

  if (!shareModalOpen) return null;

  return (
    <div className={styles.overlay} onClick={close} role="dialog" aria-modal="true" aria-label="Share">
      <div
        className={styles.modal}
        ref={modalRef}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Share this guide</h2>
          <button className={styles.closeBtn} onClick={close} aria-label="Close share modal">
            ✕
          </button>
        </div>
        <p className={styles.description}>Copy the link below to share with friends.</p>
        <div className={styles.copyRow}>
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={shareModalUrl}
            className={styles.urlInput}
            aria-label="Shareable URL"
          />
          <button className={styles.copyBtn} onClick={handleCopy}>
            Copy
          </button>
        </div>
        <div className={styles.socialRow}>
          <span className={styles.socialLabel}>Also share via:</span>
          <button className={styles.socialBtn} onClick={close}>Twitter/X</button>
          <button className={styles.socialBtn} onClick={close}>Facebook</button>
          <button className={styles.socialBtn} onClick={close}>Email</button>
        </div>
      </div>
    </div>
  );
}
