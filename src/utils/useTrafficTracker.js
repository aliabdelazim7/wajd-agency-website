import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

const SESSION_KEY = 'wajd_session_id';

const generateUUID = () => {
  if (typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useTrafficTracker = () => {
  const location = useLocation();
  const recordIdRef = useRef(null);
  const sessionStartRef = useRef(null);
  const accumulatedTimeRef = useRef(0);
  const intervalIdRef = useRef(null);

  useEffect(() => {
    // 1. Skip tracking for admin panel pages
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Get or create session ID
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    // Rate-limit page view logging: ensure at least 5 seconds between logs
    const LAST_LOG_KEY = 'wajd_last_pageview_ts';
    const now = Date.now();
    const lastLog = parseInt(sessionStorage.getItem(LAST_LOG_KEY) || '0', 10);
    if (now - lastLog < 5000) {
      // Skip logging to avoid duplicate entries
      console.debug('Page view logging rate-limited');
      return;
    }
    sessionStorage.setItem(LAST_LOG_KEY, now.toString());

    const pagePath = location.pathname;
    const referrer = document.referrer || '';
    const userAgent = navigator.userAgent || '';

    // Initialize timers
    sessionStartRef.current = Date.now();
    accumulatedTimeRef.current = 0;
    recordIdRef.current = null;

    // Log the initial page view
    api.analytics.logPageView(sessionId, pagePath, referrer, userAgent)
      .then((data) => {
        if (data && data.id) {
          recordIdRef.current = data.id;
          // Send initial duration update if they stay
          updateDurationInDb();
        }
      })
      .catch((err) => {
        console.warn('Failed to log page view:', err);
      });

    // Helper to calculate total active seconds
    const getActiveDuration = () => {
      if (!sessionStartRef.current) return accumulatedTimeRef.current;
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      return accumulatedTimeRef.current + elapsed;
    };

    // Helper to send duration to backend
    const updateDurationInDb = () => {
      if (!recordIdRef.current) return;
      const duration = getActiveDuration();
      // Clamp duration to reasonable bounds (0 - 86400 seconds = 24h)
      const clamped = Math.max(0, Math.min(86400, duration));
      if (duration !== clamped) {
        console.warn(`Duration clamped from ${duration}s to ${clamped}s`);
      }
      api.analytics.updateDuration(recordIdRef.current, clamped)
        .catch((err) => {
          // Silent catch in background
        });
    };

    // Heartbeat every 10 seconds to update duration
    intervalIdRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateDurationInDb();
      }
    }, 10000);

    // Handle visibility changes (tab active/inactive)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Tab hidden: calculate time spent and add to accumulated, then update DB
        if (sessionStartRef.current) {
          const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
          accumulatedTimeRef.current += elapsed;
          sessionStartRef.current = null;
        }
        updateDurationInDb();
      } else {
        // Tab visible again: reset session start to now
        sessionStartRef.current = Date.now();
      }
    };

    // Handle page unload / close
    const handleUnload = () => {
      updateDurationInDb();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      // Clean up interval and listeners on path change
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      
      // Save final duration before cleaning up
      updateDurationInDb();

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [location.pathname]);
};
