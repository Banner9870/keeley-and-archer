import styles from './NeighborhoodTag.module.css';
import { Link } from 'react-router-dom';

/**
 * NeighborhoodTag — blue pill for neighborhood labels.
 * Renders as a link if `href` is provided, otherwise a plain span.
 */
export default function NeighborhoodTag({ name, href, className }) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const linkHref = href || `/neighborhood/${slug}`;

  return (
    <Link to={linkHref} className={[styles.tag, className].filter(Boolean).join(' ')}>
      {name}
    </Link>
  );
}
