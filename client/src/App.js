import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Snackbar,
  Switch as MuiSwitch,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Album,
  Archive,
  Bell,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Copy,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Github,
  Grid3X3,
  HardDrive,
  Heart,
  Image,
  KeyRound,
  Languages,
  Layers,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Move,
  Plus,
  Play,
  RefreshCw,
  RotateCw,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Star,
  Sun,
  Trash2,
  UploadCloud,
  User,
  UserMinus,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Redirect, Route, Switch, useHistory, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import HomePage from './components/HomePage/HomePage';

import {
  addComment,
  archivePost,
  batchUpdate,
  createAlbum,
  createManyPosts,
  createPost,
  deletePost,
  deleteComment,
  downloadPost,
  favoritePost,
  getPosts,
  likePost,
  loadAdminOverview,
  loadAlbums,
  loadDashboard,
  permanentDeletePost,
  restorePost,
  revokePhotoShare,
  setFilters,
  sharePost,
  updateComment,
  updatePost,
  updateTransformations,
} from './actions/posts';
import {
  autoLogin,
  changePassword,
  deleteAccount,
  loadStorage,
  logoutAllDevices,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  saveProfile,
  sendOtp,
  signin,
  signup,
  verifyEmail,
  verifyOtp,
} from './actions/auth';
import * as api from './api';
import { API_BASE_URL } from './api';
import { PROFILE_UPDATED } from './constants/actionTypes';

const useStyles = makeStyles((theme) => ({
  appRoot: {
    minHeight: '100vh',
    color: '#eaf2ff',
    background: ({ darkMode }) => (darkMode
      ? 'radial-gradient(circle at 16% 10%, rgba(76, 111, 255, 0.30), transparent 28%), radial-gradient(circle at 78% 4%, rgba(20, 184, 166, 0.20), transparent 26%), linear-gradient(135deg, #06111f 0%, #0a1221 48%, #111827 100%)'
      : 'radial-gradient(circle at 16% 10%, rgba(53, 102, 255, 0.18), transparent 28%), radial-gradient(circle at 78% 4%, rgba(129, 92, 246, 0.16), transparent 24%), linear-gradient(135deg, #f8fbff 0%, #eef6ff 46%, #f7f3ff 100%)'),
  },
  authRoot: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    background: 'linear-gradient(-45deg, #07111f, #0a1f44, #32156a, #064e64)',
    backgroundSize: '400% 400%',
    animation: '$gradientShift 16s ease infinite',
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.55)',
    boxShadow: '0 0 24px rgba(95, 214, 255, 0.75)',
  },
  authCard: {
    width: '100%',
    maxWidth: 520,
    position: 'relative',
    zIndex: 2,
    padding: theme.spacing(4),
    borderRadius: 24,
    color: '#f8fbff',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    background: 'linear-gradient(145deg, rgba(12, 22, 39, 0.76), rgba(18, 25, 47, 0.50))',
    boxShadow: '0 34px 100px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255,255,255,0.18)',
    backdropFilter: 'blur(26px)',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2.5),
    },
  },
  logoMark: {
    width: 58,
    height: 58,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 18,
    color: '#fff',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed 48%, #06b6d4)',
    boxShadow: '0 18px 42px rgba(37, 99, 235, 0.42)',
  },
  authInput: {
    '& .MuiInputBase-root': {
      color: '#ffffff',
      borderRadius: 14,
      background: 'rgba(255, 255, 255, 0.08)',
      transition: 'box-shadow 160ms ease, background 160ms ease',
    },
    '& .MuiInputBase-root:hover': {
      background: 'rgba(255, 255, 255, 0.12)',
    },
    '& .MuiInputBase-root.Mui-focused': {
      boxShadow: '0 0 0 4px rgba(56, 189, 248, 0.16)',
    },
    '& .MuiInputLabel-root': { color: 'rgba(236, 244, 255, 0.72)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#7dd3fc' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.18)' },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(125,211,252,0.58)' },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
    '& .MuiFormHelperText-root': { color: 'rgba(236, 244, 255, 0.62)' },
  },
  glowButton: {
    borderRadius: 14,
    minHeight: 48,
    color: '#fff',
    textTransform: 'none',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #2563eb, #7c3aed 52%, #06b6d4)',
    boxShadow: '0 18px 44px rgba(37, 99, 235, 0.38)',
    '&:hover': {
      boxShadow: '0 22px 54px rgba(37, 99, 235, 0.48)',
    },
  },
  ghostButton: {
    borderRadius: 14,
    minHeight: 46,
    color: '#f8fbff',
    textTransform: 'none',
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.07)',
    '&:hover': { background: 'rgba(255,255,255,0.12)' },
  },
  mutedText: {
    color: 'rgba(236, 244, 255, 0.70)',
  },
  authLink: {
    color: '#ffffff',
    textTransform: 'none',
    fontWeight: 800,
    textShadow: '0 0 18px rgba(56,189,248,0.55)',
    '&:hover': {
      color: '#bae6fd',
      background: 'rgba(255,255,255,0.08)',
    },
  },
  shell: {
    minHeight: '100vh',
  },
  appBar: {
    width: 'auto',
    marginLeft: 280,
    color: ({ darkMode }) => (darkMode ? '#f8fbff' : '#111827'),
    background: ({ darkMode }) => (darkMode ? 'rgba(8, 15, 30, 0.72)' : 'rgba(255, 255, 255, 0.78)'),
    borderBottom: ({ darkMode }) => (darkMode ? '1px solid rgba(148, 163, 184, 0.14)' : '1px solid rgba(42, 55, 75, 0.10)'),
    boxShadow: '0 18px 60px rgba(15, 23, 42, 0.10)',
    backdropFilter: 'blur(24px)',
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
  },
  sidebarPaper: {
    width: 280,
    border: 0,
    color: '#edf5ff',
    background: 'linear-gradient(180deg, rgba(8, 17, 34, 0.96), rgba(13, 20, 38, 0.92))',
    boxShadow: '24px 0 80px rgba(0,0,0,0.22)',
    backdropFilter: 'blur(18px)',
  },
  content: {
    minHeight: '100vh',
    padding: theme.spacing(12, 3, 4),
    marginLeft: 280,
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      padding: theme.spacing(11, 2, 3),
    },
  },
  navItem: {
    margin: theme.spacing(0.5, 1.5),
    borderRadius: 16,
    color: 'rgba(237, 245, 255, 0.72)',
    '&:hover': {
      color: '#ffffff',
      background: 'rgba(255,255,255,0.08)',
    },
  },
  navItemActive: {
    color: '#ffffff',
    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.32), rgba(6, 182, 212, 0.18))',
    border: '1px solid rgba(125, 211, 252, 0.22)',
  },
  topSearch: {
    maxWidth: 520,
    width: '100%',
    '& .MuiInputBase-root': {
      borderRadius: 18,
      background: ({ darkMode }) => (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)'),
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
  },
  pageTitle: {
    color: ({ darkMode }) => (darkMode ? '#f8fbff' : '#101828'),
    fontWeight: 900,
    letterSpacing: 0,
  },
  pageSubtitle: {
    color: ({ darkMode }) => (darkMode ? 'rgba(226, 232, 240, 0.68)' : '#64748b'),
  },
  premiumPanel: {
    borderRadius: 24,
    border: ({ darkMode }) => (darkMode ? '1px solid rgba(148, 163, 184, 0.14)' : '1px solid rgba(42, 55, 75, 0.10)'),
    color: ({ darkMode }) => (darkMode ? '#f8fbff' : '#111827'),
    background: ({ darkMode }) => (darkMode ? 'rgba(13, 23, 42, 0.68)' : 'rgba(255, 255, 255, 0.84)'),
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.12)',
    backdropFilter: 'blur(22px)',
  },
  statCard: {
    padding: theme.spacing(2.2),
    minHeight: 132,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  uploadZone: {
    padding: theme.spacing(3),
    textAlign: 'center',
    borderRadius: 24,
    border: '1px dashed rgba(56, 189, 248, 0.55)',
    background: ({ darkMode }) => (darkMode
      ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(6, 182, 212, 0.10))'
      : 'linear-gradient(135deg, rgba(239, 246, 255, 0.92), rgba(250, 245, 255, 0.92))'),
  },
  masonry: {
    columnCount: 4,
    columnGap: 18,
    [theme.breakpoints.down('md')]: { columnCount: 3 },
    [theme.breakpoints.down('sm')]: { columnCount: 2 },
    [theme.breakpoints.down('xs')]: { columnCount: 1 },
  },
  photoCard: {
    breakInside: 'avoid',
    marginBottom: 18,
    overflow: 'hidden',
    borderRadius: 24,
    position: 'relative',
    color: '#fff',
    background: '#0f172a',
    boxShadow: '0 22px 70px rgba(15, 23, 42, 0.18)',
  },
  photoImage: {
    width: '100%',
    minHeight: 220,
    objectFit: 'cover',
    display: 'block',
    background: 'linear-gradient(135deg, #1e293b, #334155)',
  },
  photoOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5),
    opacity: 0,
    transition: 'opacity 180ms ease',
    background: 'linear-gradient(180deg, rgba(2,6,23,0.18), rgba(2,6,23,0.78))',
    '$photoCard:hover &': {
      opacity: 1,
    },
  },
  quickIcon: {
    color: '#fff',
    background: 'rgba(15, 23, 42, 0.48)',
    backdropFilter: 'blur(12px)',
    marginLeft: 4,
    '&:hover': { background: 'rgba(37, 99, 235, 0.70)' },
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    padding: '5px 10px',
    fontSize: 12,
    fontWeight: 800,
    color: '#dff8ff',
    background: 'rgba(8, 47, 73, 0.70)',
    border: '1px solid rgba(125, 211, 252, 0.28)',
  },
  viewerPaper: {
    background: '#020617',
    color: '#f8fbff',
    overflow: 'hidden',
  },
  viewerStage: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 'calc(100vh - 64px)',
    background: '#020617',
    overflow: 'hidden',
    padding: theme.spacing(2),
  },
  viewerImage: {
    maxWidth: '100%',
    maxHeight: 'calc(100vh - 140px)',
    objectFit: 'contain',
    display: 'block',
    margin: '0 auto',
    borderRadius: 12,
    transition: 'transform 0.2s ease',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.60)',
  },
  viewerSidebar: {
    width: 360,
    height: 'calc(100vh - 64px)',
    overflowY: 'auto',
    background: 'rgba(15, 23, 42, 0.95)',
    borderLeft: '1px solid rgba(148, 163, 184, 0.15)',
    padding: theme.spacing(3),
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: 'auto',
      maxHeight: '50vh',
      borderLeft: 'none',
      borderTop: '1px solid rgba(148, 163, 184, 0.15)',
    },
  },
  cover: {
    height: 220,
    borderRadius: 24,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage: 'linear-gradient(135deg, #0f172a, #2563eb 48%, #06b6d4)',
  },
  skeleton: {
    height: 260,
    borderRadius: 24,
    background: 'linear-gradient(90deg, rgba(148,163,184,0.14), rgba(255,255,255,0.28), rgba(148,163,184,0.14))',
    backgroundSize: '220% 100%',
    animation: '$skeleton 1.4s ease infinite',
  },
  '@keyframes skeleton': {
    '0%': { backgroundPosition: '220% 0' },
    '100%': { backgroundPosition: '-220% 0' },
  },
}));

const iconSize = 19;

const fileToDataUrl = (file) => new Promise((resolve) => {
  if (!file || !file.type?.startsWith('image/')) {
    resolve('');
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  const img = new window.Image();

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const maxSide = 1200;
      let { width, height } = img;

      if (width > maxSide || height > maxSide) {
        const ratio = Math.min(maxSide / width, maxSide / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      context.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL(file.type.includes('png') ? 'image/png' : 'image/jpeg', 0.8);
      URL.revokeObjectURL(objectUrl);
      resolve(dataUrl);
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      resolve('');
    }
  };

  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    resolve('');
  };

  img.src = objectUrl;
});

const triggerDownload = (url, fileName = 'photo') => {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const strength = (password = '') => {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;
  return score;
};

const MotionPaper = motion(Paper);

const ProtectedRoute = ({ children, user, ...rest }) => (
  <Route {...rest} render={() => (user ? children : <Redirect to="/auth/login" />)} />
);

const Particles = ({ classes }) => (
  <>
    {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
      <motion.span
        key={item}
        className={classes.particle}
        initial={{ opacity: 0.2, y: 20 }}
        animate={{ opacity: [0.18, 0.7, 0.18], y: [-20, 24, -20], x: [0, item % 2 ? 18 : -18, 0] }}
        transition={{ duration: 6 + item, repeat: Infinity, ease: 'easeInOut' }}
        style={{ left: `${10 + item * 12}%`, top: `${14 + (item % 4) * 18}%` }}
      />
    ))}
  </>
);

const AuthLayout = ({ children, title, subtitle, mode }) => {
  const classes = useStyles({ darkMode: true });

  return (
    <Box className={classes.authRoot}>
      <Particles classes={classes} />
      <MotionPaper
        className={classes.authCard}
        elevation={0}
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <Box display="flex" alignItems="center" mb={3}>
          <motion.div className={classes.logoMark} animate={{ rotate: [0, 3, -3, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <Cloud size={30} />
          </motion.div>
          <Box ml={2}>
            <Typography variant="h5" style={{ fontWeight: 900 }}>Cloud Photo Gallery</Typography>
            <Typography className={classes.mutedText}>{subtitle || 'Securely store, organize and share your memories.'}</Typography>
          </Box>
        </Box>
        <AnimatePresence exitBeforeEnter>
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.25 }}
          >
            <Typography variant="h4" style={{ fontWeight: 900, marginBottom: 8 }}>{title}</Typography>
            {children}
          </motion.div>
        </AnimatePresence>
      </MotionPaper>
    </Box>
  );
};

const AuthTextField = ({ classes, ...props }) => (
  <TextField
    className={classes.authInput}
    variant="outlined"
    fullWidth
    {...props}
  />
);

const SocialButtons = ({ label }) => {
  const classes = useStyles({ darkMode: true });
  const openOAuth = (provider) => {
    window.location.href = `${API_BASE_URL}/user/oauth/${provider}?client=${encodeURIComponent(window.location.origin)}`;
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={6}>
        <Button fullWidth className={classes.ghostButton} startIcon={<Cloud size={iconSize} />} onClick={() => openOAuth('google')}>{label} Google</Button>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Button fullWidth className={classes.ghostButton} startIcon={<Github size={iconSize} />} onClick={() => openOAuth('github')}>{label} GitHub</Button>
      </Grid>
    </Grid>
  );
};

const OAuthComplete = ({ notify }) => {
  const dispatch = useDispatch();
  const routerHistory = useHistory();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const session = params.get('session');

    if (!session) {
      notify('OAuth sign in did not return a session.');
      routerHistory.replace('/auth/login');
      return;
    }

    try {
      const normalized = session.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
      const data = JSON.parse(atob(padded));
      const compactData = {
        token: data.token,
        refreshToken: data.refreshToken,
        userId: data.result?._id || data.result?.id,
        username: data.result?.username || '',
        email: data.result?.email || '',
        avatar: data.result?.avatar || '',
      };
      dispatch({ type: 'AUTH', data: compactData });
      notify('OAuth sign in complete.');
      routerHistory.replace('/');
    } catch (error) {
      notify('OAuth session could not be read.');
      routerHistory.replace('/auth/login');
    }
  }, [dispatch, routerHistory, location.search, notify]);

  return (
    <AuthLayout title="Signing you in" mode="oauth" subtitle="Completing secure OAuth authentication.">
      <Box py={5} textAlign="center"><CircularProgress style={{ color: '#67e8f9' }} /></Box>
    </AuthLayout>
  );
};

const OAuthConfigPage = () => {
  const classes = useStyles({ darkMode: true });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const provider = params.get('provider') || 'oauth';

  return (
    <AuthLayout title="OAuth setup required" mode="oauth-config" subtitle="Provider credentials are missing on the server.">
      <Box py={2}>
        <Typography style={{ color: '#fff' }}>
          {provider} login is ready in the app, but the server needs client credentials before the provider can authenticate users.
        </Typography>
        <Box mt={2}>
          <Typography className={classes.mutedText}>Add these environment variables and restart the server:</Typography>
          <Typography style={{ color: '#fff', marginTop: 8 }}>
            {provider === 'google' ? 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET' : 'GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET'}
          </Typography>
          <Typography style={{ color: '#fff' }}>CLIENT_URL={window.location.origin}</Typography>
        </Box>
        <Box mt={3}><Button href="/auth/login" style={{ color: '#fff' }}>Back to Sign In</Button></Box>
      </Box>
    </AuthLayout>
  );
};

const PasswordField = ({ classes, label, value, onChange, show, setShow, helperText }) => (
  <AuthTextField
    classes={classes}
    required
    label={label}
    type={show ? 'text' : 'password'}
    value={value}
    helperText={helperText}
    onChange={onChange}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <Tooltip title={show ? 'Hide password' : 'Show password'}>
            <IconButton edge="end" onClick={() => setShow((current) => !current)} style={{ color: '#dff8ff' }}>
              {show ? <EyeOff size={iconSize} /> : <Eye size={iconSize} />}
            </IconButton>
          </Tooltip>
        </InputAdornment>
      ),
    }}
  />
);

const AuthPage = ({ notify, initialMode = 'login' }) => {
  const classes = useStyles({ darkMode: true });
  const dispatch = useDispatch();
  const routerHistory = useHistory();
  const auth = useSelector((state) => state.auth);
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: true,
    terms: false,
    token: '',
    avatar: '',
  });
  const score = strength(form.password);

  useEffect(() => setMode(initialMode), [initialMode]);

  const pickAvatar = async (event) => {
    const [file] = event.target.files || [];
    if (file) setForm({ ...form, avatar: await fileToDataUrl(file) });
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (mode === 'signup' && !form.terms) {
        notify('Please accept the terms and conditions.');
        return;
      }
      if (mode === 'login') await dispatch(signin(form));
      if (mode === 'signup') await dispatch(signup(form));
      if (mode === 'login') await dispatch(signin(form));
      if (mode === 'signup') await dispatch(signup(form));
      if (mode === 'forgot') {
        const data = await dispatch(requestPasswordReset(form.email));
        setSuccess(true);
        notify(data.message || 'If an account exists, a 6-digit OTP code has been sent to your email.');
        setMode('otp');
        return;
      }
      if (mode === 'reset') {
        await dispatch(resetPassword({ token: form.resetSessionToken || form.token, password: form.password, confirmPassword: form.confirmPassword }));
        setSuccess(true);
        notify('Password reset successfully. Please sign in with your new password.');
        setForm((prev) => ({ ...prev, password: '', confirmPassword: '', token: '', resetSessionToken: '' }));
        setMode('login');
        return;
      }
      if (mode === 'verify') {
        await dispatch(verifyEmail(form.token));
        setSuccess(true);
        notify('Email verified.');
        return;
      }
      if (mode === 'otp') {
        if (!form.token) {
          const data = await dispatch(sendOtp(form.email));
          setSuccess(true);
          notify(data.message || 'OTP verification code sent to your email.');
          return;
        }
        const data = await dispatch(verifyOtp({ email: form.email, otp: form.token }));
        setSuccess(true);
        notify(data.message || 'OTP verified successfully. Please enter your new password.');
        setForm((prev) => ({ ...prev, resetSessionToken: data.resetSessionToken || data.resetToken }));
        setMode('reset');
        return;
      }
      notify(mode === 'login' ? 'Signed in successfully.' : 'Account created.');
      routerHistory.push('/');
    } catch (error) {
      notify(error.response?.data?.message || 'Authentication failed.');
    }
  };

  const goMode = (next) => {
    setSuccess(false);
    setMode(next);
    routerHistory.push(`/auth/${next}`);
  };

  const title = {
    login: 'Welcome back',
    signup: 'Create your account',
    forgot: 'Recover access',
    reset: 'Set new password',
    verify: 'Verify your email',
    otp: 'Enter OTP Code',
  }[mode];

  return (
    <AuthLayout mode={mode} title={title}>
      {success && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Box my={2} textAlign="center">
            <CheckCircle size={58} color="#67e8f9" />
            <Typography variant="h6">Request completed successfully</Typography>
          </Box>
        </motion.div>
      )}
      <form onSubmit={submit}>
        <Grid container spacing={2}>
          {mode === 'signup' && (
            <>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <Avatar src={form.avatar} style={{ width: 64, height: 64, border: '2px solid rgba(125,211,252,0.5)' }}>
                    <User />
                  </Avatar>
                  <Box ml={2}>
                    <input id="avatar-upload" hidden type="file" accept="image/*" onChange={pickAvatar} />
                    <label htmlFor="avatar-upload"><Button component="span" className={classes.ghostButton}>Upload profile picture</Button></label>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}><AuthTextField classes={classes} required label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><AuthTextField classes={classes} required label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><AuthTextField classes={classes} label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><AuthTextField classes={classes} label="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
            </>
          )}
          {['login', 'signup', 'forgot', 'otp'].includes(mode) && (
            <Grid item xs={12}><AuthTextField classes={classes} required type="email" label="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
          )}
          {['login', 'signup', 'reset'].includes(mode) && (
            <Grid item xs={12}>
              <PasswordField
                classes={classes}
                label={mode === 'reset' ? 'New password' : 'Password'}
                value={form.password}
                show={showPassword}
                setShow={setShowPassword}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                helperText={mode !== 'login' ? 'Use at least 8 characters with letters and numbers.' : ''}
              />
            </Grid>
          )}
          {['signup', 'reset'].includes(mode) && (
            <>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <Box flexGrow={1}><LinearProgress variant="determinate" value={score} style={{ height: 8, borderRadius: 999 }} /></Box>
                  <Box ml={1}>
                    <Typography className={classes.mutedText} variant="caption">
                      {score < 50 ? 'Weak' : score < 80 ? 'Good' : 'Strong'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <PasswordField classes={classes} label="Confirm password" value={form.confirmPassword} show={showConfirm} setShow={setShowConfirm} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
              </Grid>
            </>
          )}
          {['verify', 'otp'].includes(mode) && (
            <Grid item xs={12}>
              <AuthTextField
                classes={classes}
                required={mode !== 'otp'}
                label={mode === 'otp' ? '6-Digit OTP Code' : 'Token'}
                helperText={mode === 'otp' ? 'Enter the 6-digit code sent to your registered email address (or leave blank to resend).' : ''}
                value={form.token}
                onChange={(e) => setForm({ ...form, token: e.target.value })}
              />
            </Grid>
          )}
          {mode === 'login' && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <FormControlLabel control={<Checkbox checked={form.rememberMe} onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })} style={{ color: '#7dd3fc' }} />} label="Remember me" />
                <Button color="primary" onClick={() => goMode('forgot')}>Forgot password?</Button>
              </Box>
            </Grid>
          )}
          {mode === 'signup' && (
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} style={{ color: '#7dd3fc' }} />} label="I agree to the Terms & Conditions" />
            </Grid>
          )}
        </Grid>
        {auth.error && <Box mt={2}><Typography color="error">{auth.error}</Typography></Box>}
        <Box mt={3}>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button fullWidth type="submit" className={classes.glowButton} disabled={auth.loading}>
              {auth.loading ? <CircularProgress size={22} style={{ color: '#fff' }} /> : ({
                login: 'Sign In',
                signup: 'Create Account',
                forgot: 'Send Verification OTP',
                reset: 'Save New Password',
                verify: 'Verify Email',
                otp: form.token ? 'Verify OTP Code' : 'Resend OTP Code',
              }[mode])}
            </Button>
          </motion.div>
        </Box>
        {['login', 'signup'].includes(mode) && (
          <Box mt={2}><SocialButtons label={mode === 'login' ? 'Continue with' : 'Sign up with'} /></Box>
        )}
        <Box mt={2} textAlign="center">
          {mode === 'login' && <><Button className={classes.authLink} onClick={() => goMode('signup')}>New here? Create an account</Button><Button className={classes.authLink} onClick={() => goMode('otp')}>Sign in with OTP</Button></>}
          {mode === 'signup' && <Button className={classes.authLink} onClick={() => goMode('login')}>Already have an account? Sign In</Button>}
          {mode === 'forgot' && <Button className={classes.authLink} onClick={() => goMode('login')}>Back to Sign In</Button>}
          {mode === 'reset' && <Button className={classes.authLink} onClick={() => goMode('login')}>Return to Sign In</Button>}
          {mode === 'verify' && <Button className={classes.authLink} onClick={() => routerHistory.push('/')}>Continue to Dashboard</Button>}
          {mode === 'otp' && <Button className={classes.authLink} onClick={() => goMode('login')}>Back to Sign In</Button>}
        </Box>
      </form>
    </AuthLayout>
  );
};

