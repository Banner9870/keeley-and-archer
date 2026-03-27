// ============================================================
// GuideCreatePage.jsx — /guide/new
// Multi-step guide creation flow:
//   Step 1: basics (title, description, neighborhood, categories, privacy, photo)
//   Step 2: add places, reorder, editor notes
// On save: dispatches ADD_GUIDE → navigates to /guide/:id?created=true
// ============================================================

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { usePlacesSearch } from '../hooks/usePlacesSearch';
import fallbackTabular from '../data/neighborhoods-fallback.json';
import TextInput from '../components/ui/TextInput';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Toggle from '../components/ui/Toggle';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PhotoPicker from '../components/guide/PhotoPicker';
import PlaceSearchResult from '../components/guide/PlaceSearchResult';
import AddedPlaceRow from '../components/guide/AddedPlaceRow';
import styles from './GuideCreatePage.module.css';

// Build the sorted neighborhood list directly from the bundled static JSON.
// No API call, no loading state — the JSON is already in the JS bundle.
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

const NEIGHBORHOOD_OPTIONS = fallbackTabular
  .map(row => ({ value: toTitleCase(row.community), label: toTitleCase(row.community) }))
  .sort((a, b) => a.label.localeCompare(b.label));

const CATEGORIES = [
  'Food & Drink',
  'Coffee',
  'Live Music',
  'Parks',
  'Culture',
  'History',
  'Sports',
  'Nightlife',
  'Family',
  'Shopping',
];

const EMPTY_STEP1 = {
  title: '',
  description: '',
  neighborhood: '',
  categories: [],
  privacy: 'public',
  coverImage: null,
};

