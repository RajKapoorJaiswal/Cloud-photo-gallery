import {
  CREATE,
  DELETE,
  FETCH_ALL,
  LIKE,
  SET_ALBUMS,
  SET_DASHBOARD,
  SET_FILTERS,
  SET_POSTS_ERROR,
  SET_POSTS_LOADING,
  UPDATE,
} from '../constants/actionTypes';

const initialState = {
  data: [],
  page: 1,
  total: 0,
  hasMore: false,
  loading: false,
  error: null,
  filters: {
    sort: 'newest',
    filter: '',
    search: '',
    album: 'all',
    fileType: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    favorite: 'all',
    privacy: 'all',
  },
  requestKey: '',
  dashboard: null,
  albums: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ALL:
      return {
        ...state,
        data: action.payload.data || action.payload,
        page: action.payload.page || 1,
        total: action.payload.total || (action.payload.data || action.payload).length,
        hasMore: Boolean(action.payload.hasMore),
        requestKey: action.meta?.requestKey || state.requestKey,
      };
    case SET_POSTS_LOADING:
      return { ...state, loading: action.payload };
    case SET_POSTS_ERROR:
      return { ...state, error: action.payload };
    case SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case SET_DASHBOARD:
      return { ...state, dashboard: action.payload };
    case SET_ALBUMS:
      return { ...state, albums: action.payload };
    case LIKE:
    case UPDATE:
      return { ...state, data: state.data.map((post) => (post._id === action.payload._id ? action.payload : post)) };
    case CREATE:
      return { ...state, data: [action.payload, ...state.data], total: state.total + 1 };
    case DELETE:
      return { ...state, data: state.data.filter((post) => post._id !== action.payload), total: Math.max(state.total - 1, 0) };
    default:
      return state;
  }
};
