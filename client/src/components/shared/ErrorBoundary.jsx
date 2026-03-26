import { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './ErrorBoundary.module.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <p className={styles.heading}>Something went wrong</p>
          <p className={styles.body}>
            An unexpected error occurred.
          </p>
          <Link to="/feed" className={styles.link}>
            ← Go back to the feed
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
