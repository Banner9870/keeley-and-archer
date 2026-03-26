import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/shared/ErrorBoundary';

import FeedPage from './pages/FeedPage';
import ExplorePage from './pages/ExplorePage';
import GuideCreatePage from './pages/GuideCreatePage';
import GuideDetailPage from './pages/GuideDetailPage';
import GuideRemixPage from './pages/GuideRemixPage';
import NeighborhoodPage from './pages/NeighborhoodPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const { dispatch } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Task 2.10 — ?reset=true session reset
  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      dispatch({ type: 'RESET_SESSION' });
      // Remove the param from the URL without adding to browser history
      setSearchParams(prev => {
        prev.delete('reset');
        return prev;
      }, { replace: true });
    }
  }, [searchParams, dispatch, setSearchParams]);

  // Task 2.11 — Shift+R held 2 seconds keyboard shortcut
  useEffect(() => {
    let timer = null;

    function handleKeyDown(e) {
      if (e.key === 'R' && e.shiftKey && !timer) {
        timer = setTimeout(() => {
          dispatch({ type: 'RESET_SESSION' });
          timer = null;
        }, 2000);
      }
    }

    function handleKeyUp(e) {
      if (e.key === 'R' || e.key === 'Shift') {
        clearTimeout(timer);
        timer = null;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      clearTimeout(timer);
    };
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Layout>
        {/* Route order matters — /guide/new must be before /guide/:id */}
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/guide/new" element={<GuideCreatePage />} />
          <Route path="/guide/:id" element={<GuideDetailPage />} />
          <Route path="/guide/:id/remix" element={<GuideRemixPage />} />
          <Route path="/neighborhood/:slug" element={<NeighborhoodPage />} />
          <Route path="/profile/:handle" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}