export default function GuideCreatePage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_STEP1);
  const [titleError, setTitleError] = useState('');
  const [neighborhoodError, setNeighborhoodError] = useState('');

  const [addedPlaces, setAddedPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [placesError, setPlacesError] = useState(''); // min-1 validation message
  const { results, loading: searchLoading, error: searchError, search, clear } = usePlacesSearch();

  // ── Step 1 handlers ────────────────────────────────────────

  function handleTitleChange(e) {
    setForm(f => ({ ...f, title: e.target.value }));
    if (titleError) setTitleError('');
  }

  function handleDescriptionChange(e) {
    setForm(f => ({ ...f, description: e.target.value }));
  }

  function handleNeighborhoodChange(e) {
    setForm(f => ({ ...f, neighborhood: e.target.value }));
    if (neighborhoodError) setNeighborhoodError('');
  }

  function handleCategoryToggle(cat) {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }));
  }

  function handlePrivacyChange(val) {
    setForm(f => ({ ...f, privacy: val }));
  }

  function handlePhotoSelect(url) {
    setForm(f => ({ ...f, coverImage: url }));
  }

  function handleContinue() {
    let valid = true;
    if (!form.title.trim()) {
      setTitleError('A title is required.');
      valid = false;
    }
    if (!form.neighborhood) {
      setNeighborhoodError('Please choose a neighborhood.');
      valid = false;
    }
    if (valid) setStep(2);
  }

  // ── Step 2 handlers ────────────────────────────────────────

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) search(searchQuery.trim());
    },
    [searchQuery, search]
  );

  function handleSearchInputChange(e) {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) clear();
  }

  function handleAddPlace(place) {
    setAddedPlaces(prev => [...prev, { ...place, editorNote: '' }]);
    if (placesError) setPlacesError('');
  }

  function handleRemovePlace(id) {
    setAddedPlaces(prev => prev.filter(p => p.id !== id));
  }

  function handleNoteChange(id, note) {
    setAddedPlaces(prev =>
      prev.map(p => (p.id === id ? { ...p, editorNote: note } : p))
    );
  }

  function handleMoveUp(index) {
    if (index === 0) return;
    setAddedPlaces(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function handleMoveDown(index) {
    setAddedPlaces(prev => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function handleSave() {
    if (addedPlaces.length === 0) {
      setPlacesError('Add at least one place to save your guide.');
      return;
    }

    const id = `guide-session-${Date.now()}`;
    const guide = {
      id,
      title: form.title.trim(),
      description: form.description.trim(),
      authorId: state.currentUser.id,
      neighborhood: form.neighborhood,
      categories: form.categories,
      places: addedPlaces,
      coverImage: form.coverImage,
      likeCount: 0,
      remixCount: 0,
      remixOf: null,
      isEditorsPick: false,
      isSessionCreated: true,
      createdAt: new Date().toISOString(),
      privacy: form.privacy,
    };

    dispatch({ type: 'ADD_GUIDE', payload: { guide } });
    navigate(`/guide/${id}?created=true`);
  }


  const addedIds = new Set(addedPlaces.map(p => p.id));

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {/* Step indicator */}
      <div className={styles.stepBar}>
        <div className={`${styles.stepItem} ${step >= 1 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>1</span>
          <span className={styles.stepLabel}>Guide basics</span>
        </div>
        <div className={styles.stepDivider} aria-hidden="true" />
        <div className={`${styles.stepItem} ${step >= 2 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>2</span>
          <span className={styles.stepLabel}>Add places</span>
        </div>
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div className={styles.stepContent}>
          <h1 className={styles.pageTitle}>Create a guide</h1>

          <div className={styles.formSection}>
            <TextInput
              id="guide-title"
              label="Title *"
              value={form.title}
              onChange={handleTitleChange}
              placeholder="e.g. Best taco spots in Pilsen"
              error={titleError}
              maxLength={80}
            />

            <Textarea
              id="guide-description"
              label="Description"
              value={form.description}
              onChange={handleDescriptionChange}
              placeholder="What's this guide about? Give readers a reason to explore it."
              maxLength={280}
              rows={3}
            />

            <Select
              id="guide-neighborhood"
              label="Neighborhood *"
              value={form.neighborhood}
              onChange={handleNeighborhoodChange}
              options={NEIGHBORHOOD_OPTIONS}
              placeholder="Choose a neighborhood"
              error={neighborhoodError}
            />

            {/* Category multi-select */}
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Categories</span>
              <div className={styles.categoryChips}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={[
                      styles.chip,
                      form.categories.includes(cat) ? styles.chipActive : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleCategoryToggle(cat)}
                    aria-pressed={form.categories.includes(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy toggle */}
            <Toggle
              id="guide-privacy"
              label="Visibility"
              value={form.privacy}
              onChange={handlePrivacyChange}
            />

            {/* Photo picker */}
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Cover photo</span>
              <PhotoPicker
                selectedUrl={form.coverImage}
                onSelect={handlePhotoSelect}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" onClick={handleContinue}>
              Continue to places →
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <div className={styles.stepContent}>
          <button
            type="button"
            className={styles.backLink}
            onClick={() => setStep(1)}
          >
            ← Back to guide basics
          </button>

          <h1 className={styles.pageTitle}>Add places to "{form.title}"</h1>

          <div className={styles.step2Layout}>
            {/* Left: search panel */}
            <div className={styles.searchPanel}>
              <h2 className={styles.panelHeading}>Search for places</h2>

              <form onSubmit={handleSearch} className={styles.searchForm}>
                <TextInput
                  id="place-search"
                  label=""
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Search for a place in Chicago…"
                />
                <Button type="submit" variant="primary" disabled={searchLoading || !searchQuery.trim()}>
                  Search
                </Button>
              </form>

              {/* Search states */}
              {searchLoading && (
                <div className={styles.searchLoading}>
                  <Spinner size={20} />
                  <span>Searching…</span>
                </div>
              )}

              {searchError && !searchLoading && (
                <p className={styles.searchError}>{searchError}</p>
              )}

              {!searchLoading && results.length > 0 && (
                <div className={styles.resultsList}>
                  {results.map(place => (
                    <PlaceSearchResult
                      key={place.id}
                      place={place}
                      onAdd={handleAddPlace}
                      alreadyAdded={addedIds.has(place.id)}
                    />
                  ))}
                </div>
              )}

              {!searchLoading && !searchError && results.length === 0 && searchQuery.trim() && (
                <p className={styles.noResults}>No results yet — try searching above.</p>
              )}
            </div>

            {/* Right: your guide panel */}
            <div className={styles.guidePanel}>
              <h2 className={styles.panelHeading}>
                Your guide
                {addedPlaces.length > 0 && (
                  <span className={styles.placeCount}>{addedPlaces.length}</span>
                )}
              </h2>

              {addedPlaces.length === 0 ? (
                <div className={styles.emptyGuide}>
                  <p>Search for places and add them here.</p>
                </div>
              ) : (
                <div className={styles.addedList}>
                  {addedPlaces.map((place, i) => (
                    <AddedPlaceRow
                      key={place.id}
                      place={place}
                      index={i}
                      totalCount={addedPlaces.length}
                      onRemove={handleRemovePlace}
                      onNoteChange={handleNoteChange}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                    />
                  ))}
                </div>
              )}

              {placesError && (
                <p className={styles.placesError}>{placesError}</p>
              )}

              <div className={styles.saveActions}>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={addedPlaces.length === 0}
                >
                  Save guide
                </Button>
                {addedPlaces.length === 0 && (
                  <p className={styles.saveHint}>Add at least one place to save.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