const AppShell = ({ children, user, notify, darkMode, setDarkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const routerHistory = useHistory();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    let mounted = true;
    api.fetchConversations().then(({ data }) => { if (mounted) setUnreadMessages(data.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0)); }).catch(() => {});
    return () => { mounted = false; };
  }, [location.pathname]);

  const navItems = [
    ['/gallery', 'Photos', Grid3X3, 0],
    ['/dashboard', 'Dashboard', Activity, 4],
    ['/albums', 'Albums', Album, 0],
    ['/favorites', 'Favorites', Star, 0],
    ['/downloads', 'Downloads', Download, 0],
    ['/trash', 'Trash', Trash2, 0],
    ['/shared', 'Shared', Share2, 0],
    ['/messages', 'Messages', MessageCircle, unreadMessages],
    ['/storage', 'Storage', HardDrive, 0],
    ['/notifications', 'Notifications', Bell, 3],
    ['/users', 'Users', User, 0],
    ['/settings', 'Settings', Settings, 0],
    ['/profile', 'Profile', User, 0],
    ...(user?.result?.role === 'admin' ? [['/admin', 'Admin', Shield, 2]] : []),
  ];

  const drawer = (
    <Box height="100%" display="flex" flexDirection="column">
      <Box p={3} display="flex" alignItems="center">
        <Box className={classes.logoMark}><Cloud size={28} /></Box>
        <Box ml={1.5}>
          <Typography variant="h6" style={{ fontWeight: 900 }}>Cloud Photos</Typography>
          <Typography variant="caption" style={{ color: 'rgba(237,245,255,0.56)' }}>Premium workspace</Typography>
        </Box>
      </Box>
      <List>
        {navItems.map(([path, label, Icon, badge]) => {
          const active = location.pathname === path;
          return (
            <ListItem button key={path} className={`${classes.navItem} ${active ? classes.navItemActive : ''}`} onClick={() => { routerHistory.push(path); setOpen(false); }}>
              <ListItemIcon style={{ color: 'inherit', minWidth: 40 }}><Icon size={iconSize} /></ListItemIcon>
              <ListItemText primary={label} />
              {Boolean(badge) && <Badge badgeContent={badge} color="primary" />}
            </ListItem>
          );
        })}
      </List>
      <Box flexGrow={1} />
      <Box p={2}>
        <Paper style={{ padding: 14, borderRadius: 20, background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.10)' }} elevation={0}>
          <Box display="flex" alignItems="center">
            <Avatar src={user?.result?.avatar}>{user?.result?.name?.[0]}</Avatar>
            <Box ml={1.5} minWidth={0}>
              <Typography noWrap style={{ fontWeight: 800 }}>{user?.result?.name || 'Gallery User'}</Typography>
              <Typography noWrap variant="caption" style={{ color: 'rgba(237,245,255,0.58)' }}>{user?.result?.email}</Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mt={1.5}>
            <Box display="flex" alignItems="center">{darkMode ? <Moon size={16} /> : <Sun size={16} />}<Box ml={1}><Typography variant="caption">Theme</Typography></Box></Box>
            <MuiSwitch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} color="primary" />
          </Box>
          <Button fullWidth startIcon={<LogOut size={iconSize} />} onClick={async () => { await dispatch(logoutUser()); notify('Logged out.'); routerHistory.push('/'); }} style={{ color: '#fff', marginTop: 8, textTransform: 'none' }}>Logout</Button>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box className={classes.appRoot}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          {!isDesktop && <IconButton onClick={() => setOpen(true)}><MoreHorizontal /></IconButton>}
          <TextField
            className={classes.topSearch}
            variant="outlined"
            size="small"
            placeholder="Search photos, albums, tags, owners..."
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
          />
          <Box flexGrow={1} />
          <Tooltip title="Upload"><IconButton color="primary" onClick={() => routerHistory.push('/gallery')}><UploadCloud /></IconButton></Tooltip>
          <Tooltip title="Notifications"><IconButton onClick={() => routerHistory.push('/notifications')}><Badge badgeContent={3} color="secondary"><Bell /></Badge></IconButton></Tooltip>
          <Tooltip title="Settings"><IconButton onClick={() => routerHistory.push('/settings')}><Settings /></IconButton></Tooltip>
          <Avatar src={user?.result?.avatar} style={{ marginLeft: 8 }}>{user?.result?.name?.[0]}</Avatar>
        </Toolbar>
      </AppBar>
      <Drawer variant={isDesktop ? 'permanent' : 'temporary'} open={isDesktop || open} onClose={() => setOpen(false)} classes={{ paper: classes.sidebarPaper }}>
        {drawer}
      </Drawer>
      <main className={classes.content}>
        <AnimatePresence exitBeforeEnter>
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </Box>
  );
};

const PageHeader = ({ title, subtitle, action, darkMode }) => {
  const classes = useStyles({ darkMode });
  return (
    <Box display="flex" alignItems="center" mb={3} flexWrap="wrap">
      <Box>
        <Typography className={classes.pageTitle} variant="h4">{title}</Typography>
        <Typography className={classes.pageSubtitle}>{subtitle}</Typography>
      </Box>
      <Box flexGrow={1} />
      {action}
    </Box>
  );
};

