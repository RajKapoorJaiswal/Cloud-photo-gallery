import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Cloud,
  UploadCloud,
  Shield,
  Grid3X3,
  Share2,
  Lock,
  CheckCircle,
  Zap,
  Sparkles,
  ArrowRight,
  HardDrive,
  Image as ImageIcon,
} from 'lucide-react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Container, Grid, Typography, Chip } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  homeRoot: {
    minHeight: '100vh',
    color: '#eaf2ff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflowX: 'hidden',
    background: 'radial-gradient(circle at 16% 10%, rgba(76, 111, 255, 0.30), transparent 28%), radial-gradient(circle at 78% 4%, rgba(20, 184, 166, 0.20), transparent 26%), linear-gradient(135deg, #06111f 0%, #0a1221 48%, #111827 100%)',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(24px)',
    backgroundColor: 'rgba(8, 15, 30, 0.72)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
    boxShadow: '0 18px 60px rgba(15, 23, 42, 0.10)',
    padding: '16px 0',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed 48%, #06b6d4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    boxShadow: '0 14px 32px rgba(37, 99, 235, 0.38)',
  },
  logoText: {
    fontWeight: 900,
    fontSize: '1.35rem',
    color: '#f8fbff',
    letterSpacing: '-0.02em',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  loginBtn: {
    color: '#edf5ff',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: '12px',
    padding: '8px 20px',
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.95rem',
    transition: 'all 0.25s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.14)',
      borderColor: 'rgba(125, 211, 252, 0.4)',
      color: '#ffffff',
    },
  },
  signUpBtn: {
    background: 'linear-gradient(135deg, #2563eb, #7c3aed 52%, #06b6d4)',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '8px 22px',
    fontWeight: 700,
    textTransform: 'none',
    fontSize: '0.95rem',
    boxShadow: '0 18px 44px rgba(37, 99, 235, 0.38)',
    transition: 'all 0.25s ease',
    '&:hover': {
      boxShadow: '0 22px 54px rgba(37, 99, 235, 0.48)',
      transform: 'translateY(-1px)',
    },
  },
  dashboardBtn: {
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.5)',
    borderRadius: '10px',
    padding: '8px 18px',
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.95rem',
    '&:hover': {
      backgroundColor: 'rgba(56, 189, 248, 0.2)',
    },
  },
  heroSection: {
    padding: '70px 0 90px',
    position: 'relative',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '30px',
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    border: '1px solid rgba(0, 242, 254, 0.25)',
    color: '#38bdf8',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '24px',
  },
  heroTitle: {
    fontWeight: 900,
    fontSize: '3.4rem',
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    marginBottom: '20px',
    color: '#ffffff',
    [theme.breakpoints.down('md')]: {
      fontSize: '2.6rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.1rem',
    },
  },
  heroTitleGradient: {
    background: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 50%, #00f2fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 30px rgba(0, 242, 254, 0.3)',
  },
  heroText: {
    fontSize: '1.15rem',
    lineHeight: 1.65,
    color: '#94a3b8',
    marginBottom: '36px',
    maxWidth: '560px',
  },
  heroCtaGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '40px',
  },
  primaryCta: {
    background: 'linear-gradient(135deg, #00f2fe 0%, #0072ff 100%)',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '14px 32px',
    fontWeight: 700,
    fontSize: '1.05rem',
    textTransform: 'none',
    boxShadow: '0 0 30px rgba(0, 242, 254, 0.4)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(135deg, #38bdf8 0%, #1d4ed8 100%)',
      boxShadow: '0 0 40px rgba(0, 242, 254, 0.6)',
      transform: 'translateY(-2px)',
    },
  },
  secondaryCta: {
    color: '#e2e8f0',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '14px 28px',
    fontWeight: 600,
    fontSize: '1.05rem',
    textTransform: 'none',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(30, 41, 59, 0.9)',
      borderColor: '#38bdf8',
      color: '#38bdf8',
      boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
    },
  },
  trustPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    color: '#64748b',
    fontSize: '0.88rem',
    fontWeight: 500,
    flexWrap: 'wrap',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#cbd5e1',
  },
  previewCardWrapper: {
    position: 'relative',
    borderRadius: '24px',
    padding: '24px',
    background: 'rgba(13, 23, 42, 0.68)',
    backdropFilter: 'blur(22px)',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.12)',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
    paddingBottom: '14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#38bdf8',
    fontWeight: 600,
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00f2fe',
    boxShadow: '0 0 10px #00f2fe',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
    marginBottom: '20px',
  },
  galleryImgCard: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    height: '140px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.03)',
      borderColor: '#00f2fe',
      boxShadow: '0 8px 24px rgba(0, 242, 254, 0.25)',
    },
  },
  galleryImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imgBadge: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(6, 11, 24, 0.75)',
    backdropFilter: 'blur(4px)',
    color: '#ffffff',
    fontSize: '0.72rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  storageWidget: {
    borderRadius: '16px',
    padding: '16px',
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
    border: '1px solid rgba(56, 189, 248, 0.2)',
  },
  storageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  storageTitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  storageVal: {
    fontSize: '0.85rem',
    color: '#00f2fe',
    fontWeight: 700,
  },
  progressBarBg: {
    height: '8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    width: '32%',
    borderRadius: '4px',
    background: 'linear-gradient(90deg, #00f2fe 0%, #3b82f6 100%)',
    boxShadow: '0 0 12px rgba(0, 242, 254, 0.5)',
  },
  floatingBadge: {
    position: 'absolute',
    top: '-16px',
    right: '-16px',
    padding: '8px 14px',
    borderRadius: '12px',
    backgroundColor: '#0f172a',
    border: '1px solid #00f2fe',
    boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#ffffff',
    zIndex: 10,
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  featuresSection: {
    padding: '90px 0',
    position: 'relative',
  },
  sectionTitle: {
    fontWeight: 900,
    fontSize: '2.5rem',
    textAlign: 'center',
    marginBottom: '12px',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  sectionSubtitle: {
    fontSize: '1.1rem',
    textAlign: 'center',
    color: '#94a3b8',
    marginBottom: '60px',
    maxWidth: '640px',
    margin: '0 auto 60px',
  },
  featureCard: {
    padding: '36px 28px',
    borderRadius: '24px',
    background: 'rgba(13, 23, 42, 0.68)',
    backdropFilter: 'blur(22px)',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.12)',
    height: '100%',
    transition: 'all 0.35s ease',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-6px)',
      background: 'rgba(15, 25, 48, 0.85)',
      borderColor: 'rgba(56, 189, 248, 0.35)',
      boxShadow: '0 30px 80px rgba(37, 99, 235, 0.2)',
    },
  },
  featureIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(6, 182, 212, 0.18) 100%)',
    border: '1px solid rgba(125, 211, 252, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#38bdf8',
    marginBottom: '24px',
    boxShadow: '0 10px 24px rgba(37, 99, 235, 0.25)',
  },
  featureTitle: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#f8fbff',
    marginBottom: '14px',
  },
  featureDesc: {
    fontSize: '0.98rem',
    color: 'rgba(226, 232, 240, 0.68)',
    lineHeight: 1.6,
    marginBottom: '20px',
    flexGrow: 1,
  },
  featureTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  featureChip: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    color: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  statsBanner: {
    margin: '40px 0 90px',
    padding: '36px 40px',
    borderRadius: '24px',
    background: 'rgba(13, 23, 42, 0.68)',
    backdropFilter: 'blur(22px)',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.12)',
  },
  statItem: {
    textAlign: 'center',
  },
  statNum: {
    fontSize: '2.2rem',
    fontWeight: 900,
    color: '#38bdf8',
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: 'rgba(226, 232, 240, 0.68)',
    fontWeight: 600,
  },
  ctaBox: {
    margin: '0 0 80px',
    padding: '60px 40px',
    borderRadius: '28px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.22) 0%, rgba(6, 182, 212, 0.14) 100%)',
    border: '1px solid rgba(125, 211, 252, 0.25)',
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.2)',
  },
  ctaTitle: {
    fontWeight: 900,
    fontSize: '2.4rem',
    color: '#ffffff',
    marginBottom: '16px',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.8rem',
    },
  },
  ctaText: {
    fontSize: '1.1rem',
    color: '#cbd5e1',
    marginBottom: '32px',
    maxWidth: '560px',
    margin: '0 auto 32px',
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: '#040711',
    padding: '50px 0 30px',
    position: 'relative',
  },
  footerText: {
    color: '#64748b',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
  footerLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    display: 'block',
    marginBottom: '10px',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#00f2fe',
    },
  },
  footerTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '16px',
  },
}));

