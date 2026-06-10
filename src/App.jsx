import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';
import ParticleCanvas from './components/ParticleCanvas';
import CustomCursor from './components/CustomCursor';
import GrainOverlay from './components/GrainOverlay';
import FloatingWhatsapp from './components/FloatingWhatsapp';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import ScriptInjector from './components/ScriptInjector';
import { useTrafficTracker } from './utils/useTrafficTracker';
import { api } from './services/api';
import { initScrollDepthTracking } from './utils/analytics';

// Admin Imports
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import DashboardOverview from './pages/admin/DashboardOverview';
import HeroManager from './pages/admin/HeroManager';
import StatsManager from './pages/admin/StatsManager';
import TestimonialsManager from './pages/admin/TestimonialsManager';
import PortfolioManager from './pages/admin/PortfolioManager';
import FaqManager from './pages/admin/FaqManager';
import SettingsManager from './pages/admin/SettingsManager';
import SeoManager from './pages/admin/SeoManager';
import LeadsManager from './pages/admin/LeadsManager';
import MediaLibrary from './pages/admin/MediaLibrary';

import { audioManager } from './utils/audioManager';
import logoDark from './assets/logo-dark.png';
import {
  Volume2,
  VolumeX,
  Mail,
  Menu,
  X,
  Zap
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Scroll-to-top component
function ScrollToTop() {
  const { pathname } = useLocation();

  // Enforce manual scroll restoration to prevent browser from overriding our scroll reset
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Force all possible scrollable containers to scroll to top instantly
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Also reset Lenis scroll position if available
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }

    // Dynamic Canonical Link update
    const productionDomain = 'https://wajd-agency.com';
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const cleanPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
    canonicalLink.setAttribute('href', `${productionDomain}${cleanPath}`);
  }, [pathname]);

  return null;
}

