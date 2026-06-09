/**
 * Unified Analytics Tracking Utility for Wajd Marketing Agency
 * Integrates GA4 (gtag), Meta Pixel (fbq), TikTok Pixel (ttq), and database analytics.
 */

import { api } from '../services/api';

export const trackEvent = (eventName, params = {}) => {
  const utmParams = {
    utm_source: sessionStorage.getItem('wajd_utm_source') || 'Direct',
    utm_medium: sessionStorage.getItem('wajd_utm_medium') || 'None',
    utm_campaign: sessionStorage.getItem('wajd_utm_campaign') || 'None'
  };

  const eventData = { ...params, ...utmParams, path: window.location.pathname };

  console.log(`[Analytics Event] "${eventName}":`, eventData);

  // 1. Google Analytics 4 (GA4)
  if (window.gtag) {
    try {
      window.gtag('event', eventName, eventData);
    } catch (err) {
      console.warn('GA4 tracking error:', err);
    }
  }

  // 2. Meta Pixel (Facebook)
  if (window.fbq) {
    try {
      if (eventName === 'FormSubmission' || eventName === 'LeadMagnet') {
        window.fbq('track', 'Lead', eventData);
      } else if (eventName === 'WhatsAppClick') {
        window.fbq('trackCustom', 'WhatsAppClick', eventData);
      } else {
        window.fbq('trackCustom', eventName, eventData);
      }
    } catch (err) {
      console.warn('Meta Pixel tracking error:', err);
    }
  }

  // 3. TikTok Pixel
  if (window.ttq) {
    try {
      if (eventName === 'FormSubmission' || eventName === 'LeadMagnet') {
        window.ttq.track('Contact', eventData);
      } else {
        window.ttq.track(eventName, eventData);
      }
    } catch (err) {
      console.warn('TikTok Pixel tracking error:', err);
    }
  }

  // 4. Local DB Database Logger (best-effort)
  try {
    const sessionId = localStorage.getItem('wajd_session_id') || '00000000-0000-0000-0000-000000000000';
    api.analytics.logPageView(
      sessionId,
      `${window.location.pathname}#event_${eventName.toLowerCase()}`,
      document.referrer || 'Direct',
      navigator.userAgent
    ).catch(() => {});
  } catch (err) {
    // Fail silently in database logging
  }
};

// --- SCROLL DEPTH TRACKING ---
let scrollDepthsTracked = { 25: false, 50: false, 75: false, 90: false };

export const initScrollDepthTracking = () => {
  // Reset scroll depth tracking flags
  scrollDepthsTracked = { 25: false, 50: false, 75: false, 90: false };

  const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (docHeight <= 0) return;
    
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    [25, 50, 75, 90].forEach((depth) => {
      if (scrollPercent >= depth && !scrollDepthsTracked[depth]) {
        scrollDepthsTracked[depth] = true;
        trackEvent('ScrollDepth', { depth: `${depth}%` });
      }
    });
  };

  // Add event listener with passive: true for mobile performance
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};
