// ============================================================
// AppReducer.js — all action handlers for AppContext
// INITIAL_STATE.guides and .users are populated in Phase 3
// when client/src/data/seed.js is created.
// ============================================================

const ALEX_RIVERA = {
  id: 'user-alex',
  handle: 'alexrivera',
  displayName: 'Alex Rivera',
  neighborhood: 'Lincoln Square',
  yearsInChicago: 7,
  badges: ['Food & Drink', 'Live Music', 'Parks'],
  isJournalist: false,
  avatarUrl: null,
};

export const INITIAL_STATE = {
  // Seed data — Phase 3 will replace [] with imports from seed.js
  guides: [],
  users: [],

  // Pre-loaded account (no auth in prototype)
  currentUser: ALEX_RIVERA,

  // Feed preferences — defaults to Alex Rivera's home neighborhoods + interests
  feedPreferences: {
    selectedNeighborhoods: ['Lincoln Square', 'Logan Square', 'Avondale'],
    selectedCategories: ['Food & Drink', 'Live Music', 'Parks'],
  },

  // RSS articles — populated by useRssFeed hook after load
  articles: [],
  articlesLoading: false,
  articlesError: false,

  // Community areas — populated by useCommunityAreas hook after load
  communityAreas: [],
  communityAreasGeoJSON: null,
  communityAreasLoading: false,

  // Local UI state (non-persistent — reset on RESET_SESSION)
  likedIds: new Set(),
  savedIds: new Set(),
  shareModalOpen: false,
  shareModalUrl: '',

  // Session-created guides — tracked separately for reset behavior
  sessionGuideIds: [],
};

export function appReducer(state, action) {
  switch (action.type) {

    case 'SET_ARTICLES_LOADING':
      return { ...state, articlesLoading: true };

    case 'LOAD_ARTICLES':
      return {
        ...state,
        articles: action.payload.articles,
        articlesLoading: false,
        articlesError: false,
      };

    case 'SET_ARTICLES_ERROR':
      return { ...state, articlesError: true, articlesLoading: false };

    case 'SET_COMMUNITY_AREAS_LOADING':
      return { ...state, communityAreasLoading: true };

    case 'LOAD_COMMUNITY_AREAS':
      return {
        ...state,
        communityAreas: action.payload.areas,
        communityAreasGeoJSON: action.payload.geoJSON,
        communityAreasLoading: false,
      };

    case 'ADD_GUIDE':
      return {
        ...state,
        guides: [...state.guides, action.payload.guide],
        sessionGuideIds: [...state.sessionGuideIds, action.payload.guide.id],
      };

    case 'TOGGLE_NEIGHBORHOOD_FILTER': {
      const { neighborhood } = action.payload;
      const current = state.feedPreferences.selectedNeighborhoods;
      const next = current.includes(neighborhood)
        ? current.filter(n => n !== neighborhood)
        : [...current, neighborhood];
      return {
        ...state,
        feedPreferences: { ...state.feedPreferences, selectedNeighborhoods: next },
      };
    }

    case 'TOGGLE_CATEGORY_FILTER': {
      const { category } = action.payload;
      const current = state.feedPreferences.selectedCategories;
      const next = current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category];
      return {
        ...state,
        feedPreferences: { ...state.feedPreferences, selectedCategories: next },
      };
    }

    case 'TOGGLE_LIKE': {
      const { id } = action.payload;
      const likedIds = new Set(state.likedIds);
      const isLiked = likedIds.has(id);
      if (isLiked) {
        likedIds.delete(id);
      } else {
        likedIds.add(id);
      }
      // Also update likeCount on the matching guide
      const guides = state.guides.map(g =>
        g.id === id
          ? { ...g, likeCount: g.likeCount + (isLiked ? -1 : 1) }
          : g
      );
      // And on the matching article
      const articles = state.articles.map(a =>
        a.id === id
          ? { ...a, likeCount: (a.likeCount || 0) + (isLiked ? -1 : 1) }
          : a
      );
      return { ...state, likedIds, guides, articles };
    }

    case 'TOGGLE_SAVE': {
      const { id } = action.payload;
      const savedIds = new Set(state.savedIds);
      if (savedIds.has(id)) {
        savedIds.delete(id);
      } else {
        savedIds.add(id);
      }
      return { ...state, savedIds };
    }

    case 'OPEN_SHARE_MODAL':
      return { ...state, shareModalOpen: true, shareModalUrl: action.payload.url };

    case 'CLOSE_SHARE_MODAL':
      return { ...state, shareModalOpen: false };

    case 'RESET_SESSION': {
      // Remove session-created guides and reset UI state to defaults.
      // Preserves seed-loaded guides and community area data.
      const seedGuides = state.guides.filter(
        g => !state.sessionGuideIds.includes(g.id)
      );
      return {
        ...INITIAL_STATE,
        guides: seedGuides,
        users: state.users,
        communityAreas: state.communityAreas,
        communityAreasGeoJSON: state.communityAreasGeoJSON,
      };
    }

    default:
      return state;
  }
}