const UploadPanel = ({ notify, darkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const folderRef = useRef(null);
  const addMoreRef = useRef(null);
  const addFolderRef = useRef(null);
  const albums = useSelector((state) => state.posts.albums);
  const dashboard = useSelector((state) => state.posts.dashboard);

  // Wizard & Upload Queue State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [pendingUploadQueue, setPendingUploadQueue] = useState([]);
  const [progress, setProgress] = useState(0);

  // Step Configuration State
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [createNewAlbum, setCreateNewAlbum] = useState(false);
  const [newAlbumData, setNewAlbumData] = useState({ name: '', description: '', visibility: 'private' });
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

  const [privacy, setPrivacy] = useState('private');
  const [sharedUsers, setSharedUsers] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [shareExpiry, setShareExpiry] = useState('never');

  const [commonDescription, setCommonDescription] = useState('');
  const [commonTags, setCommonTags] = useState('');
  const [customPhotos, setCustomPhotos] = useState({});

  // Duplicate Detection State
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [duplicateIndex, setDuplicateIndex] = useState(0);
  const [skippedIndices, setSkippedIndices] = useState([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  // User Search Debounce
  useEffect(() => {
    if (!userQuery.trim()) {
      setUserSearchResults([]);
      return undefined;
    }
    const timer = setTimeout(() => {
      api.searchUsers(userQuery)
        .then(({ data }) => setUserSearchResults(data || []))
        .catch(() => setUserSearchResults([]));
    }, 200);
    return () => clearTimeout(timer);
  }, [userQuery]);

  const prepareFiles = async (files) => {
    const rawFiles = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
    return Promise.all(
      rawFiles.map(async (file) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^.]+$/, ''),
        fileName: file.name,
        fileType: file.type,
        size: file.size,
        selectedFile: await fileToDataUrl(file),
        customTitle: '',
        customMessage: '',
      }))
    );
  };

  const pickFiles = async (files) => {
    const prepared = await prepareFiles(files);
    if (!prepared.length) return;
    setPendingUploadQueue((prev) => [...prev, ...prepared]);
    setWizardOpen(true);
    setWizardStep(1);
  };

  const handleAddMoreFiles = async (files) => {
    const prepared = await prepareFiles(files);
    if (prepared.length) {
      setPendingUploadQueue((prev) => [...prev, ...prepared]);
    }
  };

  const removeFileFromQueue = (id) => {
    setPendingUploadQueue((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (updated.length === 0) {
        handleResetWizard();
      }
      return updated;
    });
  };

  const handleResetWizard = () => {
    setWizardOpen(false);
    setWizardStep(1);
    setPendingUploadQueue([]);
    setSelectedAlbum('');
    setCreateNewAlbum(false);
    setNewAlbumData({ name: '', description: '', visibility: 'private' });
    setPrivacy('private');
    setSharedUsers([]);
    setUserQuery('');
    setUserSearchResults([]);
    setShareExpiry('never');
    setCommonDescription('');
    setCommonTags('');
    setCustomPhotos({});
    setProgress(0);
    setDuplicateMatches([]);
    setDuplicateIndex(0);
    setSkippedIndices([]);
    setIsCheckingDuplicates(false);
  };

  const totalQueueSize = pendingUploadQueue.reduce((sum, item) => sum + (item.size || 0), 0);
  const FIVE_GIB = 5 * 1024 * 1024 * 1024;
  const currentUsedStorage = dashboard?.storage || 0;
  const availableStorage = Math.max(FIVE_GIB - currentUsedStorage, 0);
  const isQuotaExceeded = totalQueueSize > availableStorage;

  const handleCreateInlineAlbum = async (e) => {
    if (e) e.preventDefault();
    if (!newAlbumData.name.trim()) return notify('Album name is required.');
    setIsCreatingAlbum(true);
    try {
      const { data } = await api.createAlbum(newAlbumData);
      await dispatch(loadAlbums());
      setSelectedAlbum(data._id);
      setCreateNewAlbum(false);
      setNewAlbumData({ name: '', description: '', visibility: 'private' });
      notify(`Album "${data.name}" created and selected.`);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create album.');
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  const executeUploadList = async (listToUpload) => {
    if (!listToUpload || !listToUpload.length) return;
    try {
      const parsedTags = commonTags ? commonTags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      const preparedUploads = listToUpload.map((item) => {
        const itemCustom = customPhotos[item.id] || {};
        const itemTags = [...new Set([...parsedTags, ...(item.size > 8 * 1024 * 1024 ? ['large-file'] : ['optimized'])])];
        return {
          ...item,
          title: itemCustom.title?.trim() || item.title || item.fileName,
          message: itemCustom.message?.trim() || commonDescription?.trim() || '',
          tags: itemTags,
          album: selectedAlbum || undefined,
          visibility: privacy,
          sharedWith: sharedUsers.map((u) => u._id),
          shareExpiresAt: shareExpiry === 'never' ? undefined : new Date(Date.now() + ({ hour: 60 * 60 * 1000, day: 24 * 60 * 60 * 1000, week: 7 * 24 * 60 * 60 * 1000, month: 30 * 24 * 60 * 60 * 1000 }[shareExpiry])).toISOString(),
        };
      });

      if (preparedUploads.length === 1) {
        await dispatch(createPost(preparedUploads[0], (upload) => setProgress(Math.round((upload.loaded * 100) / upload.total))));
        notify(`"${preparedUploads[0].title || preparedUploads[0].fileName}" uploaded successfully.`);
      } else {
        await dispatch(createManyPosts(preparedUploads, (event) => setProgress(Math.round((event.loaded * 100) / event.total))));
        notify(`${preparedUploads.length} photos uploaded successfully.`);
      }
      dispatch(loadStorage());
      dispatch(getPosts());
      handleResetWizard();
    } catch (err) {
      notify(err.response?.data?.message || 'Upload failed.');
    } finally {
      setProgress(0);
    }
  };

  const handleStartDuplicateCheck = async () => {
    if (isQuotaExceeded) {
      return notify('Cannot proceed: Selected files exceed your available 5 GiB storage quota.');
    }
    setIsCheckingDuplicates(true);
    try {
      const parsedTags = commonTags ? commonTags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      const preparedList = pendingUploadQueue.map((item) => {
        const itemCustom = customPhotos[item.id] || {};
        return {
          ...item,
          title: itemCustom.title?.trim() || item.title || item.fileName,
          message: itemCustom.message?.trim() || commonDescription?.trim() || '',
          tags: parsedTags,
          album: selectedAlbum || undefined,
          visibility: privacy,
          sharedWith: sharedUsers.map((u) => u._id),
        };
      });

      const { data } = await api.checkDuplicates(preparedList);
      const duplicatesFound = data.duplicates || [];

      if (duplicatesFound.length > 0) {
        setDuplicateMatches(duplicatesFound);
        setSkippedIndices([]);
        setDuplicateIndex(0);
      } else {
        await executeUploadList(preparedList);
      }
    } catch (err) {
      await executeUploadList(pendingUploadQueue);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const handleSkipDuplicate = () => {
    const currentDup = duplicateMatches[duplicateIndex];
    const newSkipped = [...skippedIndices, currentDup.incomingIndex];
    setSkippedIndices(newSkipped);

    if (duplicateIndex + 1 < duplicateMatches.length) {
      setDuplicateIndex(duplicateIndex + 1);
    } else {
      setDuplicateMatches([]);
      const finalQueue = pendingUploadQueue.filter((_, idx) => !newSkipped.includes(idx));
      if (finalQueue.length > 0) {
        executeUploadList(finalQueue);
      } else {
        notify('Duplicate uploads skipped.');
        handleResetWizard();
      }
    }
  };

  const handleUploadAnyway = () => {
    if (duplicateIndex + 1 < duplicateMatches.length) {
      setDuplicateIndex(duplicateIndex + 1);
    } else {
      setDuplicateMatches([]);
      const finalQueue = pendingUploadQueue.filter((_, idx) => !skippedIndices.includes(idx));
      executeUploadList(finalQueue);
    }
  };

  const selectedAlbumObj = albums.find((a) => String(a._id) === String(selectedAlbum));

  return (
    <>
      <Paper className={`${classes.premiumPanel} ${classes.uploadZone}`} elevation={0} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pickFiles(e.dataTransfer.files); }}>
        <motion.div whileHover={{ scale: 1.01 }}>
          <UploadCloud size={44} color="#38bdf8" />
          <Typography variant="h6" style={{ fontWeight: 900 }}>Smart Photo Upload Wizard</Typography>
          <Typography className={classes.pageSubtitle}>Select files or folders to configure album destination, privacy, sharing, and descriptions.</Typography>
          <Box my={2}>
            <input hidden ref={inputRef} type="file" multiple accept="image/*" onChange={(e) => pickFiles(e.target.files)} />
            <input hidden ref={folderRef} type="file" multiple accept="image/*" webkitdirectory="true" directory="true" onChange={(e) => pickFiles(e.target.files)} />
            <Button className={classes.glowButton} startIcon={<Plus size={iconSize} />} onClick={() => inputRef.current?.click()} disabled={isCheckingDuplicates}>
              Choose photos
            </Button>
            <Box component="span" mx={1} />
            <Button variant="outlined" color="primary" startIcon={<Layers size={iconSize} />} onClick={() => folderRef.current.click()} disabled={isCheckingDuplicates}>
              Folder upload
            </Button>
          </Box>
          {progress > 0 && <LinearProgress variant="determinate" value={progress} style={{ borderRadius: 8, height: 8, marginTop: 12 }} />}
        </motion.div>
      </Paper>

      {/* Smart 5-Step Upload Wizard Dialog */}
      <Dialog
        open={wizardOpen && duplicateMatches.length === 0}
        onClose={handleResetWizard}
        maxWidth="md"
        fullWidth
        PaperProps={{ style: { borderRadius: 20, overflow: 'hidden', background: '#f8fafc', boxShadow: '0 25px 60px rgba(15,23,42,0.35)' } }}
      >
        <DialogTitle style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <UploadCloud size={26} color="#38bdf8" style={{ marginRight: 12 }} />
              <Typography variant="h6" style={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>Smart Photo Upload Wizard</Typography>
            </Box>
            <Chip
              size="small"
              label={`Step ${wizardStep} of 5`}
              style={{ background: 'rgba(56, 189, 248, 0.18)', color: '#38bdf8', fontWeight: 800, border: '1px solid rgba(56,189,248,0.4)', fontSize: '0.78rem' }}
            />
          </Box>

          {/* Stepper Header */}
          <Box display="flex" justifyContent="space-between" mt={2} style={{ gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {['1. Select Photos', '2. Album', '3. Privacy & Sharing', '4. Description & Tags', '5. Review & Upload'].map((title, idx) => {
              const stepNum = idx + 1;
              const isActive = wizardStep === stepNum;
              const isCompleted = wizardStep > stepNum;
              return (
                <Chip
                  key={title}
                  size="small"
                  label={title}
                  onClick={() => { if (stepNum < wizardStep) setWizardStep(stepNum); }}
                  style={{
                    flex: 1,
                    minWidth: 105,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: stepNum < wizardStep ? 'pointer' : 'default',
                    background: isActive ? 'linear-gradient(135deg, #2563eb, #0284c7)' : isCompleted ? 'rgba(56,189,248,0.22)' : 'rgba(255,255,255,0.08)',
                    color: isActive ? '#ffffff' : isCompleted ? '#38bdf8' : '#94a3b8',
                    border: isActive ? '1px solid #60a5fa' : isCompleted ? '1px solid rgba(56,189,248,0.4)' : 'none',
                    boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.35)' : 'none',
                  }}
                />
              );
            })}
          </Box>
        </DialogTitle>

        <DialogContent style={{ background: '#f8fafc', color: '#0f172a', padding: 24, minHeight: 380 }}>
          {/* STEP 1: Select & Review Photos */}
          {wizardStep === 1 && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle1" style={{ fontWeight: 800, color: '#0f172a' }}>
                  Selected Photos ({pendingUploadQueue.length} files • {(totalQueueSize / (1024 * 1024)).toFixed(2)} MB)
                </Typography>
                <Box display="flex" style={{ gap: 8 }}>
                  <input hidden ref={addMoreRef} type="file" multiple accept="image/*" onChange={(e) => handleAddMoreFiles(e.target.files)} />
                  <input hidden ref={addFolderRef} type="file" multiple accept="image/*" webkitdirectory="true" directory="true" onChange={(e) => handleAddMoreFiles(e.target.files)} />
                  <Button size="small" variant="outlined" style={{ color: '#0284c7', borderColor: '#0284c7', fontWeight: 700 }} startIcon={<Plus size={14} />} onClick={() => addMoreRef.current?.click()}>Add Files</Button>
                  <Button size="small" variant="outlined" style={{ color: '#475569', borderColor: '#cbd5e1', fontWeight: 700 }} startIcon={<Layers size={14} />} onClick={() => addFolderRef.current?.click()}>Add Folder</Button>
                </Box>
              </Box>

              {/* Storage Limit Warning */}
              {isQuotaExceeded && (
                <Paper style={{ padding: 14, marginBottom: 16, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12 }}>
                  <Typography variant="body2" style={{ color: '#991b1b', fontWeight: 700 }}>
                    <span role="img" aria-label="warning">⚠️</span> Storage Quota Exceeded! Uploading {(totalQueueSize / (1024 * 1024)).toFixed(1)} MB exceeds your remaining capacity of {(availableStorage / (1024 * 1024)).toFixed(1)} MB out of your 5 GiB quota. Please remove some files.
                  </Typography>
                </Paper>
              )}

              <Box style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                <Grid container spacing={1.5}>
                  {pendingUploadQueue.map((item) => (
                    <Grid item xs={12} key={item.id}>
                      <Paper style={{ padding: 12, background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box display="flex" alignItems="center">
                          <img src={item.selectedFile} alt={item.fileName} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, marginRight: 14, border: '1px solid #cbd5e1' }} />
                          <Box>
                            <Typography variant="body2" style={{ fontWeight: 800, color: '#0f172a' }}>{item.fileName}</Typography>
                            <Typography variant="caption" style={{ color: '#64748b', fontWeight: 600 }}>{(item.size / 1024).toFixed(1)} KB • {item.fileType || 'Image'}</Typography>
                          </Box>
                        </Box>
                        <IconButton size="small" style={{ color: '#dc2626' }} onClick={() => removeFileFromQueue(item.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          )}

          {/* STEP 2: Choose Destination Album */}
          {wizardStep === 2 && (
            <Box>
              <Typography variant="subtitle1" style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Select Destination Album</Typography>
              <Typography style={{ color: '#475569', fontSize: '0.88rem', marginBottom: 16 }}>Choose whether to upload photos into an existing album, root library, or create a new album inline.</Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth select variant="outlined" label="Destination Album" value={createNewAlbum ? 'new' : selectedAlbum} onChange={(e) => {
                    if (e.target.value === 'new') {
                      setCreateNewAlbum(true);
                      setSelectedAlbum('');
                    } else {
                      setCreateNewAlbum(false);
                      setSelectedAlbum(e.target.value);
                    }
                  }} InputProps={{ style: { color: '#0f172a', fontWeight: 700, background: '#ffffff' } }} InputLabelProps={{ style: { color: '#475569', fontWeight: 700 } }}>
                    <MenuItem value=""><span role="img" aria-label="camera">📷</span> My Photos (Root Library / No Album)</MenuItem>
                    {albums.map((album) => (
                      <MenuItem key={album._id} value={album._id}>
                        <span role="img" aria-label="folder">📁</span> {album.name} ({album.visibility || 'private'})
                      </MenuItem>
                    ))}
                    <MenuItem value="new" style={{ color: '#0284c7', fontWeight: 800 }}><span role="img" aria-label="plus">➕</span> Create New Album...</MenuItem>
                  </TextField>
                </Grid>

                {createNewAlbum && (
                  <Grid item xs={12}>
                    <Paper style={{ padding: 18, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 14 }}>
                      <Typography variant="subtitle2" style={{ fontWeight: 800, color: '#0369a1', marginBottom: 12 }}>Create New Album Inline</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth required variant="outlined" size="small" label="Album Name" value={newAlbumData.name} onChange={(e) => setNewAlbumData({ ...newAlbumData, name: e.target.value })} InputProps={{ style: { background: '#ffffff', color: '#0f172a', fontWeight: 600 } }} InputLabelProps={{ style: { color: '#475569', fontWeight: 700 } }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth select variant="outlined" size="small" label="Privacy" value={newAlbumData.visibility} onChange={(e) => setNewAlbumData({ ...newAlbumData, visibility: e.target.value })} InputProps={{ style: { background: '#ffffff', color: '#0f172a', fontWeight: 600 } }} InputLabelProps={{ style: { color: '#475569', fontWeight: 700 } }}>
                            <MenuItem value="private">Private</MenuItem>
                            <MenuItem value="shared">Shared</MenuItem>
                            <MenuItem value="public">Public</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth variant="outlined" size="small" label="Description (Optional)" value={newAlbumData.description} onChange={(e) => setNewAlbumData({ ...newAlbumData, description: e.target.value })} InputProps={{ style: { background: '#ffffff', color: '#0f172a', fontWeight: 600 } }} InputLabelProps={{ style: { color: '#475569', fontWeight: 700 } }} />
                        </Grid>
                        <Grid item xs={12}>
                          <Button variant="contained" style={{ background: 'linear-gradient(135deg, #2563eb, #0284c7)', color: '#ffffff', fontWeight: 800, borderRadius: 10 }} onClick={handleCreateInlineAlbum} disabled={isCreatingAlbum}>
                            {isCreatingAlbum ? 'Creating Album...' : 'Create & Select Album'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* STEP 3: Privacy & Sharing Settings */}
          {wizardStep === 3 && (
            <Box>
              <Typography variant="subtitle1" style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Privacy & Sharing Settings</Typography>
              <Typography style={{ color: '#475569', fontSize: '0.88rem', marginBottom: 16 }}>Configure who can access your uploaded photos.</Typography>

              {/* Interactive Privacy Cards */}
              <Grid container spacing={2}>
                {[
                  { key: 'private', icon: '🔒', title: 'Private', desc: 'Only you (owner) can access these photos. Strictly restricted.' },
                  { key: 'shared', icon: '👥', title: 'Shared', desc: 'Select specific registered users or link recipients to access.' },
                  { key: 'public', icon: '🌐', title: 'Public', desc: 'Accessible to anyone with the public share link without logging in.' },
                ].map((opt) => {
                  const isSelected = privacy === opt.key;
                  return (
                    <Grid item xs={12} sm={4} key={opt.key}>
                      <Paper
                        onClick={() => setPrivacy(opt.key)}
                        style={{
                          padding: 16,
                          cursor: 'pointer',
                          borderRadius: 14,
                          height: '100%',
                          transition: 'all 180ms ease',
                          background: isSelected ? '#f0f9ff' : '#ffffff',
                          border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                          boxShadow: isSelected ? '0 4px 14px rgba(2,132,199,0.18)' : '0 2px 6px rgba(0,0,0,0.03)',
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                          <Typography variant="h6" style={{ fontSize: '0.98rem', fontWeight: 800, color: isSelected ? '#0369a1' : '#0f172a' }}>
                            <span role="img" aria-label={opt.title}>{opt.icon}</span> {opt.title}
                          </Typography>
                          {isSelected && <CheckCircle size={18} color="#0284c7" />}
                        </Box>
                        <Typography variant="caption" style={{ color: isSelected ? '#0369a1' : '#64748b', fontSize: '0.78rem', lineHeight: 1.4, display: 'block' }}>
                          {opt.desc}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {privacy === 'shared' && (
                <Box mt={2}>
                  <Paper style={{ padding: 18, background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <Typography variant="subtitle2" style={{ fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Select Registered Users to Share With</Typography>
                    <TextField fullWidth variant="outlined" size="small" placeholder="Search users by name or @username..." value={userQuery} onChange={(e) => setUserQuery(e.target.value)} InputProps={{ style: { background: '#ffffff', color: '#0f172a', fontWeight: 600 }, startAdornment: <InputAdornment position="start"><Search size={16} color="#64748b" /></InputAdornment> }} />
                    
                    {userSearchResults.length > 0 && (
                      <Paper style={{ marginTop: 8, maxHeight: 150, overflowY: 'auto', background: '#ffffff', border: '1px solid #cbd5e1', padding: 4 }}>
                        {userSearchResults.map((u) => (
                          <ListItem button key={u._id} onClick={() => {
                            if (!sharedUsers.some((item) => item._id === u._id)) setSharedUsers([...sharedUsers, u]);
                            setUserQuery('');
                            setUserSearchResults([]);
                          }}>
                            <Avatar src={u.avatar} style={{ width: 28, height: 28, marginRight: 8 }}>{u.name?.[0]}</Avatar>
                            <ListItemText primary={u.name} secondary={`@${u.username || u.email}`} primaryTypographyProps={{ style: { fontWeight: 700, color: '#0f172a' } }} secondaryTypographyProps={{ style: { color: '#64748b' } }} />
                          </ListItem>
                        ))}
                      </Paper>
                    )}

                    {sharedUsers.length > 0 && (
                      <Box mt={1.5} display="flex" flexWrap="wrap" style={{ gap: 6 }}>
                        {sharedUsers.map((u) => (
                          <Chip key={u._id} avatar={<Avatar src={u.avatar}>{u.name?.[0]}</Avatar>} label={u.name} onDelete={() => setSharedUsers(sharedUsers.filter((item) => item._id !== u._id))} color="primary" variant="outlined" style={{ fontWeight: 700 }} />
                        ))}
                      </Box>
                    )}

                    <Box mt={2}>
                      <TextField select fullWidth variant="outlined" size="small" label="Link Expiration" value={shareExpiry} onChange={(e) => setShareExpiry(e.target.value)} InputProps={{ style: { background: '#ffffff', color: '#0f172a', fontWeight: 600 } }} InputLabelProps={{ style: { color: '#475569', fontWeight: 700 } }}>
                        <MenuItem value="never">Never Expire</MenuItem>
                        <MenuItem value="hour">1 Hour</MenuItem>
                        <MenuItem value="day">1 Day</MenuItem>
                        <MenuItem value="week">1 Week</MenuItem>
                        <MenuItem value="month">1 Month</MenuItem>
                      </TextField>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
          )}

          {/* STEP 4: Photo Description & Metadata */}
          {wizardStep === 4 && (
            <Box style={{ maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
              <Typography variant="subtitle1" style={{ fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Description & Metadata</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} variant="outlined" label="Common Description (Applies to all selected photos)" value={commonDescription} onChange={(e) => setCommonDescription(e.target.value)} InputProps={{ style: { background: '#ffffff', color: '#0f172a', fontWeight: 600 } }} InputLabelProps={{ style: { color: '#475569', fontWeight: 700 } }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth variant="outlined" label="Tags (Comma-separated, e.g. vacation, nature, 2026)" value={commonTags} onChange={(e) => setCommonTags(e.target.value)} InputProps={{ style: { background: '#ffffff', color: '#0f172a', fontWeight: 600 } }} InputLabelProps={{ style: { color: '#475569', fontWeight: 700 } }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" style={{ fontWeight: 800, color: '#0f172a', marginTop: 8, marginBottom: 8 }}>Individual Photo Customization (Optional)</Typography>
                  {pendingUploadQueue.map((item, index) => {
                    const custom = customPhotos[item.id] || {};
                    return (
                      <Accordion key={item.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', marginBottom: 8, borderRadius: 10 }}>
                        <AccordionSummary expandIcon={<ChevronLeft size={18} style={{ transform: 'rotate(-90deg)', color: '#475569' }} />}>
                          <Box display="flex" alignItems="center">
                            <img src={item.selectedFile} alt={item.fileName} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, marginRight: 10, border: '1px solid #cbd5e1' }} />
                            <Typography variant="body2" style={{ fontWeight: 800, color: '#0f172a' }}>{index + 1}. {custom.title || item.title || item.fileName}</Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth variant="outlined" size="small" label="Custom Title" value={custom.title !== undefined ? custom.title : item.title} onChange={(e) => setCustomPhotos({ ...customPhotos, [item.id]: { ...custom, title: e.target.value } })} InputProps={{ style: { color: '#0f172a', fontWeight: 600 } }} InputLabelProps={{ style: { color: '#475569', fontWeight: 700 } }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth variant="outlined" size="small" label="Custom Description" value={custom.message !== undefined ? custom.message : ''} onChange={(e) => setCustomPhotos({ ...customPhotos, [item.id]: { ...custom, message: e.target.value } })} InputProps={{ style: { color: '#0f172a', fontWeight: 600 } }} InputLabelProps={{ style: { color: '#475569', fontWeight: 700 } }} />
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* STEP 5: Review & Confirmation Summary */}
          {wizardStep === 5 && (
            <Box>
              <Typography variant="subtitle1" style={{ fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Review & Confirm Upload</Typography>
              <Paper style={{ padding: 20, background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" style={{ color: '#64748b', fontWeight: 700 }}>Photos Count</Typography>
                    <Typography variant="body1" style={{ fontWeight: 800, color: '#0f172a' }}><span role="img" aria-label="camera">📷</span> {pendingUploadQueue.length} Files ({(totalQueueSize / (1024 * 1024)).toFixed(2)} MB)</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" style={{ color: '#64748b', fontWeight: 700 }}>Destination Album</Typography>
                    <Typography variant="body1" style={{ fontWeight: 800, color: '#0f172a' }}><span role="img" aria-label="folder">📁</span> {selectedAlbumObj ? selectedAlbumObj.name : 'My Photos (Root Library)'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" style={{ color: '#64748b', fontWeight: 700 }}>Privacy Setting</Typography>
                    <Typography variant="body1" style={{ fontWeight: 800, textTransform: 'capitalize', color: '#0f172a' }}>
                      {privacy === 'private' ? <><span role="img" aria-label="lock">🔒</span> Private</> : privacy === 'shared' ? <><span role="img" aria-label="people">👥</span> Shared ({sharedUsers.length} users)</> : <><span role="img" aria-label="globe">🌐</span> Public</>}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" style={{ color: '#64748b', fontWeight: 700 }}>Remaining Storage After Upload</Typography>
                    <Typography variant="body1" style={{ fontWeight: 800, color: '#0284c7' }}>
                      <span role="img" aria-label="floppy disk">💾</span> {Math.max((availableStorage - totalQueueSize) / (1024 * 1024), 0).toFixed(1)} MB available
                    </Typography>
                  </Grid>
                  {commonDescription && (
                    <Grid item xs={12}>
                      <Typography variant="caption" style={{ color: '#64748b', fontWeight: 700 }}>Description</Typography>
                      <Typography variant="body2" style={{ color: '#0f172a', fontWeight: 600 }}>{commonDescription}</Typography>
                    </Grid>
                  )}
                  {commonTags && (
                    <Grid item xs={12}>
                      <Typography variant="caption" style={{ color: '#64748b', fontWeight: 700 }}>Tags</Typography>
                      <Box display="flex" flexWrap="wrap" mt={0.5} style={{ gap: 6 }}>
                        {commonTags.split(',').map((t) => <Chip key={t} size="small" label={`#${t.trim()}`} style={{ background: '#e0f2fe', color: '#0284c7', fontWeight: 800 }} />)}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions style={{ background: '#f1f5f9', padding: '16px 24px', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
          <Button variant="outlined" style={{ color: '#475569', borderColor: '#cbd5e1', fontWeight: 700 }} onClick={handleResetWizard}>
            Cancel
          </Button>
          <Box display="flex" style={{ gap: 10 }}>
            {wizardStep > 1 && (
              <Button variant="outlined" style={{ color: '#0f172a', borderColor: '#cbd5e1', fontWeight: 700 }} onClick={() => setWizardStep(wizardStep - 1)}>
                Back
              </Button>
            )}
            {wizardStep < 5 ? (
              <Button variant="contained" style={{ background: 'linear-gradient(135deg, #2563eb, #0284c7)', color: '#ffffff', fontWeight: 800, borderRadius: 10, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }} onClick={() => setWizardStep(wizardStep + 1)} disabled={isQuotaExceeded}>
                Next Step
              </Button>
            ) : (
              <Button variant="contained" style={{ background: 'linear-gradient(135deg, #2563eb, #0284c7)', color: '#ffffff', fontWeight: 800, borderRadius: 10, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }} onClick={handleStartDuplicateCheck} disabled={isCheckingDuplicates || isQuotaExceeded}>
                {isCheckingDuplicates ? 'Analyzing photos...' : `Upload ${pendingUploadQueue.length} Photos`}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Smart Duplicate Warning Dialog */}
      <Dialog open={duplicateMatches.length > 0} onClose={handleResetWizard} maxWidth="md" fullWidth>
        <DialogTitle style={{ background: '#0f172a', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <Copy size={22} color="#38bdf8" style={{ marginRight: 10 }} />
            Smart Duplicate Photo Detection
          </Box>
          <Chip
            size="small"
            label={duplicateMatches[duplicateIndex]?.matchType === 'exact' ? 'Exact Duplicate (SHA-256 Hash)' : 'Visually Similar Photo'}
            style={{
              background: duplicateMatches[duplicateIndex]?.matchType === 'exact' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
              color: duplicateMatches[duplicateIndex]?.matchType === 'exact' ? '#f87171' : '#38bdf8',
              fontWeight: 700,
              border: duplicateMatches[duplicateIndex]?.matchType === 'exact' ? '1px solid #ef4444' : '1px solid #38bdf8',
            }}
          />
        </DialogTitle>

        <DialogContent style={{ background: '#0f172a', color: '#eaf2ff', padding: 24 }}>
          <Typography variant="subtitle2" style={{ marginBottom: 16, opacity: 0.9 }}>
            {duplicateMatches[duplicateIndex]?.message || 'A matching photo was detected in your library.'} Review side-by-side details below:
          </Typography>

          <Grid container spacing={3}>
            {/* Left: Incoming New Upload */}
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" style={{ padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(56,189,248,0.3)', textAlign: 'center' }}>
                <Typography variant="overline" style={{ color: '#38bdf8', fontWeight: 800 }}>INCOMING NEW UPLOAD</Typography>
                <Box my={1.5} style={{ height: 180, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: 12, background: '#020617' }}>
                  <img
                    src={duplicateMatches[duplicateIndex]?.incoming?.selectedFile}
                    alt="Incoming upload"
                    style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Typography variant="body1" style={{ fontWeight: 700 }}>{duplicateMatches[duplicateIndex]?.incoming?.fileName}</Typography>
                <Typography variant="caption" className={classes.pageSubtitle}>
                  Size: {duplicateMatches[duplicateIndex]?.incoming?.size ? `${(duplicateMatches[duplicateIndex].incoming.size / 1024).toFixed(1)} KB` : 'Unknown'} • Upload Status: Pending
                </Typography>
              </Paper>
            </Grid>

            {/* Right: Matching Existing Photo in Gallery */}
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" style={{ padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(245,158,11,0.3)', textAlign: 'center' }}>
                <Typography variant="overline" style={{ color: '#fbbf24', fontWeight: 800 }}>EXISTING PHOTO IN GALLERY</Typography>
                <Box my={1.5} style={{ height: 180, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: 12, background: '#020617' }}>
                  <img
                    src={duplicateMatches[duplicateIndex]?.existing?.cloudinaryUrl || duplicateMatches[duplicateIndex]?.existing?.selectedFile}
                    alt="Existing in gallery"
                    style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Typography variant="body1" style={{ fontWeight: 700 }}>{duplicateMatches[duplicateIndex]?.existing?.title || duplicateMatches[duplicateIndex]?.existing?.fileName}</Typography>
                <Typography variant="caption" className={classes.pageSubtitle}>
                  Size: {duplicateMatches[duplicateIndex]?.existing?.size ? `${(duplicateMatches[duplicateIndex].existing.size / 1024).toFixed(1)} KB` : 'Unknown'} • Uploaded: {duplicateMatches[duplicateIndex]?.existing?.createdAt ? new Date(duplicateMatches[duplicateIndex].existing.createdAt).toLocaleDateString() : 'Existing'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box mt={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Typography variant="caption" style={{ opacity: 0.7 }}>
              Duplicate {duplicateIndex + 1} of {duplicateMatches.length} detected
            </Typography>

            <Box display="flex" style={{ gap: 10 }}>
              <Button variant="outlined" style={{ color: '#94a3b8', borderColor: '#475569' }} onClick={handleResetWizard}>
                Cancel Upload
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleSkipDuplicate}>
                Skip Duplicate
              </Button>
              <Button variant="contained" color="primary" className={classes.glowButton} onClick={handleUploadAnyway}>
                Upload Anyway
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

const PhotoCard = ({ photo, index, selected, setSelected, openViewer, notify, userId, darkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const [imgError, setImgError] = useState(false);
  const favorite = (photo.favoriteBy || []).map(String).includes(String(userId));
  const checked = selected.includes(photo._id);
  const imageSrc = photo.cloudinaryUrl || photo.selectedFile || photo.url || photo.path;
  const fileSize = photo.size ? `${Math.max(photo.size / 1024, 1).toFixed(1)} KB` : 'Unknown size';
  const resolution = photo.width && photo.height ? `${photo.width}x${photo.height}` : 'Unknown resolution';
  const isOwner = String(photo.owner?._id || photo.owner || '') === String(userId || '');
  const allowReshare = photo.allowReshare !== false;
  const canShare = isOwner || allowReshare;

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [allowReshareToggle, setAllowReshareToggle] = useState(photo.allowReshare !== false);

  const editPhoto = async () => {
    const title = window.prompt('Photo title', photo.title || '');
    if (title === null) return;
    const message = window.prompt('Description', photo.message || '');
    if (message === null) return;
    await dispatch(updatePost(photo._id, { ...photo, title, message }));
    notify('Photo details updated.');
  };
  const movePhoto = async () => {
    const album = window.prompt('Paste destination album ID');
    if (!album) return;
    await dispatch(batchUpdate({ ids: [photo._id], action: 'addToAlbum', album }));
    notify('Photo moved to album.');
  };
  const [shareOpen, setShareOpen] = useState(false);
  const [shareQuery, setShareQuery] = useState('');
  const [shareResults, setShareResults] = useState([]);
  const [shareSelected, setShareSelected] = useState([]);
  const [shareMessage, setShareMessage] = useState('');
  const [shareExpiry, setShareExpiry] = useState('never');
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (!shareQuery) return;
    const t = setTimeout(() => {
      api.searchUsers(shareQuery).then(({ data }) => setShareResults(data)).catch(() => setShareResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [shareQuery]);

  const sendShareToUsers = async () => {
    try {
      const expiresAt = shareExpiry === 'never' ? null : new Date(Date.now() + ({ hour: 60 * 60 * 1000, day: 24 * 60 * 60 * 1000, week: 7 * 24 * 60 * 60 * 1000 }[shareExpiry])).toISOString();
      if (isOwner) {
        await dispatch(sharePost(photo._id, { allowReshare: allowReshareToggle }));
      }
      const { data } = await api.sharePostToUsers(photo._id, shareSelected, { message: shareMessage, expiresAt });
      if (data.post) dispatch({ type: 'UPDATE', payload: data.post });
      setShareOpen(false); setShareQuery(''); setShareResults([]); setShareSelected([]); setShareMessage(''); setShareExpiry('never');
      notify('Shared with selected users.');
    } catch (err) { notify(err.response?.data?.message || 'Failed to share.'); }
  };

  return (
    <motion.div className={classes.photoCard} layout whileHover={{ y: -6 }} transition={{ duration: 0.18 }}>
      {imageSrc && !imgError ? (
        <img
          className={classes.photoImage}
          src={imageSrc}
          alt={photo.title || 'Photo'}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{ height: 230 + ((index % 4) * 46), objectFit: 'cover' }}
        />
      ) : (
        <Box
          className={classes.photoImage}
          style={{
            height: 230 + ((index % 4) * 46),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            color: '#94a3b8',
            padding: 16,
            textAlign: 'center',
          }}
        >
          <Image size={36} color="#38bdf8" style={{ opacity: 0.8, marginBottom: 8 }} />
          <Typography variant="body2" style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }} noWrap>
            {photo.title || photo.fileName || 'Photo Preview'}
          </Typography>
          <Typography variant="caption" style={{ color: '#94a3b8', marginTop: 4 }}>
            {imgError ? 'Image load error' : 'No preview available'}
          </Typography>
        </Box>
      )}
      <Box className={classes.photoOverlay}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Checkbox checked={checked} onChange={(e) => setSelected(e.target.checked ? [...selected, photo._id] : selected.filter((id) => id !== photo._id))} style={{ color: '#fff' }} />
          <Box>
            <IconButton className={classes.quickIcon} onClick={() => openViewer(index)}><Eye size={18} /></IconButton>
            <IconButton className={classes.quickIcon} onClick={() => dispatch(favoritePost(photo._id))}><Heart size={18} fill={favorite ? '#fb7185' : 'none'} /></IconButton>
            <IconButton className={classes.quickIcon} onClick={async () => { const data = await dispatch(downloadPost(photo._id)); triggerDownload(data.url, data.fileName); notify('Download complete.'); }}><Download size={18} /></IconButton>
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" style={{ fontWeight: 900 }}>{photo.title}</Typography>
          <Typography variant="body2">{photo.creator || 'Owner'} - {new Date(photo.createdAt).toLocaleDateString()}</Typography>
          <Box mt={1} display="flex" flexWrap="wrap" style={{ gap: 6 }}>
            {(photo.tags || []).slice(0, 3).map((tag) => <span key={tag} className={classes.badge}>#{tag}</span>)}
          </Box>
          <Box mt={1.5} display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" style={{ gap: 10 }}>
              <Typography variant="caption"><Eye size={13} /> {photo.viewCount || 0}</Typography>
              <Typography variant="caption"><Heart size={13} /> {photo.likeCount || 0}</Typography>
              <Typography variant="caption"><Download size={13} /> {photo.downloadCount || 0}</Typography>
              <Typography variant="caption"><MessageCircle size={13} /> {(photo.comments || []).length}</Typography>
            </Box>
            <Box>
              <IconButton className={classes.quickIcon} onClick={() => dispatch(likePost(photo._id))}><Zap size={17} /></IconButton>
              {isOwner && <IconButton className={classes.quickIcon} onClick={editPhoto} title="Edit Photo"><Edit3 size={17} /></IconButton>}
              {isOwner && <IconButton className={classes.quickIcon} onClick={movePhoto} title="Move to Album"><Move size={17} /></IconButton>}
              {isOwner && <IconButton className={classes.quickIcon} onClick={() => dispatch(archivePost(photo._id, true))} title="Archive"><Archive size={17} /></IconButton>}
              <Tooltip title={canShare ? "Create share link" : "Resharing prohibited by owner"}>
                <span>
                  <IconButton
                    className={classes.quickIcon}
                    disabled={!canShare}
                    onClick={async () => {
                      try {
                        const data = await dispatch(sharePost(photo._id, { visibility: 'shared', allowReshare: allowReshareToggle }));
                        setShareUrl(data.shareUrl);
                        setShareMenuOpen(true);
                      } catch (err) {
                        notify(err.response?.data?.message || 'Failed to create share link.');
                      }
                    }}
                  >
                    <Share2 size={17} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={canShare ? "Share with users" : "Resharing prohibited by owner"}>
                <span>
                  <IconButton className={classes.quickIcon} disabled={!canShare} onClick={() => setShareOpen(true)}>
                    <Copy size={17} />
                  </IconButton>
                </span>
              </Tooltip>
              {isOwner ? (
                <IconButton className={classes.quickIcon} onClick={() => dispatch(deletePost(photo._id))} title="Move to Trash">
                  <Trash2 size={17} />
                </IconButton>
              ) : (
                <IconButton className={classes.quickIcon} onClick={() => setRemoveDialogOpen(true)} title="Remove from Shared with Me">
                  <UserMinus size={17} style={{ color: '#ef4444' }} />
                </IconButton>
              )}
            </Box>
          </Box>
          <Typography variant="caption">{resolution} - {fileSize} - Favorites {(photo.favoriteBy || []).length}</Typography>
        </Box>
      </Box>
      <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)}>
        <DialogTitle style={{ fontWeight: 700 }}>Remove from Shared with Me?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to remove <strong>"{photo.title || photo.fileName || 'this photo'}"</strong> from your Shared with Me list?
          </Typography>
          <Typography variant="caption" style={{ display: 'block', marginTop: 8, opacity: 0.8 }}>
            This will revoke your access to this photo, but will NOT delete the original owner's photo or remove it from their gallery.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={async () => {
              try {
                await dispatch(revokePhotoShare(photo._id, userId));
                notify('Photo removed from Shared with Me.');
              } catch (err) {
                notify(err.response?.data?.message || 'Failed to remove photo access.');
              } finally {
                setRemoveDialogOpen(false);
              }
            }}
          >
            Remove Access
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)}>
        <DialogTitle>Share "{photo.title}" with users</DialogTitle>
        <DialogContent>
          <Typography variant="caption" style={{ display: 'block', marginBottom: 8, opacity: 0.8 }}>
            Original Owner: <strong>{photo.creator || 'Owner'}</strong>
          </Typography>
          <TextField fullWidth label="Search users" value={shareQuery} onChange={(e) => setShareQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }} />
          <TextField fullWidth multiline rows={2} style={{ marginTop: 12 }} label="Message (optional)" value={shareMessage} onChange={(e) => setShareMessage(e.target.value)} />
          <TextField fullWidth select style={{ marginTop: 12 }} label="Access expires" value={shareExpiry} onChange={(e) => setShareExpiry(e.target.value)}><MenuItem value="hour">1 hour</MenuItem><MenuItem value="day">1 day</MenuItem><MenuItem value="week">7 days</MenuItem><MenuItem value="never">Never</MenuItem></TextField>
          {isOwner && (
            <FormControlLabel
              control={<Checkbox checked={allowReshareToggle} onChange={(e) => setAllowReshareToggle(e.target.checked)} color="primary" />}
              label="Allow recipients to reshare this photo"
              style={{ marginTop: 12 }}
            />
          )}
          <Box mt={2}>
            {shareResults.map((u) => (
              <Box key={u._id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center"><Avatar src={u.avatar} />
                  <Box ml={1}><Typography>{u.name}</Typography><Typography className={classes.pageSubtitle}>@{u.username || u.email}</Typography></Box>
                </Box>
                <Button onClick={() => setShareSelected((prev) => prev.includes(u._id) ? prev.filter((id) => id !== u._id) : [...prev, u._id])}>{shareSelected.includes(u._id) ? 'Remove' : 'Add'}</Button>
              </Box>
            ))}
          </Box>
          <Box mt={2}><Button className={classes.glowButton} onClick={sendShareToUsers}>Send</Button></Box>
        </DialogContent>
      </Dialog>
      <Dialog open={shareMenuOpen} onClose={() => setShareMenuOpen(false)}>
        <DialogTitle>Share link</DialogTitle>
        <DialogContent>
          <TextField fullWidth value={shareUrl} InputProps={{ endAdornment: <Button onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(shareUrl); notify('Link copied.'); }}>Copy</Button> }} />
          <Box mt={2} display="flex" style={{ gap: 8 }}>
            <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank')}>WhatsApp</Button>
            <Button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`, '_blank')}>Telegram</Button>
            <Button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}>Facebook</Button>
            <Button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareUrl)}`, '_blank')}>X</Button>
            <Button onClick={() => window.open(`mailto:?subject=${encodeURIComponent(photo.title)}&body=${encodeURIComponent(shareUrl)}`, '_blank')}>Email</Button>
            <Button onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}`, '_blank')}>QR</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const Gallery = ({ notify, darkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const routerHistory = useHistory();
  const { data, loading, filters, total, albums } = useSelector((state) => state.posts);
  const userId = useSelector((state) => state.auth.authData?.result?._id);
  const [selected, setSelected] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const searchTimer = useRef(null);
  const [globalResults, setGlobalResults] = useState({ media: [], albums: [], users: [] });
  const [searchViewerIndex, setSearchViewerIndex] = useState(-1);
  const [searchViewerPhotos, setSearchViewerPhotos] = useState([]);
  const activeViewerPhotos = searchViewerPhotos.length > 0 ? searchViewerPhotos : data;
  const activeViewerIndex = searchViewerIndex >= 0 ? searchViewerIndex : viewerIndex;

  useEffect(() => {
    dispatch(loadAlbums());
    dispatch(getPosts());
  }, [dispatch]);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const applyFilters = (next) => {
    dispatch(setFilters(next));
    dispatch(getPosts(next));
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchInput(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      applyFilters({ search: q });
      if (q && q.trim()) {
        api.searchGlobal(q).then(({ data: searchData }) => setGlobalResults(searchData)).catch(() => setGlobalResults({ media: [], albums: [], users: [] }));
      } else {
        setGlobalResults({ media: [], albums: [], users: [] });
      }
    }, 300);
  };

  const clearSearch = () => {
    setSearchInput('');
    setGlobalResults({ media: [], albums: [], users: [] });
    applyFilters({ search: '' });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setGlobalResults({ media: [], albums: [], users: [] });
    applyFilters({
      search: '',
      album: 'all',
      fileType: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      favorite: 'all',
      privacy: 'all',
      filter: '',
      sort: 'newest',
    });
  };

  const activeFilterCount = [
    filters.search && filters.search.trim() ? 'search' : '',
    filters.album && filters.album !== 'all' ? 'album' : '',
    filters.fileType && filters.fileType !== 'all' ? 'fileType' : '',
    filters.dateRange && filters.dateRange !== 'all' ? 'dateRange' : '',
    filters.favorite && filters.favorite !== 'all' ? 'favorite' : '',
    filters.privacy && filters.privacy !== 'all' ? 'privacy' : '',
    filters.filter ? 'filter' : '',
  ].filter(Boolean).length;

  const batch = async (action) => {
    await Promise.all(selected.map((id) => {
      if (action === 'delete') return dispatch(deletePost(id));
      if (action === 'archive') return dispatch(archivePost(id, true));
      if (action === 'restore') return dispatch(restorePost(id));
      if (action === 'permanent') return dispatch(permanentDeletePost(id));
      return Promise.resolve();
    }));
    setSelected([]);
    notify('Batch operation completed.');
  };

  const getAlbumLabel = () => {
    if (filters.album === 'no_album') return 'Uncategorized';
    const found = (albums || []).find((a) => a._id === filters.album);
    return found ? `Album: ${found.name}` : 'Album Filter';
  };

  const getFileTypeLabel = () => {
    if (filters.fileType === 'jpeg' || filters.fileType === 'jpg' || filters.fileType === 'image/jpeg') return 'Type: JPEG';
    if (filters.fileType === 'png' || filters.fileType === 'image/png') return 'Type: PNG';
    if (filters.fileType === 'webp' || filters.fileType === 'image/webp') return 'Type: WebP';
    if (filters.fileType === 'other') return 'Type: Other Formats';
    return `Type: ${filters.fileType}`;
  };

  const getDateLabel = () => {
    if (filters.dateRange === 'today') return 'Date: Today';
    if (filters.dateRange === 'last7') return 'Date: Last 7 Days';
    if (filters.dateRange === 'last30') return 'Date: Last 30 Days';
    if (filters.dateRange === 'custom') return `Date: ${filters.startDate || '...'} to ${filters.endDate || '...'}`;
    return 'Date Filter';
  };

  return (
    <>
      <PageHeader darkMode={darkMode} title="Photos" subtitle="A polished Google Photos-style memory workspace with advanced search & filters." action={<Badge badgeContent={total} color="primary"><Image /></Badge>} />
      <Grid container spacing={3}>
        <Grid item xs={12}><UploadPanel notify={notify} darkMode={darkMode} /></Grid>
        <Grid item xs={12}>
          <Paper className={classes.premiumPanel} style={{ padding: 18 }} elevation={0}>
            <Grid container spacing={2} alignItems="center">
              {/* Search Bar */}
              <Grid item xs={12} md={5}>
                <div style={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Search by filename, description, tags, album..."
                    value={searchInput}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={18} color={darkMode ? '#94a3b8' : '#64748b'} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {loading && <CircularProgress size={16} style={{ marginRight: 6 }} />}
                          {searchInput && (
                            <IconButton size="small" onClick={clearSearch} title="Clear search">
                              <X size={16} />
                            </IconButton>
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                  {(globalResults.media.length || globalResults.albums.length || globalResults.users.length) && filters.search && filters.search.trim() !== '' && (
                    <Paper style={{ position: 'absolute', top: 48, left: 0, right: 0, zIndex: 50, maxHeight: 360, overflow: 'auto', padding: 12 }}>
                      {globalResults.users && globalResults.users.length > 0 && (
                        <Box mb={1}>
                          <Typography variant="subtitle2">Users</Typography>
                          {globalResults.users.slice(0, 6).map((u) => (
                            <Box key={u._id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                              <Box display="flex" alignItems="center">
                                <Avatar src={u.avatar}>{u.name?.[0]}</Avatar>
                                <Box ml={1}><Typography>{u.name}</Typography><Typography className={classes.pageSubtitle}>@{u.username || u.email}</Typography></Box>
                              </Box>
                              <Button onClick={() => routerHistory.push(`/users?open=${u._id}`)}>Open</Button>
                            </Box>
                          ))}
                        </Box>
                      )}
                      {globalResults.albums && globalResults.albums.length > 0 && (
                        <Box mb={1}>
                          <Typography variant="subtitle2">Albums</Typography>
                          {globalResults.albums.slice(0, 6).map((a) => (
                            <Box key={a._id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                              <Box>
                                <Typography>{a.name}</Typography>
                                <Typography className={classes.pageSubtitle}>{a.description}</Typography>
                              </Box>
                              <Button onClick={() => routerHistory.push(`/albums/${a._id}`)}>Open</Button>
                            </Box>
                          ))}
                        </Box>
                      )}
                      {globalResults.media && globalResults.media.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2">Media</Typography>
                          {globalResults.media.slice(0, 8).map((m) => (
                            <Box key={m._id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                              <Box display="flex" alignItems="center" style={{ cursor: 'pointer' }} onClick={() => { setSearchViewerPhotos(globalResults.media); setSearchViewerIndex(globalResults.media.findIndex((it) => it._id === m._id)); }}>
                                <img src={m.cloudinaryUrl || m.selectedFile} alt={m.title} style={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 8 }} />
                                <Box ml={1}><Typography>{m.title}</Typography><Typography className={classes.pageSubtitle}>{m.fileName || (m.tags || []).slice(0,3).join(', ')}</Typography></Box>
                              </Box>
                              <Button onClick={() => { applyFilters({ search: m.title || m.fileName || '' }); routerHistory.push('/'); }}>Open</Button>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Paper>
                  )}
                </div>
              </Grid>

              {/* Filters Panel Toggle Button */}
              <Grid item xs={6} md={2}>
                <Button
                  fullWidth
                  variant={showFiltersPanel ? 'contained' : 'outlined'}
                  color={showFiltersPanel ? 'primary' : 'default'}
                  size="medium"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  startIcon={<SlidersHorizontal size={18} />}
                  style={{ textTransform: 'none', fontWeight: 600, height: 40 }}
                >
                  Filters {activeFilterCount > 0 && <Chip label={activeFilterCount} size="small" color="secondary" style={{ marginLeft: 6, height: 20 }} />}
                </Button>
              </Grid>

              {/* Sort Dropdown */}
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  variant="outlined"
                  label="Sort By"
                  value={filters.sort || 'newest'}
                  onChange={(e) => applyFilters({ sort: e.target.value })}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="nameAsc">Filename A–Z</MenuItem>
                  <MenuItem value="nameDesc">Filename Z–A</MenuItem>
                  <MenuItem value="largest">Largest File First</MenuItem>
                  <MenuItem value="smallest">Smallest File First</MenuItem>
                  <MenuItem value="mostViewed">Most Viewed</MenuItem>
                  <MenuItem value="mostLiked">Most Liked</MenuItem>
                  <MenuItem value="mostDownloaded">Most Downloaded</MenuItem>
                </TextField>
              </Grid>

              {/* Batch Actions */}
              <Grid item xs={12} md={2}>
                <Box display="flex" style={{ gap: 4 }}>
                  <Button size="small" disabled={!selected.length} startIcon={<Archive size={14} />} onClick={() => batch('archive')}>Archive</Button>
                  <Button size="small" disabled={!selected.length} startIcon={<Trash2 size={14} />} onClick={() => batch('delete')}>Delete</Button>
                  <Button size="small" disabled={!selected.length} startIcon={<ChevronLeft size={14} />} onClick={() => batch('restore')}>Restore</Button>
                </Box>
              </Grid>
            </Grid>

            {/* Expandable Filters Panel */}
            {showFiltersPanel && (
              <Box mt={2} pt={2} style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}` }}>
                <Grid container spacing={2}>
                  {/* Album Filter */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      variant="outlined"
                      label="Album"
                      value={filters.album || 'all'}
                      onChange={(e) => applyFilters({ album: e.target.value })}
                    >
                      <MenuItem value="all">All Albums</MenuItem>
                      <MenuItem value="no_album">Uncategorized (No Album)</MenuItem>
                      {(albums || []).map((a) => (
                        <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* File Type Filter */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      variant="outlined"
                      label="File Type"
                      value={filters.fileType || 'all'}
                      onChange={(e) => applyFilters({ fileType: e.target.value })}
                    >
                      <MenuItem value="all">All File Types</MenuItem>
                      <MenuItem value="jpeg">JPEG / JPG</MenuItem>
                      <MenuItem value="png">PNG</MenuItem>
                      <MenuItem value="webp">WebP</MenuItem>
                      <MenuItem value="other">Other Image Types</MenuItem>
                    </TextField>
                  </Grid>

                  {/* Upload Date Filter */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      variant="outlined"
                      label="Upload Date"
                      value={filters.dateRange || 'all'}
                      onChange={(e) => applyFilters({ dateRange: e.target.value })}
                    >
                      <MenuItem value="all">All Dates</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="last7">Last 7 Days</MenuItem>
                      <MenuItem value="last30">Last 30 Days</MenuItem>
                      <MenuItem value="custom">Custom Date Range</MenuItem>
                    </TextField>
                  </Grid>

                  {/* Favorites Filter */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      variant="outlined"
                      label="Favorites"
                      value={filters.favorite || 'all'}
                      onChange={(e) => applyFilters({ favorite: e.target.value })}
                    >
                      <MenuItem value="all">All Photos</MenuItem>
                      <MenuItem value="favorites">Favorites Only</MenuItem>
                      <MenuItem value="non_favorites">Non-Favorites</MenuItem>
                    </TextField>
                  </Grid>

                  {/* Privacy Filter */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      variant="outlined"
                      label="Privacy & Visibility"
                      value={filters.privacy || 'all'}
                      onChange={(e) => applyFilters({ privacy: e.target.value })}
                    >
                      <MenuItem value="all">All Authorized</MenuItem>
                      <MenuItem value="private">Private Only</MenuItem>
                      <MenuItem value="shared">Shared Only</MenuItem>
                      <MenuItem value="public">Public Only</MenuItem>
                    </TextField>
                  </Grid>

                  {/* Gallery View Status Filter */}
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      variant="outlined"
                      label="Status Category"
                      value={filters.filter || ''}
                      onChange={(e) => applyFilters({ filter: e.target.value, includeDeleted: e.target.value === 'trash' })}
                    >
                      <MenuItem value="">Active Gallery</MenuItem>
                      <MenuItem value="favorites">Favorites</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                      <MenuItem value="trash">Trash</MenuItem>
                    </TextField>
                  </Grid>

                  {/* Custom Date Range Inputs */}
                  {filters.dateRange === 'custom' && (
                    <>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          variant="outlined"
                          label="Start Date"
                          InputLabelProps={{ shrink: true }}
                          value={filters.startDate || ''}
                          onChange={(e) => applyFilters({ startDate: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          variant="outlined"
                          label="End Date"
                          InputLabelProps={{ shrink: true }}
                          value={filters.endDate || ''}
                          onChange={(e) => applyFilters({ endDate: e.target.value })}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}

            {/* Active Filter Chips & Summary */}
            {activeFilterCount > 0 && (
              <Box mt={2} display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
                <Typography variant="caption" style={{ fontWeight: 600, color: darkMode ? '#94a3b8' : '#64748b' }}>
                  Active Filters:
                </Typography>

                {filters.search && (
                  <Chip size="small" label={`Search: "${filters.search}"`} onDelete={clearSearch} color="primary" variant="outlined" />
                )}
                {filters.album && filters.album !== 'all' && (
                  <Chip size="small" label={getAlbumLabel()} onDelete={() => applyFilters({ album: 'all' })} color="primary" variant="outlined" />
                )}
                {filters.fileType && filters.fileType !== 'all' && (
                  <Chip size="small" label={getFileTypeLabel()} onDelete={() => applyFilters({ fileType: 'all' })} color="primary" variant="outlined" />
                )}
                {filters.dateRange && filters.dateRange !== 'all' && (
                  <Chip size="small" label={getDateLabel()} onDelete={() => applyFilters({ dateRange: 'all', startDate: '', endDate: '' })} color="primary" variant="outlined" />
                )}
                {filters.favorite && filters.favorite !== 'all' && (
                  <Chip size="small" label={filters.favorite === 'favorites' ? 'Favorites Only' : 'Non-Favorites'} onDelete={() => applyFilters({ favorite: 'all' })} color="primary" variant="outlined" />
                )}
                {filters.privacy && filters.privacy !== 'all' && (
                  <Chip size="small" label={`Privacy: ${filters.privacy}`} onDelete={() => applyFilters({ privacy: 'all' })} color="primary" variant="outlined" />
                )}
                {filters.filter && (
                  <Chip size="small" label={`Category: ${filters.filter}`} onDelete={() => applyFilters({ filter: '' })} color="primary" variant="outlined" />
                )}

                <Button size="small" onClick={clearAllFilters} style={{ textTransform: 'none', color: '#ef4444', fontWeight: 600 }}>
                  Clear All Filters
                </Button>
              </Box>
            )}

            {/* Result Counter */}
            <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" style={{ color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 500 }}>
                {loading ? 'Searching photos...' : `Showing ${total} ${total === 1 ? 'photo' : 'photos'}`}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Photo Gallery Grid */}
        <Grid item xs={12}>
          {loading ? (
            <Grid container spacing={2}>{[0, 1, 2, 3, 4, 5].map((item) => <Grid item xs={12} sm={6} md={4} key={item}><div className={classes.skeleton} /></Grid>)}</Grid>
          ) : data.length === 0 ? (
            <Paper style={{ padding: 48, textAlign: 'center', background: darkMode ? '#1e293b' : '#ffffff', borderRadius: 16 }}>
              <Search size={48} color={darkMode ? '#64748b' : '#94a3b8'} style={{ marginBottom: 16 }} />
              <Typography variant="h6" style={{ fontWeight: 600, color: darkMode ? '#f8fafc' : '#0f172a' }}>
                No photos found
              </Typography>
              <Typography variant="body2" style={{ color: darkMode ? '#94a3b8' : '#64748b', marginTop: 4, marginBottom: 20 }}>
                {activeFilterCount > 0 ? 'No photos match your active search terms or filters. Try adjusting your search criteria.' : 'Your gallery is empty. Upload photos to get started!'}
              </Typography>
              {activeFilterCount > 0 && (
                <Button variant="contained" color="primary" onClick={clearAllFilters} style={{ textTransform: 'none', borderRadius: 8 }}>
                  Clear All Filters
                </Button>
              )}
            </Paper>
          ) : (
            <Box className={classes.masonry}>
              {data.map((photo, index) => <PhotoCard key={photo._id} photo={photo} index={index} selected={selected} setSelected={setSelected} openViewer={setViewerIndex} notify={notify} userId={userId} darkMode={darkMode} />)}
            </Box>
          )}
        </Grid>
      </Grid>
      <ImageViewer photos={activeViewerPhotos} index={activeViewerIndex} setIndex={(nextIndex) => { setViewerIndex(nextIndex); setSearchViewerIndex(nextIndex); }} notify={notify} darkMode={darkMode} />
    </>
  );
};

const ImageViewer = ({ photos, index, setIndex, notify, darkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [zoom, setZoom] = useState(1);
  const [comment, setComment] = useState('');
  const [slideshow, setSlideshow] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [imgError, setImgError] = useState(false);

  const current = photos[index];
  const next = useCallback(() => { setImgError(false); setIndex((prev) => (prev + 1) % photos.length); }, [photos.length, setIndex]);
  const previous = useCallback(() => { setImgError(false); setIndex((prev) => (prev <= 0 ? photos.length - 1 : prev - 1)); }, [photos.length, setIndex]);

  useEffect(() => {
    setZoom(1);
    setImgError(false);
  }, [index]);

  useEffect(() => {
    if (index < 0) return undefined;
    const handler = (event) => {
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') previous();
      if (event.key === 'Escape') setIndex(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, next, previous, setIndex]);

  useEffect(() => {
    if (!slideshow || index < 0) return undefined;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [slideshow, index, next]);

  if (!current) return null;
  const imageSrc = current.selectedFile || current.cloudinaryUrl;

  const saveTransform = async (payload) => {
    await dispatch(updateTransformations(current._id, { ...(current.transformations || {}), ...payload }));
    notify('Image edit saved.');
  };

  return (
    <Dialog fullScreen open={index >= 0} onClose={() => setIndex(-1)} PaperProps={{ className: classes.viewerPaper }}>
      <DialogTitle style={{ padding: '12px 24px', background: '#0a1221', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" style={{ overflow: 'hidden', marginRight: 16 }}>
            <Typography variant="h6" style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#f8fbff' }}>
              {current.title || current.fileName || 'Photo Viewer'}
            </Typography>
            <Chip size="small" label={current.visibility || 'private'} style={{ marginLeft: 12, background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 700 }} />
          </Box>
          <Box display="flex" alignItems="center" style={{ gap: 4 }}>
            <Tooltip title="Toggle Details Panel">
              <IconButton style={{ color: showDetails ? '#38bdf8' : '#fff' }} onClick={() => setShowDetails(!showDetails)}>
                <SlidersHorizontal size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton style={{ color: '#fff' }} onClick={async () => { const data = await dispatch(downloadPost(current._id)); triggerDownload(data.url, data.fileName); notify('Download complete.'); }}>
                <Download size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Favorite">
              <IconButton style={{ color: '#fff' }} onClick={() => dispatch(favoritePost(current._id))}>
                <Star size={20} fill={(current.favoriteBy || []).length > 0 ? '#fb7185' : 'none'} color={(current.favoriteBy || []).length > 0 ? '#fb7185' : '#fff'} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton style={{ color: '#fff' }} onClick={async () => { const data = await dispatch(sharePost(current._id, { visibility: 'shared' })); if (navigator.clipboard) navigator.clipboard.writeText(data.shareUrl); notify(`Public link copied: ${data.shareUrl}`); }}>
                <Share2 size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Move to Trash">
              <IconButton style={{ color: '#fff' }} onClick={() => { dispatch(deletePost(current._id)); setIndex(-1); notify('Photo moved to trash.'); }}>
                <Trash2 size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close Viewer (Esc)">
              <IconButton style={{ color: '#fff', marginLeft: 8 }} onClick={() => setIndex(-1)}>
                <X size={22} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent style={{ padding: 0, display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden', height: 'calc(100vh - 64px)' }}>
        <Box className={classes.viewerStage}>
          <IconButton style={{ position: 'absolute', left: 16, zIndex: 10, background: 'rgba(15, 23, 42, 0.65)', color: '#fff', backdropFilter: 'blur(8px)' }} onClick={previous}>
            <ChevronLeft size={24} />
          </IconButton>

          {imgError ? (
            <Box textAlign="center" p={4} style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 16, border: '1px solid #ef4444' }}>
              <Image size={48} color="#f87171" />
              <Typography variant="h6" style={{ marginTop: 12, color: '#f87171' }}>Unable to load image preview</Typography>
              <Typography variant="caption" style={{ opacity: 0.8 }}>File URL may be unreachable or corrupted.</Typography>
            </Box>
          ) : (
            <motion.img
              className={classes.viewerImage}
              alt={current.title}
              src={imageSrc}
              onError={() => setImgError(true)}
              style={{ transform: `scale(${zoom}) rotate(${current.transformations?.rotation || 0}deg)` }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}

          <IconButton style={{ position: 'absolute', right: 16, zIndex: 10, background: 'rgba(15, 23, 42, 0.65)', color: '#fff', backdropFilter: 'blur(8px)' }} onClick={next}>
            <ChevronRight size={24} />
          </IconButton>

          <Box style={{ position: 'absolute', bottom: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(15, 23, 42, 0.85)', padding: '6px 16px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
            <IconButton size="small" style={{ color: '#fff' }} onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}><ZoomOut size={18} /></IconButton>
            <Typography variant="caption" style={{ fontWeight: 700, color: '#38bdf8', minWidth: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</Typography>
            <IconButton size="small" style={{ color: '#fff' }} onClick={() => setZoom(Math.min(3, zoom + 0.2))}><ZoomIn size={18} /></IconButton>
            <Divider orientation="vertical" flexItem style={{ margin: '4px 6px', background: 'rgba(255,255,255,0.2)' }} />
            <IconButton size="small" style={{ color: '#fff' }} onClick={() => saveTransform({ rotation: ((current.transformations?.rotation || 0) + 90) % 360 })}><RotateCw size={18} /></IconButton>
            <IconButton size="small" style={{ color: slideshow ? '#38bdf8' : '#fff' }} onClick={() => setSlideshow(!slideshow)}><Play size={18} fill={slideshow ? '#38bdf8' : 'none'} /></IconButton>
            <Typography variant="caption" style={{ opacity: 0.7, marginLeft: 8 }}>{index + 1} / {photos.length}</Typography>
          </Box>
        </Box>

        {showDetails && (
          <Box className={classes.viewerSidebar}>
            <Typography variant="h6" style={{ fontWeight: 800, marginBottom: 12 }}>Photo Details</Typography>
            <Box display="flex" flexDirection="column" style={{ gap: 8, fontSize: '0.9rem' }}>
              <Typography variant="body2"><strong>Title:</strong> {current.title || 'Untitled'}</Typography>
              <Typography variant="body2" style={{ wordBreak: 'break-all' }}><strong>Filename:</strong> {current.fileName || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Owner:</strong> {current.creator || 'You'}</Typography>
              <Typography variant="body2"><strong>Visibility:</strong> {current.visibility}</Typography>
              <Typography variant="body2"><strong>File Format:</strong> {current.fileType || 'Image'}</Typography>
              <Typography variant="body2"><strong>Uploaded:</strong> {new Date(current.createdAt).toLocaleString()}</Typography>
              <Typography variant="body2"><strong>Modified:</strong> {new Date(current.updatedAt || current.createdAt).toLocaleString()}</Typography>
              <Typography variant="body2"><strong>Size:</strong> {current.size ? `${(current.size / 1024).toFixed(1)} KiB (${(current.size / (1024 * 1024)).toFixed(2)} MiB)` : 'Unknown'}</Typography>
              <Typography variant="body2"><strong>Resolution:</strong> {current.width && current.height ? `${current.width} × ${current.height} px` : 'Unknown'}</Typography>
              <Typography variant="body2"><strong>Folder:</strong> {current.folder || 'library'}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {current.isDeleted ? 'In Trash' : 'Active'}</Typography>
              <Box display="flex" style={{ gap: 16, marginTop: 4 }}>
                <Typography variant="caption"><Eye size={13} /> {current.viewCount || 0} views</Typography>
                <Typography variant="caption"><Heart size={13} /> {current.likeCount || 0} likes</Typography>
                <Typography variant="caption"><Download size={13} /> {current.downloadCount || 0} downloads</Typography>
              </Box>
            </Box>

            <Divider style={{ margin: '16px 0', background: 'rgba(255,255,255,0.12)' }} />

            <Typography variant="subtitle2" style={{ fontWeight: 800, marginBottom: 8 }}>Quick Share Links</Typography>
            <Box display="flex" flexWrap="wrap" style={{ gap: 6 }}>
              <Button size="small" variant="outlined" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} startIcon={<Copy size={13} />} onClick={async () => { const data = await dispatch(sharePost(current._id, { visibility: 'shared' })); if (navigator.clipboard) navigator.clipboard.writeText(data.shareUrl); notify('Share link copied.'); }}>Copy Link</Button>
              <Button size="small" variant="outlined" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} startIcon={<Send size={13} />} onClick={async () => { const data = await dispatch(sharePost(current._id, { visibility: 'shared' })); window.open(`https://t.me/share/url?url=${encodeURIComponent(data.shareUrl)}`, '_blank'); }}>Telegram</Button>
              <Button size="small" variant="outlined" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} startIcon={<MessageCircle size={13} />} onClick={async () => { const data = await dispatch(sharePost(current._id, { visibility: 'shared' })); window.open(`https://wa.me/?text=${encodeURIComponent(data.shareUrl)}`, '_blank'); }}>WhatsApp</Button>
              <Button size="small" variant="outlined" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} startIcon={<Mail size={13} />} onClick={async () => { const data = await dispatch(sharePost(current._id, { visibility: 'shared' })); window.location.href = `mailto:?subject=${encodeURIComponent(current.title)}&body=${encodeURIComponent(data.shareUrl)}`; }}>Email</Button>
            </Box>

            <Divider style={{ margin: '16px 0', background: 'rgba(255,255,255,0.12)' }} />

            <Typography variant="subtitle2" style={{ fontWeight: 800, marginBottom: 8 }}>Comments ({(current.comments || []).length})</Typography>
            <Box style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 12 }}>
              {(current.comments || []).map((item) => (
                <Box key={item._id} display="flex" alignItems="flex-start" mb={1} style={{ background: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 8 }}>
                  <Box flexGrow={1} style={{ wordBreak: 'break-word' }}>
                    <Typography variant="body2" style={{ fontWeight: 700 }}>{item.userName}</Typography>
                    <Typography variant="body2" style={{ opacity: 0.9 }}>{item.text}</Typography>
                    <Typography variant="caption" style={{ opacity: 0.6 }}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                  </Box>
                  <IconButton size="small" style={{ color: '#fff', opacity: 0.7 }} onClick={() => { const text = window.prompt('Edit comment', item.text); if (text) dispatch(updateComment(current._id, item._id, { text })); }}><Edit3 size={13} /></IconButton>
                  <IconButton size="small" style={{ color: '#fff', opacity: 0.7 }} onClick={() => dispatch(deleteComment(current._id, item._id))}><Trash2 size={13} /></IconButton>
                </Box>
              ))}
            </Box>

            <Box display="flex" style={{ gap: 8 }}>
              <TextField fullWidth size="small" variant="outlined" placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button variant="contained" className={classes.glowButton} onClick={async () => { if (comment.trim()) { await dispatch(addComment(current._id, { text: comment })); setComment(''); } }}>Post</Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Dashboard = ({ notify, darkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state.posts.dashboard);
  const [viewerIndex, setViewerIndex] = useState(-1);

  useEffect(() => { dispatch(loadDashboard()); }, [dispatch]);
  const stats = dashboard ? [
    ['Total Photos', dashboard.totalPhotos, Camera],
    ['Albums', dashboard.albums, Album],
    ['Storage Used', `${Math.round((dashboard.storage || 0) / 1024)} KB`, Cloud],
    ['Favorites', dashboard.statistics?.favorites || 0, Heart],
    ['Downloads', dashboard.statistics?.downloads || 0, Download],
    ['Views', (dashboard.recentUploads || []).reduce((sum, photo) => sum + (photo.viewCount || 0), 0), Eye],
  ] : [];

  return (
    <>
      <PageHeader darkMode={darkMode} title="Dashboard" subtitle="Analytics, activity and quick actions for your cloud library." />
      {!dashboard ? <CircularProgress /> : (
        <Grid container spacing={3}>
          {stats.map(([label, value, Icon]) => <Grid item xs={12} sm={6} md={4} lg={2} key={label}><Paper className={`${classes.premiumPanel} ${classes.statCard}`} elevation={0}><Icon color="#38bdf8" /><Typography className={classes.pageSubtitle}>{label}</Typography><Typography variant="h5" style={{ fontWeight: 900 }}>{value}</Typography></Paper></Grid>)}
          <Grid item xs={12} md={8}><Paper className={classes.premiumPanel} style={{ padding: 22 }} elevation={0}><Typography variant="h6">Upload Activity Chart</Typography><Box height={180} display="flex" alignItems="flex-end" style={{ gap: 10 }}>{[38, 74, 52, 86, 64, 92, 58, 76].map((height, index) => <motion.div key={index} initial={{ height: 0 }} animate={{ height }} style={{ flex: 1, borderRadius: 12, background: 'linear-gradient(180deg,#38bdf8,#2563eb)' }} />)}</Box></Paper></Grid>
          <Grid item xs={12} md={4}><Paper className={classes.premiumPanel} style={{ padding: 22 }} elevation={0}><Typography variant="h6">Storage Usage (5 GB Quota)</Typography><Typography variant="body2" style={{ color: '#38bdf8', marginTop: 4, fontWeight: 700 }}>{((dashboard.storage || 0) / (1024 * 1024)).toFixed(1)} MB of 5,120 MB Used ({Math.min(((dashboard.storage || 0) / (5 * 1024 * 1024 * 1024)) * 100, 100).toFixed(1)}%)</Typography><Box mt={1.5}><LinearProgress variant="determinate" value={Math.min(((dashboard.storage || 0) / (5 * 1024 * 1024 * 1024)) * 100, 100)} style={{ height: 12, borderRadius: 999 }} /></Box><Typography className={classes.pageSubtitle} style={{ marginTop: 12 }}>Remaining: {Math.max((5 * 1024 * 1024 * 1024 - (dashboard.storage || 0)) / (1024 * 1024), 0).toFixed(1)} MB available</Typography></Paper></Grid>
          <Grid item xs={12}><Typography variant="h6" className={classes.pageTitle}>Recent Uploads</Typography><Box className={classes.masonry}>{(dashboard.recentUploads || []).map((photo, index) => <PhotoCard key={photo._id} photo={photo} index={index} selected={[]} setSelected={() => {}} openViewer={setViewerIndex} notify={notify} userId="" darkMode={darkMode} />)}</Box></Grid>
        </Grid>
      )}
      <ImageViewer photos={dashboard?.recentUploads || []} index={viewerIndex} setIndex={setViewerIndex} notify={notify} darkMode={darkMode} />
    </>
  );
};

const Albums = ({ notify, darkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const routerHistory = useHistory();
  const albums = useSelector((state) => state.posts.albums);
  const photos = useSelector((state) => state.posts.data);
  const [album, setAlbum] = useState({ name: '', description: '', parentAlbum: '', visibility: 'private' });
  const [invitations, setInvitations] = useState([]);

  useEffect(() => { dispatch(loadAlbums()); dispatch(getPosts()); api.fetchAlbumInvitations().then(({ data }) => setInvitations(data)).catch(() => setInvitations([])); }, [dispatch]);

  const submit = async (event) => {
    event.preventDefault();
    await dispatch(createAlbum(album));
    setAlbum({ name: '', description: '', parentAlbum: '', visibility: 'private' });
    notify('Album created.');
  };

  return (
    <>
      <PageHeader darkMode={darkMode} title="Albums" subtitle="Premium album cards, privacy badges and nested organization." />
      <Paper className={classes.premiumPanel} style={{ padding: 22, marginBottom: 24 }} elevation={0}>
        <form onSubmit={submit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField required fullWidth variant="outlined" label="Album name" value={album.name} onChange={(e) => setAlbum({ ...album, name: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth variant="outlined" label="Description" value={album.description} onChange={(e) => setAlbum({ ...album, description: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth variant="outlined" label="Nested under" value={album.parentAlbum} onChange={(e) => setAlbum({ ...album, parentAlbum: e.target.value })}><MenuItem value="">Root</MenuItem>{albums.map((item) => <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth variant="outlined" label="Privacy" value={album.visibility} onChange={(e) => setAlbum({ ...album, visibility: e.target.value })}><MenuItem value="private">Private</MenuItem><MenuItem value="shared">Shared</MenuItem><MenuItem value="public">Public</MenuItem></TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth type="submit" className={classes.glowButton}>Create Album</Button></Grid>
          </Grid>
        </form>
       </Paper>
       {invitations.length > 0 && <Paper className={classes.premiumPanel} style={{ padding: 18, marginBottom: 24 }} elevation={0}><Typography variant="h6">Album invitations</Typography>{invitations.map((item) => <Box key={item._id} display="flex" alignItems="center" justifyContent="space-between" mt={1}><Box><Typography>{item.name}</Typography><Typography className={classes.pageSubtitle}>From {item.owner?.name || 'Unknown'} · {item.members?.find((member) => String(member.user?._id || member.user) === String(item.owner?._id))?.permission || 'viewer'} access</Typography></Box><Box><Button size="small" onClick={async () => { await api.respondToAlbumInvitation(item._id, 'accepted'); setInvitations((items) => items.filter((entry) => entry._id !== item._id)); dispatch(loadAlbums()); notify('Album invitation accepted.'); }}>Accept</Button><Button size="small" onClick={async () => { await api.respondToAlbumInvitation(item._id, 'declined'); setInvitations((items) => items.filter((entry) => entry._id !== item._id)); notify('Album invitation declined.'); }}>Decline</Button></Box></Box>)}</Paper>}
       <Grid container spacing={3}>
        {albums.map((item) => {
          const albumPhotos = photos.filter((photo) => String(photo.album) === String(item._id) || (photo.albums || []).map(String).includes(String(item._id)));
          const cover = albumPhotos[0]?.selectedFile || albumPhotos[0]?.cloudinaryUrl;
          const albumVideos = albumPhotos.filter((photo) => String(photo.fileType || '').startsWith('video/'));
          const imageCount = albumPhotos.length - albumVideos.length;
          const renameAlbum = async (event) => {
            event.stopPropagation();
            const name = window.prompt('Rename album', item.name);
            if (!name || name.trim() === item.name) return;
            await api.updateAlbum(item._id, { ...item, name: name.trim() });
            await dispatch(loadAlbums());
            notify('Album renamed.');
          };
          const removeAlbum = async (event) => {
            event.stopPropagation();
            if (!window.confirm(`Delete album "${item.name}"? Photos stay in your library.`)) return;
            await api.deleteAlbum(item._id);
            await dispatch(loadAlbums());
            notify('Album deleted.');
          };
          return (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <motion.div whileHover={{ y: -6 }}>
                <Paper className={classes.premiumPanel} style={{ padding: 14, overflow: 'hidden', cursor: 'pointer' }} elevation={0} onClick={() => routerHistory.push(`/albums/${item._id}`)}>
                  <Box height={180} borderRadius={20} style={{ background: cover ? `url(${cover}) center/cover` : 'linear-gradient(135deg,#2563eb,#7c3aed,#06b6d4)' }} />
                  <Box p={1}>
                    <Box display="flex" alignItems="center"><Typography variant="h6" style={{ fontWeight: 900 }}>{item.name}</Typography><Box flexGrow={1} /><span className={classes.badge}>{item.visibility}</span></Box>
                    <Typography className={classes.pageSubtitle}>{item.description || 'No description'}</Typography>
                    <Typography>{imageCount} photos - {albumVideos.length} videos - Owner: You</Typography>
                    <Box mt={1} display="flex" style={{ gap: 8 }}>
                      <Button size="small" onClick={renameAlbum} startIcon={<Edit3 size={14} />}>Rename</Button>
                      <Button size="small" onClick={removeAlbum} startIcon={<Trash2 size={14} />}>Delete</Button>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

const AlbumDetail = ({ notify, darkMode }) => {
  const classes = useStyles({ darkMode });
  const routerHistory = useHistory();
  const { id } = useParams();
  const userId = useSelector((state) => state.auth.authData?.result?._id || state.auth.authData?.result?.googleId);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [viewMode, setViewMode] = useState('grid');
  const [membersOpen, setMembersOpen] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState([]);
  const [memberPermission, setMemberPermission] = useState('viewer');

  const loadAlbumDetail = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorStatus(null);
      setErrorMsg('');
      const { data } = await api.fetchAlbum(id);
      setDetails(data);
    } catch (error) {
      console.error(error);
      const status = error.response?.status || 500;
      setErrorStatus(status);
      setErrorMsg(error.response?.data?.message || 'Unable to load album.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadAlbumDetail().catch(() => setLoading(false)); }, [loadAlbumDetail]);

  useEffect(() => {
    if (!memberQuery.trim()) { setMemberResults([]); return undefined; }
    const timer = setTimeout(() => {
      api.searchUsers(memberQuery).then(({ data }) => setMemberResults(data)).catch(() => setMemberResults([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [memberQuery]);

  const updateAlbumDetail = async (payload) => {
    const { album } = details;
    const { data } = await api.updateAlbum(album._id, {
      name: album.name,
      description: album.description,
      parentAlbum: album.parentAlbum || '',
      coverPhoto: album.coverPhoto || '',
      visibility: album.visibility || 'private',
      ...payload,
    });
    setDetails({ ...details, album: data });
    notify('Album updated.');
  };

  const deleteCurrentAlbum = async () => {
    if (!window.confirm(`Delete album "${details.album.name}"? Photos stay in your library.`)) return;
    await api.deleteAlbum(details.album._id);
    notify('Album deleted.');
    routerHistory.push('/albums');
  };

  const addMember = async (member) => {
    try {
      const { data } = await api.addAlbumMember(details.album._id, { userId: member._id, permission: memberPermission });
      setDetails({ ...details, album: data });
      setMemberQuery(''); setMemberResults([]);
      notify(`${member.name || member.username} added as ${memberPermission}.`);
    } catch (error) { notify(error.response?.data?.message || 'Unable to add member.'); }
  };

  const changeMemberPermission = async (member, permission) => {
    try {
      const { data } = await api.updateAlbumMember(details.album._id, member.user?._id || member.user, { permission });
      setDetails({ ...details, album: data });
      notify('Member permission updated.');
    } catch (error) { notify(error.response?.data?.message || 'Unable to update permission.'); }
  };

  const removeMember = async (member) => {
    if (!window.confirm('Remove this member from the album?')) return;
    try {
      await api.removeAlbumMember(details.album._id, member.user?._id || member.user);
      setDetails({ ...details, album: { ...details.album, members: (details.album.members || []).filter((item) => String(item.user?._id || item.user) !== String(member.user?._id || member.user)) } });
      notify('Member access removed.');
    } catch (error) { notify(error.response?.data?.message || 'Unable to remove member.'); }
  };

  if (loading) return <CircularProgress />;
  if (errorStatus || !details) {
    return (
      <Paper className={classes.premiumPanel} style={{ padding: 28, textAlign: 'center' }} elevation={0}>
        <Typography variant="h6" color="error">
          {errorStatus === 401 ? '401 — Authentication Required' : errorStatus === 403 ? '403 — Access Forbidden' : '404 — Album Unavailable'}
        </Typography>
        <Typography className={classes.pageSubtitle} style={{ marginTop: 8 }}>
          {errorMsg || 'Album not found or you do not have permission to view it.'}
        </Typography>
        <Box mt={3}>
          <Button variant="outlined" color="primary" onClick={() => routerHistory.push('/albums')}>Return to Albums</Button>
        </Box>
      </Paper>
    );
  }

  const { album, files = [], counts = {} } = details;
  const owner = album.owner?.name || album.owner?.username || 'Owner';
  const isOwner = String(album.owner?._id || album.owner) === String(userId);
  const userMember = (album.members || []).find((m) => String(m.user?._id || m.user) === String(userId));
  const isEditor = isOwner || userMember?.permission === 'editor';

  return (
    <>
      <PageHeader darkMode={darkMode} title={album.name} subtitle={album.description || 'Album details, media, owner and privacy controls.'} />
      <Paper className={classes.premiumPanel} style={{ padding: 22, marginBottom: 24 }} elevation={0}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography className={classes.pageSubtitle}>Owner: {owner}</Typography>
            <Typography>Created {new Date(album.createdAt).toLocaleDateString()} - {counts.photos || 0} photos - {counts.videos || 0} videos</Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box display="flex" justifyContent="flex-end" flexWrap="wrap" style={{ gap: 8 }}>
              <Button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>{viewMode === 'grid' ? 'List View' : 'Grid View'}</Button>
               {isOwner && <Button startIcon={<Share2 size={16} />} onClick={() => updateAlbumDetail({ visibility: album.visibility === 'public' ? 'private' : 'public' })}>{album.visibility === 'public' ? 'Make Private' : 'Make Public'}</Button>}
               {isOwner && <Button startIcon={<User size={16} />} onClick={() => setMembersOpen(true)}>Manage members</Button>}
               {isEditor && <Button startIcon={<Edit3 size={16} />} onClick={() => {
                 const name = window.prompt('Album name', album.name);
                 if (name) updateAlbumDetail({ name: name.trim() });
               }}>Rename</Button>}
               {isOwner && <Button color="secondary" startIcon={<Trash2 size={16} />} onClick={deleteCurrentAlbum}>Delete</Button>}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      {files.length === 0 ? (
        <Paper className={classes.premiumPanel} style={{ padding: 28 }} elevation={0}>
          <Typography variant="h6">No media in this album yet.</Typography>
          <Typography className={classes.pageSubtitle}>Upload or move photos into this album and they will appear here automatically.</Typography>
        </Paper>
      ) : viewMode === 'list' ? (
        <Grid container spacing={2}>
          {files.map((photo, index) => (
            <Grid item xs={12} key={photo._id}>
              <Paper className={classes.premiumPanel} style={{ padding: 14 }} elevation={0}>
                <Box display="flex" alignItems="center">
                  <Avatar variant="rounded" src={photo.selectedFile || photo.cloudinaryUrl} style={{ width: 72, height: 72 }} />
                  <Box ml={2} flexGrow={1}>
                    <Typography variant="h6">{photo.title}</Typography>
                    <Typography className={classes.pageSubtitle}>{photo.fileName || photo.fileType} - {photo.width && photo.height ? `${photo.width} x ${photo.height}` : 'Resolution unknown'}</Typography>
                  </Box>
                  <IconButton onClick={() => setViewerIndex(index)}><Eye /></IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box className={classes.masonry}>
          {files.map((photo, index) => (
            <PhotoCard key={photo._id} photo={photo} index={index} selected={[]} setSelected={() => {}} openViewer={setViewerIndex} notify={notify} userId={userId} darkMode={darkMode} />
          ))}
        </Box>
      )}
      <ImageViewer photos={files} index={viewerIndex} setIndex={setViewerIndex} notify={notify} darkMode={darkMode} />
      <Dialog open={membersOpen} onClose={() => setMembersOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Album members</DialogTitle>
        <DialogContent>
          <Paper variant="outlined" style={{ padding: 12, marginBottom: 16 }}>
            <Typography variant="subtitle2">Owner</Typography>
            <Box display="flex" alignItems="center" mt={1}><Avatar src={album.owner?.avatar}>{owner[0]}</Avatar><Box ml={1.5}><Typography>{owner}</Typography><Typography variant="caption">Owner · full control</Typography></Box></Box>
          </Paper>
          <Box display="flex" style={{ gap: 8, marginBottom: 12 }}>
            <TextField fullWidth variant="outlined" size="small" label="Search users to add" value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} />
            <TextField select variant="outlined" size="small" label="Permission" value={memberPermission} onChange={(event) => setMemberPermission(event.target.value)} style={{ minWidth: 120 }}><MenuItem value="viewer">Viewer</MenuItem><MenuItem value="editor">Editor</MenuItem></TextField>
          </Box>
          {memberResults.map((person) => <Box key={person._id} display="flex" alignItems="center" justifyContent="space-between" mb={1}><Box display="flex" alignItems="center"><Avatar src={person.avatar}>{person.name?.[0]}</Avatar><Box ml={1}><Typography>{person.name}</Typography><Typography variant="caption">@{person.username || person.email}</Typography></Box></Box><Button size="small" onClick={() => addMember(person)}>Add</Button></Box>)}
          <Divider style={{ margin: '16px 0' }} />
          {(album.members || []).length === 0 ? <Typography className={classes.pageSubtitle}>No additional members yet.</Typography> : (album.members || []).map((member) => {
            const person = member.user || {};
            return <Box key={person._id || member._id} display="flex" alignItems="center" justifyContent="space-between" mb={1.5}><Box display="flex" alignItems="center"><Avatar src={person.avatar}>{person.name?.[0]}</Avatar><Box ml={1}><Typography>{person.name || person.username}</Typography><Typography variant="caption">{member.status || 'accepted'} · Added {new Date(member.joinedAt).toLocaleDateString()}</Typography></Box></Box><Box display="flex" alignItems="center"><TextField select size="small" value={member.permission} onChange={(event) => changeMemberPermission(member, event.target.value)}><MenuItem value="viewer">Viewer</MenuItem><MenuItem value="editor">Editor</MenuItem></TextField><IconButton aria-label="Remove member" onClick={() => removeMember(member)}><Trash2 size={17} /></IconButton></Box></Box>;
          })}
        </DialogContent>
      </Dialog>
    </>
  );
};

const Profile = ({ notify, darkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const photos = useSelector((state) => state.posts.data);
  const albums = useSelector((state) => state.posts.albums);
  const user = auth.authData?.result || auth.authData || null;
  const authToken = auth.authData?.token;
  const [profile, setProfile] = useState(user || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    phone: user?.phone || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(Boolean(authToken && !user?._id));
  const [profileError, setProfileError] = useState('');
  const hasLoadedProfile = useRef(false);

  const stats = useMemo(() => ({
    favoriteCount: photos.filter((photo) => (photo.favoriteBy || []).length).length,
    downloadCount: photos.reduce((sum, photo) => sum + (photo.downloadCount || 0), 0),
    viewCount: photos.reduce((sum, photo) => sum + (photo.viewCount || 0), 0),
  }), [photos]);

  useEffect(() => { dispatch(loadStorage()); dispatch(getPosts()); dispatch(loadAlbums()); }, [dispatch]);

  useEffect(() => {
    if (!user || (!user._id && !user.userId && !user.email)) {
      setProfile(null);
      return;
    }
    setProfile((current) => ({ ...(current || {}), ...user }));
    setEditForm({
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      username: user.username || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      phone: user.phone || '',
    });
    setLoadingProfile(false);
    setProfileError('');
  }, [user]);

  useEffect(() => {
    if (!authToken) {
      setLoadingProfile(false);
      return undefined;
    }
    if (hasLoadedProfile.current) return undefined;
    hasLoadedProfile.current = true;
    let isActive = true;
    setLoadingProfile(true);
    setProfileError('');

    dispatch(autoLogin())
      .then((result) => {
        if (!isActive) return;
        if (result) {
          setProfile(result);
          setEditForm({
            firstName: result.firstName || result.name?.split(' ')[0] || '',
            lastName: result.lastName || result.name?.split(' ').slice(1).join(' ') || '',
            username: result.username || '',
            bio: result.bio || '',
            location: result.location || '',
            website: result.website || '',
            phone: result.phone || '',
          });
        }
      })
      .catch(() => {
        if (isActive) setProfileError('Unable to load profile details right now.');
      })
      .finally(() => {
        if (isActive) setLoadingProfile(false);
      });

    return () => { isActive = false; };
  }, [authToken, dispatch]);

  const uploadProfileImage = useCallback(async (event, field) => {
    const [file] = event.target.files || [];
    if (!file) return;

    try {
      setLoadingProfile(true);
      setProfileError('');
      const base64 = await fileToDataUrl(file);
      if (!base64) throw new Error('Unable to prepare image');

      setProfile((current) => ({ ...(current || {}), [field]: base64 }));
      const updated = await dispatch(saveProfile({ [field]: base64 }));
      setProfile((current) => ({ ...(current || {}), ...(updated || {}), [field]: base64 }));
      notify(field === 'avatar' ? 'Profile picture updated.' : 'Cover photo updated.');
    } catch (error) {
      setProfileError('The image could not be saved. Please try again.');
      notify('Image upload failed. Please try again.');
    } finally {
      setLoadingProfile(false);
      if (event && event.target) event.target.value = '';
    }
  }, [dispatch, notify]);

  const handleSaveProfile = async () => {
    try {
      if (editForm.bio && editForm.bio.length > 500) {
        setProfileError('Bio cannot exceed 500 characters.');
        notify('Bio exceeds 500 characters limit.');
        return;
      }
      if (editForm.website && !/^https?:\/\//i.test(editForm.website)) {
        editForm.website = `https://${editForm.website}`;
      }

      setLoadingProfile(true);
      setProfileError('');
      const updated = await dispatch(saveProfile({
        ...editForm,
        name: `${editForm.firstName} ${editForm.lastName}`.trim(),
      }));
      setProfile((current) => ({ ...(current || {}), ...(updated || {}), ...editForm }));
      setIsEditing(false);
      notify('Profile changes saved successfully.');
    } catch (error) {
      const msg = error.response?.data?.message || 'Profile could not be saved. Please check username uniqueness or inputs.';
      setProfileError(msg);
      notify(msg);
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <>
      <PageHeader darkMode={darkMode} title="Profile" subtitle="Personal identity, editable details, storage usage, activity and security." />
      <Paper className={classes.premiumPanel} style={{ padding: 22 }} elevation={0}>
        {loadingProfile ? (
          <Box display="flex" alignItems="center" mb={2}>
            <CircularProgress size={18} />
            <Box ml={1}><Typography className={classes.pageSubtitle}>Loading profile details…</Typography></Box>
          </Box>
        ) : null}

        {profileError && (
          <Box mb={2} p={1.5} style={{ borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <Typography color="error" variant="body2">{profileError}</Typography>
          </Box>
        )}

        <Box mb={2}>
          <div
            style={{
              height: 220,
              borderRadius: 20,
              background: profile?.coverImage ? `url(${profile.coverImage}) center/cover` : 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
              marginBottom: 20,
            }}
          />

          <Box display="flex" alignItems="flex-end" justifyContent="space-between" flexWrap="wrap">
            <Box display="flex" alignItems="center">
              <Avatar
                src={profile?.avatar}
                style={{
                  width: 110,
                  height: 110,
                  marginTop: -55,
                  marginLeft: 20,
                  border: '4px solid #0f172a',
                  marginBottom: 10,
                }}
              />
              <Box ml={2}>
                <Typography variant="h5" style={{ fontWeight: 800 }}>{profile?.name || `${editForm.firstName} ${editForm.lastName}` || 'User Profile'}</Typography>
                <Typography variant="subtitle2" style={{ opacity: 0.7 }}>@{profile?.username || profile?.email}</Typography>
              </Box>
            </Box>

            <Box display="flex" style={{ gap: 8, marginBottom: 10 }}>
              <input id="profile-avatar-upload" hidden type="file" accept="image/*" onChange={(event) => uploadProfileImage(event, 'avatar')} />
              <input id="profile-cover-upload" hidden type="file" accept="image/*" onChange={(event) => uploadProfileImage(event, 'coverImage')} />
              <label htmlFor="profile-avatar-upload">
                <Button component="span" size="small" variant="outlined" startIcon={<UploadCloud size={16} />}>Avatar</Button>
              </label>
              <label htmlFor="profile-cover-upload">
                <Button component="span" size="small" variant="outlined" startIcon={<Image size={16} />}>Cover</Button>
              </label>
              {!isEditing ? (
                <Button variant="contained" color="primary" size="small" startIcon={<Edit3 size={16} />} onClick={() => setIsEditing(true)}>Edit Profile</Button>
              ) : (
                <Button variant="outlined" color="secondary" size="small" onClick={() => { setIsEditing(false); setProfileError(''); }}>Cancel</Button>
              )}
            </Box>
          </Box>
        </Box>

        <Divider style={{ margin: '16px 0' }} />

        {isEditing ? (
          <Box>
            <Typography variant="h6" style={{ marginBottom: 16 }}>Edit Account Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth variant="outlined" label="First Name" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth variant="outlined" label="Last Name" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth variant="outlined" label="Username" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth variant="outlined" label="Phone Number" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth variant="outlined" label="Location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth variant="outlined" label="Website URL" value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} placeholder="https://example.com" />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  label="Bio / About Me"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  helperText={`${editForm.bio.length}/500 characters`}
                  error={editForm.bio.length > 500}
                />
              </Grid>
            </Grid>
            <Box mt={3} display="flex" style={{ gap: 12 }}>
              <Button className={classes.glowButton} onClick={handleSaveProfile} disabled={loadingProfile}>Save Changes</Button>
              <Button variant="outlined" onClick={() => setIsEditing(false)}>Cancel</Button>
            </Box>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 14 }}>
                <Typography variant="subtitle2" style={{ opacity: 0.7, marginBottom: 8 }}>PERSONAL INFORMATION</Typography>
                <Typography variant="body1"><strong>Name:</strong> {profile?.name || `${profile?.firstName || ''} ${profile?.lastName || ''}` || 'Not set'}</Typography>
                <Typography variant="body1"><strong>Username:</strong> @{profile?.username || 'Not set'}</Typography>
                <Typography variant="body1"><strong>Email:</strong> {profile?.email}</Typography>
                <Typography variant="body1"><strong>Phone:</strong> {profile?.phone || 'Not set'}</Typography>
                <Typography variant="body1"><strong>Location:</strong> {profile?.location || 'Not set'}</Typography>
                <Typography variant="body1"><strong>Website:</strong> {profile?.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>{profile.website}</a> : 'Not set'}</Typography>
                <Box mt={1}>
                  <Typography variant="body2" style={{ opacity: 0.8 }}><strong>Bio:</strong> {profile?.bio || 'No bio added yet.'}</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 14 }}>
                <Typography variant="subtitle2" style={{ opacity: 0.7, marginBottom: 8 }}>STORAGE & ACCOUNT STATS</Typography>
                <Typography variant="body2">Quota: <strong>5 GB (5,120 MB)</strong></Typography>
                <Box my={1}>
                  <LinearProgress variant="determinate" value={Math.min(auth.storage?.percentUsed || 0, 100)} style={{ height: 10, borderRadius: 999 }} />
                </Box>
                <Typography variant="caption" className={classes.pageSubtitle}>
                  {((auth.storage?.totalStorage || 0) / (1024 * 1024)).toFixed(1)} MB used ({auth.storage?.percentUsed || 0}%)
                </Typography>
                <Divider style={{ margin: '12px 0' }} />
                <Typography variant="body2">Photos: <strong>{photos.length}</strong> | Albums: <strong>{albums.length}</strong> | Favorites: <strong>{stats.favoriteCount}</strong></Typography>
                <Typography variant="body2">Joined: <strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}</strong></Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Paper className={classes.premiumPanel} style={{ padding: 22, marginTop: 24 }} elevation={0}>
        <Box display="flex" alignItems="center" mb={2}>
          <KeyRound />
          <Box ml={1}><Typography variant="h6">Security</Typography></Box>
          <Box flexGrow={1} />
          <Button startIcon={showPasswords ? <EyeOff size={16} /> : <Eye size={16} />} onClick={() => setShowPasswords(!showPasswords)}>
            {showPasswords ? 'Hide passwords' : 'Show passwords'}
          </Button>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField fullWidth variant="outlined" type={showPasswords ? 'text' : 'password'} label="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth variant="outlined" type={showPasswords ? 'text' : 'password'} label="New password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth variant="outlined" type={showPasswords ? 'text' : 'password'} label="Confirm password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} /></Grid>
        </Grid>
        <Box mt={2} display="flex" style={{ gap: 12 }}>
          <Button variant="contained" color="primary" onClick={async () => { await dispatch(changePassword(passwords)); notify('Password changed. Sign in again.'); }}>Change password</Button>
          <Button color="secondary" onClick={async () => { await dispatch(deleteAccount()); notify('Account deleted.'); }}>Delete account</Button>
        </Box>
      </Paper>
    </>
  );
};

const CollectionPage = ({ type, notify, darkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.posts);
  const userId = useSelector((state) => state.auth.authData?.result?._id);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [downloads, setDownloads] = useState([]);
  
  // 3-Stage Confirmation Process State for Permanent Deletion
  const [deleteTarget, setDeleteTarget] = useState(null); // photo object
  const [deleteStage, setDeleteStage] = useState(0); // 0 = closed, 1 = warning, 2 = re-confirm, 3 = type DELETE
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  useEffect(() => {
    if (type === 'downloads') {
      api.fetchDownloads().then(({ data: rows }) => setDownloads(rows));
    }
    const params = type === 'favorites'
      ? { filter: 'favorites' }
      : type === 'trash'
        ? { filter: 'trash', includeDeleted: true }
        : type === 'shared'
          ? { sharedWithMe: true }
          : {};
    dispatch(getPosts(params));
  }, [dispatch, type]);

  const titleMap = {
    favorites: ['Favorites', 'Favorite count, favorite history, search and sorting.'],
    downloads: ['Downloads', 'Downloaded photo history with open, download again and counters.'],
    trash: ['Recycle Bin', 'Restore photos or permanently delete them with 3-stage confirmation.'],
    shared: ['Shared with me', 'Photos and albums shared with you by other users.'],
  };
  const collectionTitle = titleMap[type] ? titleMap[type][0] : 'Collection';
  const collectionSubtitle = titleMap[type] ? titleMap[type][1] : 'Collection';

  const filteredDownloads = downloads.filter((item) => {
    const photo = item.photo || {};
    const text = `${item.fileName} ${photo.title || ''} ${photo.fileName || ''}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const filtered = data
    .filter((photo) => {
      const text = `${photo.title} ${photo.fileName} ${(photo.tags || []).join(' ')} ${photo.creator} ${photo.message}`.toLowerCase();
      return text.includes(query.toLowerCase());
    })
    .sort((a, b) => {
      if (sort === 'nameAsc') return (a.title || '').localeCompare(b.title || '');
      if (sort === 'nameDesc') return (b.title || '').localeCompare(a.title || '');
      if (sort === 'mostDownloaded') return (b.downloadCount || 0) - (a.downloadCount || 0);
      if (sort === 'mostViewed') return (b.viewCount || 0) - (a.viewCount || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleStartPermanentDelete = (photo) => {
    setDeleteTarget(photo);
    setDeleteStage(1);
    setDeleteConfirmInput('');
  };

  const handleCancelPermanentDelete = () => {
    setDeleteTarget(null);
    setDeleteStage(0);
    setDeleteConfirmInput('');
  };

  const handleExecutePermanentDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(permanentDeletePost(deleteTarget._id));
      dispatch(loadStorage());
      notify(`"${deleteTarget.title || deleteTarget.fileName || 'Photo'}" was permanently deleted and storage freed.`);
    } catch (err) {
      notify(err.response?.data?.message || 'Permanent deletion failed.');
    } finally {
      handleCancelPermanentDelete();
    }
  };

  return (
    <>
      <PageHeader darkMode={darkMode} title={collectionTitle} subtitle={collectionSubtitle} />
      <Paper className={classes.premiumPanel} style={{ padding: 18, marginBottom: 22 }} elevation={0}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}><TextField fullWidth variant="outlined" label={`Search ${collectionTitle}`} value={query} onChange={(e) => setQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth select variant="outlined" label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}><MenuItem value="newest">Newest</MenuItem><MenuItem value="nameAsc">Name A-Z</MenuItem><MenuItem value="nameDesc">Name Z-A</MenuItem><MenuItem value="mostViewed">Most Viewed</MenuItem><MenuItem value="mostDownloaded">Most Downloaded</MenuItem></TextField></Grid>
          <Grid item xs={12} md={3}><Typography>{type === 'downloads' ? filteredDownloads.length : filtered.length} items</Typography></Grid>
        </Grid>
      </Paper>
      {type === 'downloads' ? (
        <Grid container spacing={2}>
          {filteredDownloads.map((item) => {
            const photo = item.photo || {};
            const url = item.url || photo.cloudinaryUrl || photo.selectedFile;
            return (
              <Grid item xs={12} md={6} key={item._id}>
                <Paper className={classes.premiumPanel} style={{ padding: 16 }} elevation={0}>
                  <Box display="flex" alignItems="center">
                    <img src={url} alt={item.fileName} style={{ width: 92, height: 72, objectFit: 'cover', borderRadius: 14 }} />
                    <Box ml={2} flexGrow={1}>
                      <Typography variant="h6">{item.fileName || photo.title}</Typography>
                      <Typography className={classes.pageSubtitle}>{item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'} - {new Date(item.createdAt).toLocaleString()}</Typography>
                    </Box>
                    <IconButton onClick={() => triggerDownload(url, item.fileName || photo.title)}><Download /></IconButton>
                    <IconButton onClick={async () => { await api.deleteDownloadHistory(item._id); setDownloads(downloads.filter((row) => row._id !== item._id)); notify('Download history deleted.'); }}><Trash2 /></IconButton>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : loading ? <CircularProgress /> : (
        <Box className={classes.masonry}>
          {filtered.map((photo, index) => (
            type === 'trash' ? (
              <motion.div key={photo._id} className={classes.photoCard} whileHover={{ y: -6 }}>
                <img className={classes.photoImage} src={photo.selectedFile || photo.cloudinaryUrl} alt={photo.title} loading="lazy" />
                <Box className={classes.photoOverlay} style={{ opacity: 1 }}>
                  <Box />
                  <Box>
                    <Typography variant="h6">{photo.title}</Typography>
                    <Button style={{ color: '#fff' }} startIcon={<RefreshCw size={16} />} onClick={() => dispatch(restorePost(photo._id))}>Restore</Button>
                    <Button style={{ color: '#ff6b6b' }} startIcon={<Trash2 size={16} />} onClick={() => handleStartPermanentDelete(photo)}>Delete Permanently</Button>
                  </Box>
                </Box>
              </motion.div>
            ) : (
              <PhotoCard key={photo._id} photo={photo} index={index} selected={[]} setSelected={() => {}} openViewer={setViewerIndex} notify={notify} userId={userId} darkMode={darkMode} />
            )
          ))}
        </Box>
      )}

      {/* 3-Stage Confirmation Process Modal */}
      <Dialog open={deleteStage > 0} onClose={handleCancelPermanentDelete} maxWidth="xs" fullWidth>
        <DialogTitle style={{ background: '#0f172a', color: '#fff', fontWeight: 700 }}>
          {deleteStage === 1 && 'Confirmation 1 of 3: Warning'}
          {deleteStage === 2 && 'Confirmation 2 of 3: Re-Confirm Deletion'}
          {deleteStage === 3 && 'Confirmation 3 of 3: Final Verification'}
        </DialogTitle>
        <DialogContent style={{ background: '#0f172a', color: '#eaf2ff', paddingTop: 16, paddingBottom: 24 }}>
          {deleteStage === 1 && (
            <Box textAlign="center">
              <Trash2 size={48} color="#ef4444" style={{ marginBottom: 12 }} />
              <Typography variant="h6" style={{ fontWeight: 700, color: '#f87171' }}>Permanently Delete File?</Typography>
              <Typography variant="body2" style={{ marginTop: 8, opacity: 0.9 }}>
                Item to delete: <strong>{deleteTarget?.title || deleteTarget?.fileName || 'Selected Item'}</strong>
              </Typography>
              <Typography variant="caption" style={{ display: 'block', marginTop: 12, color: '#94a3b8' }}>
                Warning: Permanently deleting this photo removes it from cloud servers and CANNOT be undone or restored from Trash.
              </Typography>
              <Box mt={3} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={handleCancelPermanentDelete}>Cancel</Button>
                <Button variant="contained" color="secondary" onClick={() => setDeleteStage(2)}>Proceed to Step 2</Button>
              </Box>
            </Box>
          )}

          {deleteStage === 2 && (
            <Box textAlign="center">
              <Shield color="#f59e0b" size={48} style={{ marginBottom: 12 }} />
              <Typography variant="h6" style={{ fontWeight: 700, color: '#fbbf24' }}>Are you absolutely sure?</Typography>
              <Typography variant="body2" style={{ marginTop: 8, opacity: 0.9 }}>
                Please confirm again that you wish to destroy <strong>"{deleteTarget?.title || deleteTarget?.fileName}"</strong>.
              </Typography>
              <Typography variant="caption" style={{ display: 'block', marginTop: 12, color: '#94a3b8' }}>
                This will free its occupied storage space and permanently erase all associated metadata.
              </Typography>
              <Box mt={3} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={handleCancelPermanentDelete}>Cancel</Button>
                <Button variant="contained" color="secondary" onClick={() => setDeleteStage(3)}>Proceed to Step 3</Button>
              </Box>
            </Box>
          )}

          {deleteStage === 3 && (
            <Box textAlign="center">
              <KeyRound color="#ef4444" size={48} style={{ marginBottom: 12 }} />
              <Typography variant="h6" style={{ fontWeight: 700, color: '#f87171' }}>Type DELETE to Confirm</Typography>
              <Typography variant="body2" style={{ marginTop: 8, opacity: 0.9 }}>
                To execute permanent removal of <strong>"{deleteTarget?.title || deleteTarget?.fileName}"</strong>, please type <strong>DELETE</strong> below:
              </Typography>
              <Box mt={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type DELETE"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  autoFocus
                  InputProps={{ style: { color: '#fff' } }}
                />
              </Box>
              <Box mt={3} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={handleCancelPermanentDelete}>Cancel</Button>
                <Button
                  variant="contained"
                  style={{ background: deleteConfirmInput.trim() === 'DELETE' ? '#dc2626' : '#64748b', color: '#fff' }}
                  disabled={deleteConfirmInput.trim() !== 'DELETE'}
                  onClick={handleExecutePermanentDelete}
                >
                  Permanently Delete Now
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <ImageViewer photos={filtered} index={viewerIndex} setIndex={setViewerIndex} notify={notify} darkMode={darkMode} />
    </>
  );
};

const StoragePage = ({ darkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const storage = useSelector((state) => state.auth.storage);
  const photos = useSelector((state) => state.posts.data);

  useEffect(() => { dispatch(loadStorage()); dispatch(getPosts()); }, [dispatch]);

  const totalBytes = storage?.totalStorage || 0;
  const limitBytes = storage?.storageLimit || (5 * 1024 * 1024 * 1024);
  const usedMib = (totalBytes / (1024 * 1024)).toFixed(2);
  const usedGib = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
  const limitGib = (limitBytes / (1024 * 1024 * 1024)).toFixed(0);
  const limitMib = Math.round(limitBytes / (1024 * 1024));
  const availBytes = Math.max(limitBytes - totalBytes, 0);
  const availMib = (availBytes / (1024 * 1024)).toFixed(2);
  const availGib = (availBytes / (1024 * 1024 * 1024)).toFixed(2);
  const percentUsed = Math.min(((totalBytes / limitBytes) * 100), 100).toFixed(1);

  return (
    <>
      <PageHeader darkMode={darkMode} title="Storage" subtitle="5 GiB Quota, used space, available capacity, and storage distribution." />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper className={classes.premiumPanel} style={{ padding: 24 }} elevation={0}>
            <HardDrive color="#38bdf8" size={36} />
            <Typography variant="h5" style={{ marginTop: 8, fontWeight: 800 }}>
              {usedMib} MiB ({usedGib} GiB) used of {limitGib} GiB ({limitMib.toLocaleString()} MiB)
            </Typography>
            <Box my={2}>
              <LinearProgress variant="determinate" value={Number(percentUsed)} style={{ height: 14, borderRadius: 999 }} />
            </Box>
            <Box display="flex" justifyContent="space-between" flexWrap="wrap">
              <Typography className={classes.pageSubtitle}>Available Storage: <strong>{availMib} MiB ({availGib} GiB)</strong></Typography>
              <Typography className={classes.pageSubtitle}>Usage: <strong>{percentUsed}%</strong></Typography>
            </Box>
            {Number(percentUsed) > 80 && (
              <Typography color="error" style={{ marginTop: 12, fontWeight: 700 }}>
                Storage warning: You have used over 80% of your 5 GiB quota.
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={classes.premiumPanel} style={{ padding: 24 }} elevation={0}>
            <Typography variant="h6" style={{ fontWeight: 800 }}>Cloud Storage Details</Typography>
            <Typography style={{ marginTop: 8 }}>Total Photos: <strong>{storage?.photoCount || photos.length}</strong></Typography>
            <Typography>Total Quota: <strong>5 GiB (5,368,709,120 bytes)</strong></Typography>
            <Typography>Folders: <strong>{new Set(photos.map((photo) => photo.folder || 'library')).size}</strong></Typography>
            <Typography variant="caption" style={{ opacity: 0.7, marginTop: 12, display: 'block' }}>
              Quota recalculates automatically after uploads, restorations, and permanent deletions.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

const SettingsPage = ({ notify, darkMode, setDarkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.auth.authData?.result || {});
  const [settings, setSettings] = useState(user.settings || {});
  const [privacy, setPrivacy] = useState(user.privacy || { whoCanMessage: 'everyone', whoCanComment: 'everyone', profileVisibility: 'public' });
  const [auditLogs, setAuditLogs] = useState([]);
  const [settingsTab, setSettingsTab] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    setSettings(user.settings || {});
    setPrivacy(user.privacy || { whoCanMessage: 'everyone', whoCanComment: 'everyone', profileVisibility: 'public' });
  }, [user]);

  useEffect(() => {
    if (settingsTab === 2) {
      api.fetchAuditLog().then(({ data }) => setAuditLogs(data)).catch(() => {});
    }
  }, [settingsTab]);

  const save = async () => {
    await dispatch(saveProfile({ settings }));
    await api.updatePrivacySettings(privacy);
    notify('Settings and privacy controls updated.');
  };

  const toggle = (key) => (event) => setSettings({ ...settings, [key]: event.target.checked });

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const { data } = await api.exportBackup();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `cloud_photo_gallery_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      notify(`Backup exported successfully: ${data.photoCount || 0} photos & ${data.albumCount || 0} albums preserved.`);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to export backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestoreBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsRestoring(true);
      const fileText = await file.text();
      const backupData = JSON.parse(fileText);

      const { data } = await api.restoreBackup(backupData);
      dispatch(getPosts());
      dispatch(loadAlbums());
      dispatch(loadStorage());
      notify(`Backup restored successfully: ${data.restoredPhotos || 0} photos restored.`);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to restore backup file. Invalid format.');
    } finally {
      setIsRestoring(false);
      event.target.value = '';
    }
  };

  return (
    <>
      <PageHeader darkMode={darkMode} title="Settings & Security" subtitle="Configure appearance, notification preferences, backup & restore, privacy controls, and security logs." />
      <Box mb={3}>
        <Tabs value={settingsTab} onChange={(_, val) => setSettingsTab(val)}>
          <Tab label="General & Appearance" />
          <Tab label="Privacy & Controls" />
          <Tab label="Security Audit Log" />
        </Tabs>
      </Box>
      {settingsTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper className={classes.premiumPanel} style={{ padding: 22 }} elevation={0}>
              <Typography variant="h6"><SlidersHorizontal size={18} /> Appearance & Theme</Typography>
              <FormControlLabel control={<MuiSwitch checked={darkMode} onChange={(e) => { setDarkMode(e.target.checked); setSettings({ ...settings, darkMode: e.target.checked }); }} />} label={darkMode ? 'Dark Mode' : 'Light Mode'} />
              <TextField fullWidth select variant="outlined" label="Theme Accent" value={settings.theme || 'Midnight'} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} style={{ marginTop: 12 }}>
                <MenuItem value="Midnight">Midnight</MenuItem>
                <MenuItem value="Aurora">Aurora</MenuItem>
                <MenuItem value="Cloud Light">Cloud Light</MenuItem>
              </TextField>
              <Box mt={2}>
                <Typography variant="caption"><Languages size={14} /> Language</Typography>
                <TextField fullWidth select variant="outlined" label="Language" value={settings.language || 'English'} onChange={(e) => setSettings({ ...settings, language: e.target.value })} style={{ marginTop: 6 }}>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Hindi">Hindi</MenuItem>
                  <MenuItem value="Spanish">Spanish</MenuItem>
                </TextField>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className={classes.premiumPanel} style={{ padding: 22 }} elevation={0}>
              <Typography variant="h6"><Bell size={18} /> Notifications</Typography>
              <FormControlLabel control={<MuiSwitch checked={settings.emailNotifications !== false} onChange={toggle('emailNotifications')} />} label="Email Notifications" /><br />
              <FormControlLabel control={<MuiSwitch checked={settings.pushNotifications !== false} onChange={toggle('pushNotifications')} />} label="Push Notifications" /><br />
              <FormControlLabel control={<MuiSwitch checked={settings.uploadNotifications !== false} onChange={toggle('uploadNotifications')} />} label="Upload Notifications" />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className={classes.premiumPanel} style={{ padding: 22 }} elevation={0}>
              <Typography variant="h6"><Cloud size={18} /> Full Storage Backup & Restore</Typography>
              <Typography variant="caption" className={classes.pageSubtitle} style={{ display: 'block', marginBottom: 12 }}>
                Export a verified 100% JSON backup of your photos, albums, metadata, and user settings, or restore from a previous backup file.
              </Typography>
              <Box display="flex" flexWrap="wrap" style={{ gap: 10 }}>
                <Button variant="contained" color="primary" startIcon={<Download size={16} />} onClick={handleExportBackup} disabled={isExporting}>
                  {isExporting ? 'Exporting Backup…' : 'Export Full Backup'}
                </Button>
                <input id="restore-backup-file" type="file" accept=".json" hidden onChange={handleRestoreBackup} />
                <label htmlFor="restore-backup-file">
                  <Button component="span" variant="outlined" startIcon={<UploadCloud size={16} />} disabled={isRestoring}>
                    {isRestoring ? 'Restoring…' : 'Restore Backup JSON'}
                  </Button>
                </label>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className={classes.premiumPanel} style={{ padding: 22 }} elevation={0}>
              <Typography variant="h6"><Smartphone size={18} /> Connected Accounts</Typography>
              <Box display="flex" style={{ gap: 8, marginTop: 12 }}>
                <Button variant="outlined" startIcon={<Cloud size={16} />} onClick={() => { window.location.href = `${API_BASE_URL}/user/oauth/google?client=${encodeURIComponent(window.location.origin)}`; }}>Google</Button>
                <Button variant="outlined" startIcon={<Github size={16} />} onClick={() => { window.location.href = `${API_BASE_URL}/user/oauth/github?client=${encodeURIComponent(window.location.origin)}`; }}>GitHub</Button>
              </Box>
              <Box mt={2}><Button color="secondary" onClick={() => dispatch(deleteAccount())}>Delete Account</Button></Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      {settingsTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper className={classes.premiumPanel} style={{ padding: 22 }} elevation={0}>
              <Typography variant="h6"><Shield size={18} /> Privacy Controls</Typography>
              <Box mt={2}>
                <TextField fullWidth select variant="outlined" label="Who can message me?" value={privacy.whoCanMessage || 'everyone'} onChange={(e) => setPrivacy({ ...privacy, whoCanMessage: e.target.value })}>
                  <MenuItem value="everyone">Everyone</MenuItem>
                  <MenuItem value="followers">Followers</MenuItem>
                  <MenuItem value="nobody">Nobody</MenuItem>
                </TextField>
              </Box>
              <Box mt={2}>
                <TextField fullWidth select variant="outlined" label="Who can comment on my photos?" value={privacy.whoCanComment || 'everyone'} onChange={(e) => setPrivacy({ ...privacy, whoCanComment: e.target.value })}>
                  <MenuItem value="everyone">Everyone</MenuItem>
                  <MenuItem value="followers">Followers</MenuItem>
                  <MenuItem value="nobody">Nobody</MenuItem>
                </TextField>
              </Box>
              <Box mt={2}>
                <TextField fullWidth select variant="outlined" label="Profile Visibility" value={privacy.profileVisibility || 'public'} onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}>
                  <MenuItem value="public">Public Profile</MenuItem>
                  <MenuItem value="private">Private Profile</MenuItem>
                </TextField>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className={classes.premiumPanel} style={{ padding: 22 }} elevation={0}>
              <Typography variant="h6"><KeyRound size={18} /> Security & Active Sessions</Typography>
              <Typography className={classes.pageSubtitle} style={{ margin: '12px 0' }}>Sign out of all active browser sessions and devices across all locations.</Typography>
              <Button variant="outlined" color="secondary" startIcon={<LogOut size={16} />} onClick={async () => { await dispatch(logoutAllDevices()); notify('Logged out of all devices.'); history.push('/'); }}>Logout All Devices</Button>
            </Paper>
          </Grid>
        </Grid>
      )}
      {settingsTab === 2 && (
        <Paper className={classes.premiumPanel} style={{ padding: 22 }} elevation={0}>
          <Typography variant="h6"><Activity size={18} /> Security & Audit Activity Log</Typography>
          <Typography className={classes.pageSubtitle} style={{ marginBottom: 16 }}>Real-time event history for authentications, security updates, uploads and permission changes.</Typography>
          {auditLogs.length === 0 ? (
            <Typography variant="body2" className={classes.pageSubtitle}>No audit activity entries logged yet.</Typography>
          ) : (
            auditLogs.map((log) => (
              <Box key={log._id} display="flex" alignItems="center" justifyContent="space-between" py={1.2} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Box>
                  <Typography variant="body2" style={{ fontWeight: 700 }}>{log.action.replace('_', ' ').toUpperCase()}</Typography>
                  <Typography variant="caption" className={classes.pageSubtitle}>{log.ip || 'Local Session'} • {new Date(log.createdAt).toLocaleString()}</Typography>
                </Box>
                <Chip size="small" label={new Date(log.createdAt).toLocaleDateString()} />
              </Box>
            ))
          )}
        </Paper>
      )}
      <Box mt={3}><Button className={classes.glowButton} onClick={save}>Save Preferences</Button></Box>
    </>
  );
};

const UsersPage = ({ notify, darkMode }) => {
  const classes = useStyles({ darkMode });
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [profile, setProfile] = useState(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.authData?.result || {});

  useEffect(() => {
    const timer = setTimeout(() => {
      api.searchUsers(query).then(({ data }) => setUsers(data));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const openProfile = async (id) => {
    const { data } = await api.publicProfile(id);
    setProfile(data);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openId = params.get('open');
    if (!openId) {
      setProfile(null);
      return;
    }
    openProfile(openId).catch(() => setProfile(null));
  }, [location.search]);

  const [profileTab, setProfileTab] = useState(0);

  return (
    <>
      <PageHeader darkMode={darkMode} title="Users" subtitle="Search users, open public profiles, follow and unfollow." />
      <Paper className={classes.premiumPanel} style={{ padding: 18, marginBottom: 22 }} elevation={0}>
        <TextField fullWidth variant="outlined" label="Search users" value={query} onChange={(e) => setQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }} />
      </Paper>
      <Grid container spacing={2}>
        {users.map((item) => (
          <Grid item xs={12} md={6} key={item._id}>
            <Paper className={classes.premiumPanel} style={{ padding: 18 }} elevation={0}>
              <Box display="flex" alignItems="center">
                <Avatar src={item.avatar}>{item.name?.[0]}</Avatar>
                <Box ml={2} flexGrow={1}><Typography variant="h6">{item.name}</Typography><Typography className={classes.pageSubtitle}>@{item.username || item.email}</Typography></Box>
                <Button onClick={() => openProfile(item._id)}>Open</Button>
                {((currentUser.following || []).map(String).includes(item._id)) ? (
                  <Button onClick={async () => {
                    try {
                      const { data } = await api.unfollowUser(item._id);
                      setUsers((prev) => prev.map((u) => (u._id === data.target._id ? data.target : u)));
                      if (data.requester) dispatch({ type: PROFILE_UPDATED, payload: data.requester });
                      if (profile?.user && profile.user._id === data.target._id) setProfile((p) => ({ ...p, user: data.target }));
                      notify('User unfollowed.');
                    } catch (err) { notify('Failed to unfollow user.'); }
                  }}>Following</Button>
                ) : (
                  <Button onClick={async () => {
                    try {
                      const { data } = await api.followUser(item._id);
                      // Update users list and auth profile
                      setUsers((prev) => prev.map((u) => (u._id === data.target._id ? data.target : u)));
                      if (data.requester) dispatch({ type: PROFILE_UPDATED, payload: data.requester });
                      if (profile?.user && profile.user._id === data.target._id) setProfile((p) => ({ ...p, user: data.target }));
                      notify('User followed.');
                    } catch (err) { notify('Failed to follow user.'); }
                  }}>Follow</Button>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Dialog open={Boolean(profile)} onClose={() => setProfile(null)} maxWidth="md" fullWidth>
        <DialogTitle>{profile?.user?.name}</DialogTitle>
        <DialogContent>
          {profile && (
            <>
              <Box className={classes.cover} style={{ backgroundImage: profile.user.coverImage ? `url(${profile.user.coverImage})` : undefined }} />
              <Box display="flex" alignItems="center" mt={2} justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Avatar src={profile.user.avatar}>{profile.user.name?.[0]}</Avatar>
                  <Box ml={2}><Typography>{profile.user.bio || 'No bio yet.'}</Typography><Typography>{profile.user.location} {profile.user.website}</Typography></Box>
                </Box>
                <Box>
                  {((currentUser.following || []).map(String).includes(profile.user._id)) ? (
                    <Button onClick={async () => {
                      try {
                        const { data } = await api.unfollowUser(profile.user._id);
                        if (data.requester) dispatch({ type: PROFILE_UPDATED, payload: data.requester });
                        setProfile((p) => ({ ...p, user: data.target }));
                        notify('User unfollowed.');
                      } catch (err) { notify('Failed to unfollow user.'); }
                    }}>Following</Button>
                  ) : (
                    <Button onClick={async () => {
                      try {
                        const { data } = await api.followUser(profile.user._id);
                        if (data.requester) dispatch({ type: PROFILE_UPDATED, payload: data.requester });
                        setProfile((p) => ({ ...p, user: data.target }));
                        notify('User followed.');
                      } catch (err) { notify('Failed to follow user.'); }
                    }}>Follow</Button>
                  )}
                </Box>
              </Box>
              <Grid container spacing={2} style={{ marginTop: 12 }}>
                {Object.entries(profile.statistics).map(([key, value]) => <Grid item xs={6} md={3} key={key}><Paper style={{ padding: 12 }}><Typography variant="caption">{key}</Typography><Typography variant="h6">{value}</Typography></Paper></Grid>)}
              </Grid>
              <Grid container spacing={2} style={{ marginTop: 4 }}>
                <Grid item xs={12} md={6}><Paper variant="outlined" style={{ padding: 12 }}><Typography variant="subtitle2">Followers ({(profile.user.followers || []).length})</Typography>{(profile.user.followers || []).slice(0, 8).map((person) => <Box key={person._id} display="flex" alignItems="center" mt={1}><Avatar src={person.avatar} style={{ width: 30, height: 30 }}>{person.name?.[0]}</Avatar><Typography style={{ marginLeft: 8 }}>{person.name} <Typography component="span" variant="caption">@{person.username}</Typography></Typography></Box>)}</Paper></Grid>
                <Grid item xs={12} md={6}><Paper variant="outlined" style={{ padding: 12 }}><Typography variant="subtitle2">Following ({(profile.user.following || []).length})</Typography>{(profile.user.following || []).slice(0, 8).map((person) => <Box key={person._id} display="flex" alignItems="center" mt={1}><Avatar src={person.avatar} style={{ width: 30, height: 30 }}>{person.name?.[0]}</Avatar><Typography style={{ marginLeft: 8 }}>{person.name} <Typography component="span" variant="caption">@{person.username}</Typography></Typography></Box>)}</Paper></Grid>
              </Grid>
              <Box mt={2}>
                <Typography variant="subtitle2">Mutual Friends</Typography>
                <Box display="flex" mt={1}>
                  {(profile.user.followers || []).filter((f) => (currentUser.following || []).map(String).includes(f._id)).slice(0,6).map((m) => (
                    <Box key={m._id} mr={1} textAlign="center"><Avatar src={m.avatar} style={{ width: 44, height: 44 }} />
                      <Typography className={classes.pageSubtitle} style={{ fontSize: 11 }}>{m.name}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box mt={2}><Typography variant="subtitle2">People You May Know</Typography>
                  <Box display="flex" mt={1}>
                    {(profile.user.following || []).filter((f) => !(currentUser.following || []).map(String).includes(f._id)).slice(0,6).map((m) => (
                      <Box key={m._id} mr={1} textAlign="center"><Avatar src={m.avatar} style={{ width: 44, height: 44 }} />
                        <Typography className={classes.pageSubtitle} style={{ fontSize: 11 }}>{m.name}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
              <Box mt={2}>
                <Tabs value={profileTab} onChange={(_, v) => setProfileTab(v)}>
                  <Tab label={`Photos (${(profile.photos || []).length})`} />
                  <Tab label={`Videos (${(profile.videos || []).length})`} />
                  <Tab label={`Albums (${(profile.albums || []).length})`} />
                  <Tab label={`Favorites (${(profile.favorites || []).length || 0})`} />
                  <Tab label={`Activity (${(profile.activity || []).length || 0})`} />
                </Tabs>
                <Box mt={2}>
                  {profileTab === 0 && <Box className={classes.masonry}>{(profile.photos || []).map((photo, index) => <PhotoCard key={photo._id} photo={photo} index={index} selected={[]} setSelected={() => {}} openViewer={() => {}} notify={notify} userId="" darkMode={darkMode} />)}</Box>}
                  {profileTab === 1 && <Box className={classes.masonry}>{(profile.videos || []).map((photo, index) => <PhotoCard key={photo._id} photo={photo} index={index} selected={[]} setSelected={() => {}} openViewer={() => {}} notify={notify} userId="" darkMode={darkMode} />)}</Box>}
                  {profileTab === 2 && <Grid container spacing={2}>{(profile.albums || []).map((album) => (<Grid item xs={12} md={6} key={album._id}><Paper className={classes.premiumPanel} style={{ padding: 12 }}><Typography variant="h6">{album.name}</Typography><Typography className={classes.pageSubtitle}>{album.description}</Typography><Button onClick={async () => { await api.fetchAlbum(album._id); }}>Open</Button></Paper></Grid>))}</Grid>}
                  {profileTab === 3 && <Box className={classes.masonry}>{(profile.favorites || []).map((photo, index) => <PhotoCard key={photo._id} photo={photo} index={index} selected={[]} setSelected={() => {}} openViewer={() => {}} notify={notify} userId="" darkMode={darkMode} />)}</Box>}
                  {profileTab === 4 && <Box>{(profile.activity || []).map((act) => (<Paper key={act._id} className={classes.premiumPanel} style={{ padding: 12, marginBottom: 8 }}><Typography variant="caption">{act.type}</Typography><Typography>{act.title}</Typography><Typography className={classes.pageSubtitle}>{act.message}</Typography><Typography variant="caption">{new Date(act.createdAt).toLocaleString()}</Typography></Paper>))}</Box>}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const NotificationsPage = ({ darkMode, notify }) => {
  const classes = useStyles({ darkMode });
  const [items, setItems] = useState([]);
  const history = useHistory();

  const openNotification = (item) => {
    if (item.photo) {
      history.push(`/photo/${item.photo}`);
      return;
    }
    if (item.album) {
      history.push(`/albums/${item.album}`);
      return;
    }
    if (item.type === 'message') {
      history.push('/messages');
      return;
    }
    if (item.actor) {
      history.push(`/users?open=${item.actor._id || item.actor}`);
      return;
    }
    history.push('/');
  };

  useEffect(() => {
    api.fetchNotifications().then(({ data }) => setItems(data));
  }, []);

  const markAllRead = async () => {
    const unread = items.filter((i) => !i.read);
    await Promise.all(unread.map((n) => api.markNotificationRead(n._id)));
    const { data } = await api.fetchNotifications();
    setItems(data);
    notify('All notifications marked read.');
  };

  return (
    <>
      <PageHeader darkMode={darkMode} title="Notification Center" subtitle="Uploads, shares, comments, likes, followers, messages and album invitations." action={<Button variant="outlined" color="primary" onClick={markAllRead}>Mark all read</Button>} />
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} md={6} key={item._id}>
            <Paper
              className={classes.premiumPanel}
              style={{
                padding: 18,
                opacity: item.read ? 0.72 : 1,
                cursor: 'pointer',
              }}
              elevation={0}
              onClick={() => openNotification(item)}
            >
              <Box display="flex" alignItems="center">
                <Bell color={item.read ? '#94a3b8' : '#38bdf8'} />
                <Box ml={2} flexGrow={1}>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography className={classes.pageSubtitle}>
                    {item.message}
                  </Typography>
                  <Typography variant="caption">
                    {new Date(item.createdAt).toLocaleString()} • {item.read ? 'Read' : 'Unread'}
                  </Typography>
                </Box>
                {!item.read && (
                  <IconButton
                    onClick={async (e) => {
                      e.stopPropagation();
                      const { data } = await api.markNotificationRead(item._id);
                      setItems(items.map((row) => (row._id === data._id ? data : row)));
                      notify('Notification marked read.');
                    }}
                  >
                    <CheckCircle size={18} />
                  </IconButton>
                )}
                <IconButton
                  onClick={async (e) => {
                    e.stopPropagation();
                    await api.deleteNotification(item._id);
                    setItems(items.filter((row) => row._id !== item._id));
                    notify('Notification deleted.');
                  }}
                >
                  <Trash2 size={18} />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

const CameraModal = ({ open, onClose, onConfirm, notify, isSending }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async (overrideFacing) => {
    setCameraError(null);
    const mode = overrideFacing || facingMode;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported on this device/browser.');
      return;
    }
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please grant camera permission in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device found on this system.');
      } else {
        setCameraError(`Camera error: ${err.message || 'Unable to open camera.'}`);
      }
    }
  }, [facingMode, stream]);

  useEffect(() => {
    if (open && !capturedImage && !stream) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setCameraError(null);
    onClose();
  };

  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleSend = () => {
    if (!capturedImage) return;
    onConfirm(capturedImage, handleClose);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle style={{ background: '#0f172a', color: '#fff', fontWeight: 800 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" style={{ gap: 8 }}>
            <Camera size={22} color="#38bdf8" />
            <Typography variant="h6" style={{ fontWeight: 800 }}>
              {capturedImage ? 'Preview Captured Photo' : 'Take Photo with Camera'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} style={{ color: '#fff' }}><X size={20} /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent style={{ background: '#0f172a', color: '#fff', textAlign: 'center', padding: 16 }}>
        {cameraError ? (
          <Box p={4}>
            <Camera size={48} color="#ef4444" style={{ marginBottom: 12 }} />
            <Typography variant="body1" style={{ color: '#f87171', fontWeight: 700 }}>
              {cameraError}
            </Typography>
            <Typography variant="caption" style={{ display: 'block', marginTop: 8, color: '#94a3b8' }}>
              You can still attach photos from your gallery using the gallery selection options below.
            </Typography>
          </Box>
        ) : capturedImage ? (
          <Box style={{ position: 'relative' }}>
            <img src={capturedImage} alt="Captured" style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }} />
          </Box>
        ) : (
          <Box style={{ position: 'relative', width: '100%', minHeight: 300, background: '#000', borderRadius: 12, overflow: 'hidden' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions style={{ background: '#0f172a', padding: '12px 24px', justifyContent: 'space-between' }}>
        <Button onClick={handleClose} disabled={isSending} style={{ color: '#94a3b8' }}>
          Cancel
        </Button>
        <Box display="flex" style={{ gap: 10 }}>
          {capturedImage ? (
            <>
              <Button variant="outlined" onClick={retakePhoto} disabled={isSending} style={{ color: '#38bdf8', borderColor: '#38bdf8' }} startIcon={<RefreshCw size={16} />}>
                Retake
              </Button>
              <Button variant="contained" onClick={handleSend} disabled={isSending} style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', fontWeight: 700 }} startIcon={<Send size={16} />}>
                {isSending ? 'Sending...' : 'Confirm & Send'}
              </Button>
            </>
          ) : !cameraError ? (
            <>
              <IconButton onClick={switchCamera} style={{ color: '#94a3b8' }} title="Switch Camera">
                <RotateCw size={20} />
              </IconButton>
              <Button variant="contained" onClick={capturePhoto} style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 800 }} startIcon={<Camera size={18} />}>
                Capture Photo
              </Button>
            </>
          ) : null}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

const MessagesPage = ({ notify, darkMode }) => {
  const classes = useStyles({ darkMode });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userId = useSelector((state) => state.auth.authData?.result?._id);
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [viewerPhotos, setViewerPhotos] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadConversations = useCallback(() => api.fetchConversations().then(({ data }) => setConversations(data)).catch(() => {}), []);

  useEffect(() => {
    loadConversations();
    api.fetchPosts({ limit: 60 }).then(({ data }) => setPhotos(data.data || data)).catch(() => {});
  }, [loadConversations]);

  useEffect(() => {
    if (!query.trim()) { setUsers([]); return undefined; }
    const timer = setTimeout(() => api.searchUsers(query).then(({ data }) => setUsers(data.filter((person) => person._id !== userId))).catch(() => setUsers([])), 250);
    return () => clearTimeout(timer);
  }, [query, userId]);

  const openConversation = async (conversation) => {
    try {
      const { data } = await api.fetchMessages(conversation._id);
      setActive(conversation);
      setMessages(data.messages || []);
      loadConversations();
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      notify('Unable to load messages.');
    }
  };

  useEffect(() => {
    if (!active) return undefined;
    const interval = setInterval(async () => {
      try {
        const { data } = await api.fetchMessages(active._id);
        setMessages(data.messages || []);
        loadConversations();
      } catch (err) {}
    }, 3500);
    return () => clearInterval(interval);
  }, [active, loadConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const startConversation = async (person) => {
    try {
      const { data } = await api.createConversation([person._id]);
      setQuery('');
      setUsers([]);
      await openConversation(data);
    } catch (error) {
      notify(error.response?.data?.message || 'Unable to start conversation.');
    }
  };

  const submit = async (event) => {
    if (event) event.preventDefault();
    if (!active || (!text.trim() && !selectedPhotos.length)) return;
    setIsSending(true);
    try {
      const { data } = await api.sendMessage(active._id, { text: text.trim(), photoIds: selectedPhotos, replyTo: replyTo?._id });
      setMessages((prev) => [...prev, data]);
      setText('');
      setSelectedPhotos([]);
      setReplyTo(null);
      loadConversations();
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      notify(error.response?.data?.message || 'Message could not be sent.');
    } finally {
      setIsSending(false);
    }
  };

  const sendCapturedPhoto = async (dataUrl, closeModal) => {
    if (!active || !dataUrl) return;
    setIsSending(true);
    try {
      const photoPayload = {
        title: `Camera Photo - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        selectedFile: dataUrl,
        folder: 'messages',
        visibility: 'shared',
        sharedWith: active.participants.map((p) => p._id || p),
      };

      const { data: createdPhoto } = await api.createPost(photoPayload);
      const { data: sentMessage } = await api.sendMessage(active._id, {
        text: text.trim(),
        photoIds: [createdPhoto._id],
        replyTo: replyTo?._id,
      });

      setMessages((prev) => [...prev, sentMessage]);
      setText('');
      setSelectedPhotos([]);
      setReplyTo(null);
      loadConversations();
      setTimeout(scrollToBottom, 100);
      notify('Camera photo sent successfully!');
      closeModal();
    } catch (error) {
      console.error('Send camera photo error:', error);
      notify(error.response?.data?.message || 'Failed to send camera photo.');
    } finally {
      setIsSending(false);
    }
  };

  const activeRecipient = active ? active.participants.find((item) => String(item._id) !== String(userId)) || {} : {};

  return (
    <>
      <PageHeader darkMode={darkMode} title="Direct Messages" subtitle="WhatsApp-style messaging: persist conversations, share photos, reply, react, and message users in real-time." />
      <Grid container spacing={2}>
        {(!isMobile || !active) && (
          <Grid item xs={12} md={4}>
            <Paper className={classes.premiumPanel} style={{ padding: 14, minHeight: 560 }}>
              <TextField fullWidth variant="outlined" size="small" placeholder="Search contacts or users..." value={query} onChange={(event) => setQuery(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }} />
              {users.map((person) => (
                <ListItem button key={person._id} onClick={() => startConversation(person)}>
                  <Avatar src={person.avatar}>{person.name?.[0]}</Avatar>
                  <ListItemText primary={person.name} secondary={`@${person.username || person.email}`} style={{ marginLeft: 8 }} />
                </ListItem>
              ))}
              <Divider style={{ margin: '12px 0' }} />
              <Typography variant="caption" style={{ opacity: 0.7, marginBottom: 8, display: 'block', fontWeight: 700 }}>Chats</Typography>
              {!conversations.length ? (
                <Box p={3} textAlign="center">
                  <MessageCircle size={36} color="#94a3b8" />
                  <Typography variant="body2" style={{ opacity: 0.7, marginTop: 8 }}>No active chats yet. Search for registered users above to start messaging.</Typography>
                </Box>
              ) : (
                conversations.map((conversation) => {
                  const person = conversation.participants.find((item) => String(item._id) !== String(userId)) || {};
                  const isSelected = active?._id === conversation._id;
                  return (
                    <ListItem button selected={isSelected} key={conversation._id} onClick={() => openConversation(conversation)} style={{ borderRadius: 12, marginBottom: 4 }}>
                      <Badge badgeContent={conversation.unreadCount} color="secondary">
                        <Avatar src={person.avatar}>{person.name?.[0]}</Avatar>
                      </Badge>
                      <ListItemText
                        primary={person.name || 'Group Chat'}
                        secondary={conversation.lastMessage?.text || (conversation.lastMessage?.photos?.length ? '📷 Photo Attachment' : 'No messages yet')}
                        secondaryTypographyProps={{ noWrap: true, style: { fontSize: '0.85rem' } }}
                        style={{ marginLeft: 8 }}
                      />
                      {conversation.lastMessageAt && (
                        <Typography variant="caption" style={{ opacity: 0.6, fontSize: 11, marginLeft: 6 }}>
                          {new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      )}
                    </ListItem>
                  );
                })
              )}
            </Paper>
          </Grid>
        )}

        {(!isMobile || active) && (
          <Grid item xs={12} md={8}>
            <Paper className={classes.premiumPanel} style={{ padding: 16, minHeight: 560, display: 'flex', flexDirection: 'column' }}>
              {!active ? (
                <Box m="auto" textAlign="center">
                  <MessageCircle size={56} color="#38bdf8" />
                  <Typography variant="h6" style={{ marginTop: 12, fontWeight: 800 }}>WhatsApp-Style Direct Messages</Typography>
                  <Typography className={classes.pageSubtitle}>Select a contact on the left or search for a registered user to start chatting.</Typography>
                </Box>
              ) : (
                <>
                  <Box display="flex" alignItems="center" pb={1.5} mb={1.5} style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
                    {isMobile && (
                      <IconButton style={{ color: '#fff', marginRight: 8 }} onClick={() => setActive(null)}>
                        <ChevronLeft size={24} />
                      </IconButton>
                    )}
                    <Avatar src={activeRecipient.avatar}>{activeRecipient.name?.[0]}</Avatar>
                    <Box ml={1.5}>
                      <Typography variant="h6" style={{ fontWeight: 800, fontSize: '1.05rem' }}>{activeRecipient.name || 'Chat'}</Typography>
                      <Typography variant="caption" className={classes.pageSubtitle}>@{activeRecipient.username || 'active'}</Typography>
                    </Box>
                  </Box>
                  <Box flexGrow={1} style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 8 }}>
                    {messages.map((message) => {
                      const isSelf = String(message.sender?._id || message.sender) === String(userId);
                      const isRead = (message.readBy || []).length > 1;
                      return (
                        <Box key={message._id} display="flex" justifyContent={isSelf ? 'flex-end' : 'flex-start'} mb={1.5}>
                          <Paper style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: 16, background: isSelf ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.08)', color: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
                            <Typography variant="caption" style={{ opacity: 0.8, fontWeight: 700, fontSize: '0.75rem' }}>{message.sender?.name || (isSelf ? 'You' : 'Contact')}</Typography>
                            {message.replyTo && (
                              <Box p={1} my={0.5} style={{ borderRadius: 8, background: 'rgba(0,0,0,0.22)', borderLeft: '3px solid #7dd3fc' }}>
                                <Typography variant="caption" style={{ opacity: 0.9 }}>{message.replyTo.text || 'Photo Attachment'}</Typography>
                              </Box>
                            )}
                            <Typography style={{ marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.95rem' }}>{message.deletedAt ? 'Message deleted' : message.text}</Typography>
                            <Box display="flex" flexWrap="wrap" mt={1}>
                              {(message.photos || []).map((photo) => (
                                <img
                                  key={photo._id}
                                  src={photo.cloudinaryUrl || photo.selectedFile}
                                  alt={photo.title}
                                  style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10, margin: 3, cursor: 'pointer' }}
                                  onClick={() => {
                                    setViewerPhotos(message.photos);
                                    setViewerIndex(message.photos.findIndex((p) => p._id === photo._id));
                                  }}
                                />
                              ))}
                            </Box>
                            {(message.attachments || []).length > 0 && (
                              <Box mt={1}>
                                {message.attachments.map((att, i) => (
                                  <Box key={i} display="flex" alignItems="center" p={1} style={{ borderRadius: 8, background: 'rgba(0,0,0,0.25)', marginBottom: 4 }}>
                                    <HardDrive size={18} style={{ marginRight: 8, color: '#38bdf8' }} />
                                    <Box flexGrow={1}>
                                      <Typography variant="caption" style={{ fontWeight: 700, display: 'block' }}>{att.fileName}</Typography>
                                      <Typography variant="caption" style={{ opacity: 0.7 }}>{att.fileSize ? `${(att.fileSize / 1024).toFixed(1)} KB` : 'Document'}</Typography>
                                    </Box>
                                    <IconButton size="small" style={{ color: '#fff' }} onClick={() => window.open(att.url, '_blank')}><Download size={14} /></IconButton>
                                  </Box>
                                ))}
                              </Box>
                            )}
                            <Box display="flex" alignItems="center" mt={1} justifyContent="space-between">
                              <Box display="flex" alignItems="center">
                                {['❤️', '👍', '😂', '🔥'].map((emoji) => (
                                  <IconButton
                                    key={emoji}
                                    size="small"
                                    style={{ padding: 2 }}
                                    onClick={async () => {
                                      const { data } = await api.reactToMessage(active._id, message._id, emoji);
                                      setMessages((prev) => prev.map((item) => (item._id === data._id ? { ...item, reactions: data.reactions } : item)));
                                    }}
                                  >
                                    <span style={{ fontSize: 13 }}>{emoji}</span>
                                  </IconButton>
                                ))}
                                <Typography variant="caption" style={{ marginLeft: 4 }}>
                                  {(message.reactions || []).map((r) => r.emoji).join(' ')}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" style={{ gap: 4 }}>
                                <Typography variant="caption" style={{ opacity: 0.7, fontSize: 10 }}>
                                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                                {isSelf && (
                                  <Typography variant="caption" style={{ color: isRead ? '#38bdf8' : '#94a3b8', fontSize: 11, fontWeight: 900 }}>
                                    {isRead ? '✓✓' : '✓'}
                                  </Typography>
                                )}
                                <IconButton size="small" style={{ color: '#fff', padding: 2 }} title="Copy text" onClick={() => { if (message.text) { navigator.clipboard.writeText(message.text); if (notify) notify('Message text copied.'); } }}><Copy size={12} /></IconButton>
                                <IconButton size="small" style={{ color: '#fff', padding: 2 }} title="Reply" onClick={() => setReplyTo(message)}>
                                  <Send size={12} style={{ transform: 'rotate(-45deg)' }} />
                                </IconButton>
                                {isSelf && !message.deletedAt && (
                                  <IconButton
                                    size="small"
                                    style={{ color: '#fff', padding: 2 }}
                                    title="Delete"
                                    onClick={async () => {
                                      await api.deleteMessage(active._id, message._id);
                                      setMessages((prev) => prev.map((item) => (item._id === message._id ? { ...item, deletedAt: new Date(), text: '' } : item)));
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </IconButton>
                                )}
                              </Box>
                            </Box>
                          </Paper>
                        </Box>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </Box>
                  <form onSubmit={submit} style={{ marginTop: 12 }}>
                    {replyTo && (
                      <Box display="flex" alignItems="center" justifyContent="space-between" p={1} mb={1} style={{ borderRadius: 8, background: 'rgba(56,189,248,0.14)' }}>
                        <Typography variant="caption">Replying to: <strong>{replyTo.text || 'Photo Attachment'}</strong></Typography>
                        <IconButton size="small" onClick={() => setReplyTo(null)}><X size={14} /></IconButton>
                      </Box>
                    )}
                    {photos.length > 0 && (
                      <Box display="flex" flexWrap="wrap" mb={1}>
                        <Typography variant="caption" style={{ opacity: 0.8, width: '100%', marginBottom: 4 }}>Attach from Gallery:</Typography>
                        {photos.filter((photo) => String(photo.owner) === String(userId)).slice(0, 8).map((photo) => (
                          <Avatar
                            key={photo._id}
                            variant="rounded"
                            src={photo.cloudinaryUrl || photo.selectedFile}
                            onClick={() => setSelectedPhotos(selectedPhotos.includes(photo._id) ? selectedPhotos.filter((id) => id !== photo._id) : [...selectedPhotos, photo._id])}
                            style={{ margin: 3, cursor: 'pointer', border: selectedPhotos.includes(photo._id) ? '3px solid #38bdf8' : 'none' }}
                          />
                        ))}
                      </Box>
                    )}
                    <Box display="flex" style={{ gap: 8 }} alignItems="center">
                      <Tooltip title="Take photo with Camera">
                        <IconButton
                          style={{ color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', padding: 8 }}
                          onClick={() => setCameraOpen(true)}
                        >
                          <Camera size={20} />
                        </IconButton>
                      </Tooltip>
                      <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        variant="outlined"
                        size="small"
                        placeholder="Type a message (Enter to send, Shift+Enter for new line)..."
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            submit(e);
                          }
                        }}
                      />
                      <Button type="submit" disabled={isSending || (!text.trim() && !selectedPhotos.length)} className={classes.glowButton} startIcon={<Send size={16} />}>
                        {isSending ? 'Sending...' : 'Send'}
                      </Button>
                    </Box>
                  </form>
                  <CameraModal
                    open={cameraOpen}
                    onClose={() => setCameraOpen(false)}
                    onConfirm={sendCapturedPhoto}
                    notify={notify}
                    isSending={isSending}
                  />
                </>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
      <ImageViewer photos={viewerPhotos} index={viewerIndex} setIndex={setViewerIndex} notify={notify} darkMode={darkMode} />
    </>
  );
};

const Admin = ({ darkMode }) => {
  const classes = useStyles({ darkMode });
  const dispatch = useDispatch();
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState([]);
  const [adminTab, setAdminTab] = useState(0);

  const loadData = useCallback(() => {
    dispatch(loadAdminOverview()).then((data) => {
      setOverview(data);
      if (data?.reports) setReports(data.reports);
    }).catch(() => setOverview({ error: 'Admin access required.' }));
  }, [dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateReport = async (id, status) => {
    try {
      const { data } = await api.updateReportStatus(id, status);
      setReports((prev) => prev.map((r) => (r._id === data._id ? data : r)));
    } catch (err) {
      console.error(err);
    }
  };

  if (!overview) return <CircularProgress />;
  if (overview.error) return <Typography color="error">{overview.error}</Typography>;

  return (
    <>
      <PageHeader darkMode={darkMode} title="Admin Moderation & Analytics" subtitle="Review user reports, moderate photos, view analytics and manage users." />
      <Box mb={3}>
        <Tabs value={adminTab} onChange={(_, val) => setAdminTab(val)}>
          <Tab label="Analytics & Overview" />
          <Tab label={`Moderation Queue (${reports.filter((r) => r.status === 'pending').length})`} />
          <Tab label={`Users (${overview.users?.length || 0})`} />
        </Tabs>
      </Box>
      {adminTab === 0 && (
        <Grid container spacing={3}>
          {Object.entries(overview.analytics || {}).map(([key, value]) => (
            <Grid item xs={6} md={3} key={key}>
              <Paper className={`${classes.premiumPanel} ${classes.statCard}`} elevation={0}>
                <Shield color="#38bdf8" />
                <Typography className={classes.pageSubtitle}>{key}</Typography>
                <Typography variant="h5">{key.includes('Storage') ? `${(value / 1024 / 1024).toFixed(1)} MB` : value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      {adminTab === 1 && (
        <Grid container spacing={2}>
          {reports.length === 0 ? (
            <Grid item xs={12}><Typography className={classes.pageSubtitle}>No reports in moderation queue.</Typography></Grid>
          ) : (
            reports.map((report) => (
              <Grid item xs={12} key={report._id}>
                <Paper className={classes.premiumPanel} style={{ padding: 18 }} elevation={0}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6">[{report.targetType.toUpperCase()}] {report.reason.toUpperCase()}</Typography>
                      <Typography className={classes.pageSubtitle}>Reported by: {report.reporter?.name || 'User'} • Details: {report.details || 'None'}</Typography>
                      <Typography variant="caption">Status: <strong>{report.status}</strong> • {new Date(report.createdAt).toLocaleString()}</Typography>
                    </Box>
                    <Box display="flex" style={{ gap: 8 }}>
                      {report.status !== 'resolved' && <Button size="small" variant="contained" color="primary" onClick={() => updateReport(report._id, 'resolved')}>Resolve</Button>}
                      {report.status !== 'rejected' && <Button size="small" variant="outlined" color="secondary" onClick={() => updateReport(report._id, 'rejected')}>Reject</Button>}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      )}
      {adminTab === 2 && (
        <Grid container spacing={2}>
          {(overview.users || []).map((item) => (
            <Grid item xs={12} md={6} key={item._id}>
              <Paper className={classes.premiumPanel} style={{ padding: 18 }} elevation={0}>
                <Box display="flex" alignItems="center">
                  <Avatar src={item.avatar}>{item.name?.[0]}</Avatar>
                  <Box ml={2} flexGrow={1}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography className={classes.pageSubtitle}>{item.email} • Role: <strong>{item.role}</strong></Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

const PhotoDetail = ({ notify, darkMode }) => {
  const classes = useStyles({ darkMode });
  const routerHistory = useHistory();
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErrorStatus(null);
    setErrorMsg('');
    api.fetchPost(id)
      .then(({ data }) => setPhoto(data))
      .catch((err) => {
        setErrorStatus(err.response?.status || 500);
        setErrorMsg(err.response?.data?.message || 'Photo unavailable or permission denied.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <CircularProgress />;
  if (errorStatus || !photo) {
    return (
      <Paper className={classes.premiumPanel} style={{ padding: 28, textAlign: 'center' }} elevation={0}>
        <Typography variant="h6" color="error">
          {errorStatus === 401 ? '401 — Authentication Required' : errorStatus === 403 ? '403 — Access Forbidden' : '404 — Photo Unavailable'}
        </Typography>
        <Typography className={classes.pageSubtitle} style={{ marginTop: 8 }}>
          {errorMsg || 'Photo not found or you do not have permission to view it.'}
        </Typography>
        <Box mt={3}>
          <Button variant="outlined" color="primary" onClick={() => routerHistory.push('/')}>Return to Gallery</Button>
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <PageHeader darkMode={darkMode} title={photo.title} subtitle={`Uploaded by ${photo.creator || 'User'}`} />
      <Paper className={classes.premiumPanel} style={{ padding: 20 }}>
        <img src={photo.selectedFile || photo.cloudinaryUrl} alt={photo.title} style={{ maxWidth: '100%', maxHeight: 600, borderRadius: 16, display: 'block', margin: '0 auto' }} />
        <Box mt={2}>
          <Typography variant="body1">{photo.message}</Typography>
          <Typography variant="caption" style={{ opacity: 0.7 }}>Visibility: {photo.visibility} | Size: {photo.size ? `${(photo.size / 1024).toFixed(1)} KB` : 'Unknown'}</Typography>
        </Box>
      </Paper>
    </>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.authData);
  const [toast, setToast] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => { dispatch(autoLogin()); }, [dispatch]);

  const notify = useMemo(() => (message) => setToast(message), []);

  return (
    <>
      <Switch>
        <Route exact path="/auth"><Redirect to="/auth/login" /></Route>
        <Route exact path="/auth/login"><AuthPage notify={notify} initialMode="login" /></Route>
        <Route exact path="/auth/signup"><AuthPage notify={notify} initialMode="signup" /></Route>
        <Route exact path="/auth/forgot"><AuthPage notify={notify} initialMode="forgot" /></Route>
        <Route exact path="/auth/reset"><AuthPage notify={notify} initialMode="reset" /></Route>
        <Route exact path="/auth/verify"><AuthPage notify={notify} initialMode="verify" /></Route>
        <Route exact path="/auth/otp"><AuthPage notify={notify} initialMode="otp" /></Route>
        <Route exact path="/auth/oauth"><OAuthComplete notify={notify} /></Route>
        <Route exact path="/auth/oauth-config"><OAuthConfigPage /></Route>
        <Route exact path="/"><HomePage user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode} /></Route>
        <ProtectedRoute exact path="/gallery" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><Gallery notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/photos" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><Gallery notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/dashboard" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><Dashboard notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/albums" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><Albums notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/albums/:id" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><AlbumDetail notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/album/:id" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><AlbumDetail notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/photo/:id" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><PhotoDetail notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/favorites" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><CollectionPage type="favorites" notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/downloads" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><CollectionPage type="downloads" notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/trash" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><CollectionPage type="trash" notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/shared" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><CollectionPage type="shared" notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/messages" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><MessagesPage notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/storage" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><StoragePage darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/notifications" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><NotificationsPage notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/users" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><UsersPage notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/settings" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><SettingsPage notify={notify} darkMode={darkMode} setDarkMode={setDarkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/profile" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><Profile notify={notify} darkMode={darkMode} /></AppShell></ProtectedRoute>
        <ProtectedRoute exact path="/admin" user={user}><AppShell user={user} notify={notify} darkMode={darkMode} setDarkMode={setDarkMode}><Admin darkMode={darkMode} /></AppShell></ProtectedRoute>
      </Switch>
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4200}
        onClose={() => setToast('')}
        message={toast}
        action={<IconButton size="small" color="inherit" onClick={() => setToast('')}><X size={16} /></IconButton>}
      />
    </>
  );
};

export default App;