// Wrapper component to get location inside Router context
function AppContent() {
  const [activeSection, setActiveSection] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const performanceMode = true;
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const headerRef = useRef(null);
  const lenisRef = useRef(null);

  // Initialize Traffic analytics tracking
  useTrafficTracker();

  // Global Remote Cache Purge Check
  useEffect(() => {
    const checkGlobalCacheVersion = async () => {
      try {
        // 1. Detect if storage is restricted or disabled
        let storageAvailable = false;
        try {
          const testKey = '__wajd_test_store__';
          localStorage.setItem(testKey, '1');
          storageAvailable = localStorage.getItem(testKey) === '1';
          localStorage.removeItem(testKey);
        } catch (e) {
          storageAvailable = false;
        }

        let sessionStorageAvailable = false;
        try {
          const testKey = '__wajd_session_test__';
          sessionStorage.setItem(testKey, '1');
          sessionStorageAvailable = sessionStorage.getItem(testKey) === '1';
          sessionStorage.removeItem(testKey);
        } catch (e) {
          sessionStorageAvailable = false;
        }

        if (!storageAvailable || !sessionStorageAvailable) {
          console.warn('Storage is not fully available. Skipping cache reset check to prevent loop.');
          return;
        }

        // 2. Prevent reload loop using sessionStorage reload counter
        const RELOAD_COUNT_KEY = 'wajd_reload_count';
        const reloadCountStr = sessionStorage.getItem(RELOAD_COUNT_KEY);
        const reloadCount = reloadCountStr ? parseInt(reloadCountStr, 10) : 0;
        const MAX_RELOADS = 1;

        if (reloadCount >= MAX_RELOADS) {
          console.warn('Maximum reload count reached. Skipping cache reset check to prevent loop.');
          return;
        }

        const settings = await api.settings.get().catch(() => null);
        if (settings && settings.updated_at) {
          const serverVersion = settings.updated_at;
          const localVersion = localStorage.getItem('wajd_global_cache_version');

          if (localVersion && localVersion !== serverVersion) {
            // Increment reload counter before reloading
            sessionStorage.setItem(RELOAD_COUNT_KEY, (reloadCount + 1).toString());

            // 1. Clear Cache Storage (Service Worker assets)
            if (window.caches) {
              try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
              } catch (cacheErr) {
                console.warn('Failed to clear cache storage:', cacheErr);
              }
            }

            // 2. Clear localStorage selectively (MUST retain Supabase auth session keys)
            const keptKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.includes('sb-') || key.includes('supabase'))) {
                keptKeys.push({ key, value: localStorage.getItem(key) });
              }
            }
            localStorage.clear();
            
            // Set version BEFORE reload
            localStorage.setItem('wajd_global_cache_version', serverVersion);
            
            // Restore session
            keptKeys.forEach(item => localStorage.setItem(item.key, item.value));

            // 3. Clear sessionStorage selectively (protect reload counter)
            const keptSessionKeys = [];
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
              if (key === RELOAD_COUNT_KEY) {
                keptSessionKeys.push({ key, value: sessionStorage.getItem(key) });
              }
            }
            sessionStorage.clear();
            keptSessionKeys.forEach(item => sessionStorage.setItem(item.key, item.value));

            // Force reload to pull all files fresh
            window.location.reload();
          } else if (!localVersion) {
            // First visit, initialize version
            localStorage.setItem('wajd_global_cache_version', serverVersion);
          }
        }
      } catch (err) {
        console.warn('Global cache reset check failed:', err);
      }
    };

    checkGlobalCacheVersion();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll depth tracking on route change
  useEffect(() => {
    const cleanup = initScrollDepthTracking();
    return () => {
      cleanup();
    };
  }, [location.pathname]);

  // Lenis smooth scroll + GSAP ScrollTrigger integration
  useEffect(() => {
    const isMobile = window.innerWidth < 1024 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isAdminRoute || isMobile || performanceMode) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        window.__lenis = null;
      }
      return;
    }

    let rafUpdate;

    if (!lenisRef.current) {
      const lenis = new Lenis({
        lerp: 0.12,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.5,
      });

      lenisRef.current = lenis;
      window.__lenis = lenis;

      // Connect Lenis to GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      rafUpdate = (time) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(rafUpdate);
      gsap.ticker.lagSmoothing(0);
    }

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        window.__lenis = null;
      }
      if (rafUpdate) {
        gsap.ticker.remove(rafUpdate);
      }
    };
  }, [isAdminRoute, performanceMode]);

  // Header scroll behavior — hide/show on scroll direction
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let lastScroll = 0;
    const threshold = 80;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      
      if (currentScroll > threshold) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }

      if (currentScroll > lastScroll && currentScroll > 200) {
        header.classList.add('header-hidden');
      } else {
        header.classList.remove('header-hidden');
      }

      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Automatically morph background particles depending on active Route path
  useEffect(() => {
    switch (location.pathname) {
      case '/':
        setActiveSection(0); // Galaxy
        break;
      case '/about':
        setActiveSection(1); // Concentric Rings
        break;
      case '/portfolio':
        setActiveSection(3); // 3D Fibonacci Sphere
        break;
      case '/contact':
        setActiveSection(5); // Pulsing Target
        break;
      case '/privacy':
        setActiveSection(5); // Pulsing Target/Shield
        break;
      default:
        setActiveSection(0);
    }
  }, [location.pathname]);

  // Dynamic SEO Metadata and Canonical Tag Updater
  useEffect(() => {
    const updateSeo = async () => {
      let pageKey = '';
      let defaultTitle;
      let defaultDesc;
      
      switch (location.pathname) {
        case '/':
          pageKey = 'Home';
          defaultTitle = 'وكالة وجد للتسويق | نُوجِد الأثر الذي يتحول إلى مبيعات';
          defaultDesc = 'وجد للتسويق - شريكك الاستراتيجي لإطلاق الحملات الإعلانية وصناعة الهوية الرقمية التي ترفع أرباحك وتوسع حضورك في السوق. وجد... للنتائج وجد.';
          break;
        case '/about':
          pageKey = 'About';
          defaultTitle = 'من نحن | وكالة وجد للتسويق';
          defaultDesc = 'تعرف على قصة وكالة وجد وفلسفتنا التسويقية القائمة على الأثر المالي والشفافية التامة ومضاعفة العائد على الإنفاق الإعلاني.';
          break;
        case '/portfolio':
          pageKey = 'Portfolio';
          defaultTitle = 'معرض النجاح والأثر | أعمال وكالة وجد';
          defaultDesc = 'تصفح نتائج حملاتنا الإعلانية الموثقة لعلامات تجارية كبرى في الخليج والسعودية ومعدلات العائد على الاستثمار الإعلاني (ROAS).';
          break;
        case '/contact':
          pageKey = 'Contact';
          defaultTitle = 'تواصل معنا | صمم استراتيجية نموك';
          defaultDesc = 'تواصل مع فريق وجد للتسويق لبدء استشارتك المجانية وتصميم مسار نمو مخصص يضاعف أرباحك الإعلانية.';
          break;
        case '/privacy':
          defaultTitle = 'سياسة الخصوصية وأمان البيانات | وكالة وجد';
          defaultDesc = 'سياسة الخصوصية وسرية البيانات لدى وكالة وجد للتسويق. نلتزم بأعلى معايير الأمان وحماية الأصول الإعلانية لشركائنا.';
          break;
        default:
          defaultTitle = 'وكالة وجد للتسويق | نُوجِد الأثر الذي يتحول إلى مبيعات';
          defaultDesc = 'وجد للتسويق - شريكك الاستراتيجي لإطلاق الحملات الإعلانية وصناعة الهوية الرقمية التي ترفع أرباحك وتوسع حضورك في السوق. وجد... للنتائج وجد.';
      }

      let title = defaultTitle;
      let description = defaultDesc;
      let keywords = '';
      let ogTitle = defaultTitle;
      let ogDesc = defaultDesc;

      if (pageKey) {
        try {
          const seoData = await api.seo.getForPage(pageKey);
          if (seoData) {
            title = seoData.title || defaultTitle;
            description = seoData.description || defaultDesc;
            keywords = seoData.keywords || '';
            ogTitle = seoData.og_title || title;
            ogDesc = seoData.og_description || description;
          }
        } catch (err) {
          console.error(`Failed to fetch database SEO for page ${pageKey}:`, err);
        }
      }

      // Update document title
      document.title = title;

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);

      // Update keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);

      // Update Open Graph tags
      let ogTitleTag = document.querySelector('meta[property="og:title"]');
      if (ogTitleTag) ogTitleTag.setAttribute('content', ogTitle);
      let ogDescTag = document.querySelector('meta[property="og:description"]');
      if (ogDescTag) ogDescTag.setAttribute('content', ogDesc);
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', window.location.href);

      // Update Twitter tags
      let twitterTitle = document.querySelector('meta[property="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', ogTitle);
      let twitterDescription = document.querySelector('meta[property="twitter:description"]');
      if (twitterDescription) twitterDescription.setAttribute('content', ogDesc);

      // Update canonical link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', window.location.href);
    };

    updateSeo();
  }, [location.pathname]);



  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleMuteToggle = () => {
    const mutedStatus = audioManager.toggleMute();
    setIsMuted(mutedStatus);
  };

  const handleInteraction = () => {
    audioManager.playClick();
  };

  const handleHover = () => {
    audioManager.playHover();
  };

  const toggleMobileMenu = () => {
    audioManager.playClick();
    setMobileMenuOpen((prev) => !prev);
  };



  return (
    <div className={`app-container ${isAdminRoute ? 'admin-mode' : ''} ${performanceMode ? 'performance-mode' : ''}`}>
      {/* Custom Cursor */}
      {!performanceMode && <CustomCursor />}

      {/* Grain Overlay */}
      {!performanceMode && <GrainOverlay />}

      {/* Dynamic tracking pixel and script injector */}
      <ScriptInjector />

      {/* Floating WhatsApp Widget (Kept in codebase, deactivated until number is ready) */}
      {/* {!isAdminRoute && <FloatingWhatsapp />} */}

      {/* Aurora Background */}
      <div className="aurora-container" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1"></div>
        <div className="aurora-blob aurora-blob-2"></div>
        <div className="aurora-blob aurora-blob-3"></div>
        <div className="aurora-blob aurora-blob-4"></div>
      </div>

      {/* Background Interactive Particles */}
      {!performanceMode && <ParticleCanvas activeSection={activeSection} />}

      {/* Scroll to top on route change */}
      <ScrollToTop />

      {/* Floating Header */}
      {!isAdminRoute && (
        <header className={`premium-header ${mobileMenuOpen ? 'menu-open' : ''}`} ref={headerRef}>
          <Link to="/" className="logo-container" onClick={handleInteraction}>
            <img src={logoDark} alt="Wajd Marketing Logo" className="logo-img" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav" onClick={handleInteraction}>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>الرئيسية</Link>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>من نحن</Link>
            <Link to="/portfolio" className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`}>معرض الأعمال</Link>
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>تواصل معنا</Link>
          </nav>

          <div className="nav-controls">
            <button
              type="button"
              className="audio-btn"
              onClick={handleMuteToggle}
              onMouseEnter={handleHover}
              aria-label="Toggle audio"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <div className={`audio-visualizer ${!isMuted ? 'playing' : ''}`}>
                <span className="vis-bar"></span>
                <span className="vis-bar"></span>
                <span className="vis-bar"></span>
                <span className="vis-bar"></span>
                <span className="vis-bar"></span>
              </div>
              <span>{isMuted ? 'تفعيل الأصوات' : 'كتم الأصوات'}</span>
            </button>
            <Link
              to="/contact"
              className="action-btn filled"
              onClick={handleInteraction}
              onMouseEnter={handleHover}
              style={{ textDecoration: 'none' }}
            >
              <span>ابدأ الآن</span>
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={toggleMobileMenu}
              onMouseEnter={handleHover}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>
      )}

      {/* Mobile Navigation Overlay */}
      {!isAdminRoute && (
        <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-nav" onClick={(e) => { handleInteraction(); setMobileMenuOpen(false); }}>
            <Link to="/" className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <span className="mobile-nav-index">01</span>
              <span className="mobile-nav-label">الرئيسية</span>
            </Link>
            <Link to="/about" className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
              <span className="mobile-nav-index">02</span>
              <span className="mobile-nav-label">من نحن</span>
            </Link>
            <Link to="/portfolio" className={`mobile-nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`}>
              <span className="mobile-nav-index">03</span>
              <span className="mobile-nav-label">معرض الأعمال</span>
            </Link>
            <Link to="/contact" className={`mobile-nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
              <span className="mobile-nav-index">04</span>
              <span className="mobile-nav-label">تواصل معنا</span>
            </Link>
            <Link to="/privacy" className={`mobile-nav-link ${location.pathname === '/privacy' ? 'active' : ''}`}>
              <span className="mobile-nav-index">05</span>
              <span className="mobile-nav-label">سياسة الخصوصية</span>
            </Link>
          </nav>

          <div className="mobile-nav-footer">
            <div className="mobile-nav-socials">
              <a href="https://www.instagram.com/wajdagency" target="_blank" rel="noopener noreferrer" onMouseEnter={handleHover}>Instagram</a>
              <a href="https://www.linkedin.com/company/wajdagency" target="_blank" rel="noopener noreferrer" onMouseEnter={handleHover}>LinkedIn</a>
              <a href="https://x.com/wajdagency" target="_blank" rel="noopener noreferrer" onMouseEnter={handleHover}>X</a>
            </div>
            <a href="mailto:wajd.marketing@gmail.com" className="mobile-nav-email" onMouseEnter={handleHover}>
              wajd.marketing@gmail.com
            </a>
          </div>
        </div>
      )}

      {/* Pages Switcher */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<DashboardOverview />} />
          <Route path="leads" element={<LeadsManager />} />
          <Route path="hero" element={<HeroManager />} />
          <Route path="stats" element={<StatsManager />} />
          <Route path="testimonials" element={<TestimonialsManager />} />
          <Route path="portfolio" element={<PortfolioManager />} />
          <Route path="faqs" element={<FaqManager />} />
          <Route path="seo" element={<SeoManager />} />
          <Route path="settings" element={<SettingsManager />} />
          <Route path="media" element={<MediaLibrary />} />
        </Route>

        {/* Admin Typo Redirects */}
        <Route path="/admin/loqin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/log-in" element={<Navigate to="/admin/login" replace />} />

        {/* Fallback for unmatched admin routes */}
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

        {/* Fallback for all other unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Footer */}
      {!isAdminRoute && (
        <footer className="premium-footer">
          <div className="footer-logo-text">وجد</div>
          
          <div className="footer-socials">
            <a href="https://www.linkedin.com/company/wajdagency" target="_blank" rel="noopener noreferrer" className="social-link" onMouseEnter={handleHover}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              <span>LinkedIn</span>
            </a>
            <a href="https://www.instagram.com/wajdagency" target="_blank" rel="noopener noreferrer" className="social-link" onMouseEnter={handleHover}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              <span>Instagram</span>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61562980695038" target="_blank" rel="noopener noreferrer" className="social-link" onMouseEnter={handleHover}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              <span>Facebook</span>
            </a>
            <a href="https://www.tiktok.com/@wajdagency" target="_blank" rel="noopener noreferrer" className="social-link" onMouseEnter={handleHover}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              <span>TikTok</span>
            </a>
            <a href="https://x.com/wajdagency" target="_blank" rel="noopener noreferrer" className="social-link" onMouseEnter={handleHover}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z M4 20l6.768 -6.768 M20 4l-6.768 6.768"></path></svg>
              <span>X (Twitter)</span>
            </a>
            <a href="mailto:wajd.marketing@gmail.com" className="social-link" onMouseEnter={handleHover}>
              <Mail size={16} />
              <span>البريد الإلكتروني</span>
            </a>
          </div>

          {/* Footer Navigation Links */}
          <div className="footer-nav-bottom" onClick={handleInteraction}>
            <Link to="/" className="footer-nav-link">الرئيسية</Link>
            <Link to="/about" className="footer-nav-link">من نحن</Link>
            <Link to="/portfolio" className="footer-nav-link">معرض الأعمال</Link>
            <Link to="/contact" className="footer-nav-link">تواصل معنا</Link>
            <Link to="/privacy" className="footer-nav-link">سياسة الخصوصية (Privacy)</Link>
          </div>

          <div className="footer-rights">
            <p>© {new Date().getFullYear()} وكالة وجد للتسويق (Wajd Marketing Agency). جميع الحقوق محفوظة.</p>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