const SAMPLE_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    title: 'Alpine Mountains',
    tag: '4K Landscape',
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    title: 'Ocean Sunset',
    tag: 'Favorites ❤️',
  },
  {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    title: 'Emerald Forest',
    tag: 'Cloud Synced',
  },
  {
    url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=600&q=80',
    title: 'Cascade Falls',
    tag: 'Shared Album',
  },
];

const HomePage = ({ user }) => {
  const classes = useStyles();
  const history = useHistory();
  const storage = useSelector((state) => state.auth?.storage);

  const hasRealStorage = Boolean(user && storage && (storage.totalStorage !== undefined || storage.percentUsed !== undefined));

  let realStorageText = '';
  let realPercent = 0;

  if (hasRealStorage) {
    const usedMb = ((storage.totalStorage || 0) / (1024 * 1024)).toFixed(1);
    if (storage.storageLimit) {
      const limitMb = (storage.storageLimit / (1024 * 1024)).toFixed(0);
      realStorageText = `${usedMb} MB / ${limitMb} MB Used`;
    } else {
      realStorageText = `${usedMb} MB Used`;
    }
    realPercent = Math.min(storage.percentUsed || 0, 100);
  }

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={classes.homeRoot}>
      {/* Navigation Header */}
      <header className={classes.header}>
        <Container maxWidth="lg">
          <div className={classes.headerContent}>
            <div className={classes.logoContainer} onClick={() => history.push('/')}>
              <div className={classes.logoIcon}>
                <Cloud size={24} />
              </div>
              <span className={classes.logoText}>Cloud Photo Gallery</span>
            </div>

            <div className={classes.navActions}>
              {user ? (
                <>
                  <Button
                    className={classes.dashboardBtn}
                    onClick={() => history.push('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    className={classes.loginBtn}
                    onClick={() => history.push('/auth/login')}
                  >
                    Login
                  </Button>
                  <Button
                    className={classes.signUpBtn}
                    onClick={() => history.push('/auth/signup')}
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className={classes.loginBtn}
                    onClick={() => history.push('/auth/login')}
                  >
                    Login
                  </Button>
                  <Button
                    className={classes.signUpBtn}
                    onClick={() => history.push('/auth/signup')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <section className={classes.heroSection}>
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center">
            {/* Left Hero Text Column */}
            <Grid item xs={12} md={6}>
              <div className={classes.badge}>
                <Sparkles size={16} />
                <span>Next-Generation Cloud Storage & Gallery</span>
              </div>

              <h1 className={classes.heroTitle}>
                Your memories,{' '}
                <span className={classes.heroTitleGradient}>safe in the cloud.</span>
              </h1>

              <p className={classes.heroText}>
                Cloud Photo Gallery helps you securely store, organize and share your photos and precious memories, anytime, anywhere.
              </p>

              <div className={classes.heroCtaGroup}>
                <Button
                  className={classes.primaryCta}
                  onClick={() => history.push('/auth/signup')}
                  endIcon={<ArrowRight size={18} />}
                >
                  Get Started — It’s Free
                </Button>
                <Button
                  className={classes.secondaryCta}
                  onClick={scrollToFeatures}
                >
                  Explore Features
                </Button>
              </div>

              <div className={classes.trustPills}>
                <div className={classes.trustItem}>
                  <CheckCircle size={16} style={{ color: '#00f2fe' }} />
                  <span>Secure Cloud Storage</span>
                </div>
                <div className={classes.trustItem}>
                  <Shield size={16} style={{ color: '#00f2fe' }} />
                  <span>256-Bit Encrypted</span>
                </div>
                <div className={classes.trustItem}>
                  <Zap size={16} style={{ color: '#00f2fe' }} />
                  <span>Instant Cloud Sync</span>
                </div>
              </div>
            </Grid>

            {/* Right Interactive Photo Gallery & Storage Preview */}
            <Grid item xs={12} md={6}>
              <div className={classes.previewCardWrapper}>
                <div className={classes.floatingBadge}>
                  <UploadCloud size={18} style={{ color: '#00f2fe' }} />
                  <span>100% Backed Up</span>
                </div>

                <div className={classes.previewHeader}>
                  <div className={classes.statusIndicator}>
                    <div className={classes.statusDot} />
                    <span>Cloud Storage Active</span>
                  </div>
                  <Chip
                    icon={<Lock size={12} style={{ color: '#00f2fe' }} />}
                    label="AES-256 Protected"
                    size="small"
                    style={{
                      backgroundColor: 'rgba(0, 242, 254, 0.1)',
                      color: '#38bdf8',
                      border: '1px solid rgba(0, 242, 254, 0.2)',
                      fontSize: '0.72rem',
                    }}
                  />
                </div>

                {/* Sample Photo Grid */}
                <div className={classes.galleryGrid}>
                  {SAMPLE_PHOTOS.map((photo, index) => (
                    <div key={index} className={classes.galleryImgCard}>
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className={classes.galleryImg}
                        loading="lazy"
                        onError={(e) => {
                          // Fallback gradient if unsplash is blocked
                          e.target.style.display = 'none';
                          e.target.parentNode.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
                        }}
                      />
                      <div className={classes.imgBadge}>
                        <ImageIcon size={12} />
                        <span>{photo.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Storage Meter Preview */}
                <div className={classes.storageWidget}>
                  {hasRealStorage ? (
                    <>
                      <div className={classes.storageHeader}>
                        <span className={classes.storageTitle}>
                          <HardDrive size={14} style={{ color: '#00f2fe' }} />
                          Cloud Storage Usage
                        </span>
                        <span className={classes.storageVal}>{realStorageText}</span>
                      </div>
                      <div className={classes.progressBarBg}>
                        <div className={classes.progressBarFill} style={{ width: `${realPercent}%` }} />
                      </div>
                    </>
                  ) : (
                    <div className={classes.storageHeader} style={{ marginBottom: 0 }}>
                      <span className={classes.storageTitle}>
                        <HardDrive size={14} style={{ color: '#00f2fe' }} />
                        Cloud Storage Active
                      </span>
                      <Chip
                        label="Encrypted & Synced"
                        size="small"
                        style={{
                          backgroundColor: 'rgba(0, 242, 254, 0.1)',
                          color: '#00f2fe',
                          border: '1px solid rgba(0, 242, 254, 0.2)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className={classes.featuresSection}>
        <Container maxWidth="lg">
          <h2 className={classes.sectionTitle}>Everything You Need for Your Memories</h2>
          <p className={classes.sectionSubtitle}>
            Designed with state-of-the-art cloud technology, end-to-end security, and effortless sharing.
          </p>

          <Grid container spacing={4}>
            {/* Feature 1 */}
            <Grid item xs={12} md={4}>
              <div className={classes.featureCard}>
                <div className={classes.featureIconBox}>
                  <Shield size={28} />
                </div>
                <h3 className={classes.featureTitle}>Secure Cloud Storage</h3>
                <p className={classes.featureDesc}>
                  Bank-grade 256-bit AES encryption keeps your private photos safe. Automated cloud backups ensure zero data loss with 99.9% uptime.
                </p>
                <div className={classes.featureTags}>
                  <Chip label="256-bit Encryption" size="small" className={classes.featureChip} />
                  <Chip label="Auto Backups" size="small" className={classes.featureChip} />
                  <Chip label="Zero Loss" size="small" className={classes.featureChip} />
                </div>
              </div>
            </Grid>

            {/* Feature 2 */}
            <Grid item xs={12} md={4}>
              <div className={classes.featureCard}>
                <div className={classes.featureIconBox}>
                  <Grid3X3 size={28} />
                </div>
                <h3 className={classes.featureTitle}>Organize Your Photos</h3>
                <p className={classes.featureDesc}>
                  Create custom smart albums, flag favorite memories, search by keyword or title, and safely restore deleted photos from trash.
                </p>
                <div className={classes.featureTags}>
                  <Chip label="Smart Albums" size="small" className={classes.featureChip} />
                  <Chip label="Tag Search" size="small" className={classes.featureChip} />
                  <Chip label="Favorites & Trash" size="small" className={classes.featureChip} />
                </div>
              </div>
            </Grid>

            {/* Feature 3 */}
            <Grid item xs={12} md={4}>
              <div className={classes.featureCard}>
                <div className={classes.featureIconBox}>
                  <Share2 size={28} />
                </div>
                <h3 className={classes.featureTitle}>Share With Anyone</h3>
                <p className={classes.featureDesc}>
                  Share single photos or entire albums using secure links, direct chat messages, and customizable permissions for view or download.
                </p>
                <div className={classes.featureTags}>
                  <Chip label="Custom Links" size="small" className={classes.featureChip} />
                  <Chip label="Direct Chat" size="small" className={classes.featureChip} />
                  <Chip label="Privacy Control" size="small" className={classes.featureChip} />
                </div>
              </div>
            </Grid>
          </Grid>

          {/* Stats Bar */}
          <div className={classes.statsBanner}>
            <Grid container spacing={3} justifyContent="space-around">
              <Grid item xs={6} sm={3} className={classes.statItem}>
                <div className={classes.statNum}>Cloud</div>
                <div className={classes.statLabel}>Encrypted Storage</div>
              </Grid>
              <Grid item xs={6} sm={3} className={classes.statItem}>
                <div className={classes.statNum}>256-Bit</div>
                <div className={classes.statLabel}>Military Security</div>
              </Grid>
              <Grid item xs={6} sm={3} className={classes.statItem}>
                <div className={classes.statNum}>99.9%</div>
                <div className={classes.statLabel}>Cloud Uptime SLA</div>
              </Grid>
              <Grid item xs={6} sm={3} className={classes.statItem}>
                <div className={classes.statNum}>Instant</div>
                <div className={classes.statLabel}>Multi-Device Sync</div>
              </Grid>
            </Grid>
          </div>

          {/* CTA Box */}
          <div className={classes.ctaBox}>
            <h2 className={classes.ctaTitle}>Ready to safeguard your memories?</h2>
            <p className={classes.ctaText}>
              Join thousands of users who trust Cloud Photo Gallery with their most cherished moments.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                className={classes.primaryCta}
                onClick={() => history.push('/auth/signup')}
                endIcon={<ArrowRight size={18} />}
              >
                Get Started — It’s Free
              </Button>
              <Button
                className={classes.loginBtn}
                onClick={() => history.push('/auth/login')}
                style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: '12px' }}
              >
                Sign In to Existing Account
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className={classes.footer}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4}>
              <div className={classes.logoContainer} style={{ marginBottom: '14px' }}>
                <div className={classes.logoIcon}>
                  <Cloud size={20} />
                </div>
                <span className={classes.logoText} style={{ fontSize: '1.2rem' }}>Cloud Photo Gallery</span>
              </div>
              <p className={classes.footerText}>
                Your ultimate cloud solution for storing, organizing, and sharing high-resolution photos securely across all devices.
              </p>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <div className={classes.footerTitle}>Product</div>
              <a href="#features" className={classes.footerLink} onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}>Features</a>
              <a href="#features" className={classes.footerLink} onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}>Security</a>
              <a href="#features" className={classes.footerLink} onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}>Cloud Storage</a>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <div className={classes.footerTitle}>Account</div>
              <a href="/auth/login" className={classes.footerLink} onClick={(e) => { e.preventDefault(); history.push('/auth/login'); }}>Login</a>
              <a href="/auth/signup" className={classes.footerLink} onClick={(e) => { e.preventDefault(); history.push('/auth/signup'); }}>Sign Up</a>
              <a href="/auth/forgot" className={classes.footerLink} onClick={(e) => { e.preventDefault(); history.push('/auth/forgot'); }}>Forgot Password</a>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <div className={classes.footerTitle}>Legal & Privacy</div>
              <a href="#privacy" className={classes.footerLink} onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              <a href="#terms" className={classes.footerLink} onClick={(e) => e.preventDefault()}>Terms of Service</a>
              <a href="#support" className={classes.footerLink} onClick={(e) => e.preventDefault()}>Support Center</a>
            </Grid>
          </Grid>

          <Box mt={5} pt={3} borderTop="1px solid rgba(255, 255, 255, 0.06)" textAlign="center">
            <Typography variant="body2" style={{ color: '#475569' }}>
              © {new Date().getFullYear()} Raj Kapoor Jaiswal | Cloud Photo Gallery. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;
