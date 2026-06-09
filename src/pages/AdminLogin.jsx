import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { audioManager } from '../utils/audioManager';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isDbConnected = !!supabase;

  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (location.state?.error) {
      setErrorMsg(location.state.error);
    }
  }, [location.state]);

  useEffect(() => {
    // Check if session already exists
    const checkSession = async () => {
      try {
        const session = await api.auth.getSession();
        if (session) {
          try {
            const profile = await api.auth.getProfile(session.user.id);
            if (profile && profile.role === 'admin') {
              navigate(from, { replace: true });
            } else {
              await api.auth.logout();
              setErrorMsg('عذراً، هذا الحساب لا يملك صلاحيات المشرف للوصول إلى لوحة التحكم.');
            }
          } catch (err) {
            console.error('Check session profile error:', err);
            await api.auth.logout();
            setErrorMsg('فشل التحقق من صلاحيات المشرف. يرجى تسجيل الدخول مجدداً.');
          }
        }
      } catch (err) {
        // Safe to ignore
      }
    };
    checkSession();
  }, [navigate, from]);

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    handleClick();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.auth.login(email, password);
      await api.auditLogs.log('تسجيل دخول مشرف', `تم تسجيل الدخول بنجاح للمشرف: ${email}`).catch(() => {});
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'var(--bg-dark)',
      fontFamily: 'var(--font-ar)',
      direction: 'rtl',
      padding: '20px'
    }}>
      <div className="contact-container" style={{ maxWidth: '450px', padding: '45px 35px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', color: 'var(--gold)', fontWeight: 700, margin: '0 0 10px' }}>
            بوابة الإشراف
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            سجل الدخول لإدارة محتوى وكالة وجد للتسويق
          </p>
        </div>

        {!isDbConnected && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            color: '#f59e0b',
            fontSize: '13px',
            lineHeight: '1.6',
            marginBottom: '20px',
            textAlign: 'right'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>قاعدة البيانات غير متصلة ⚠️</span>
            </div>
            <p style={{ margin: 0 }}>
              يرجى إنشاء ملف اسمه <code>.env</code> في المجلد الرئيسي للمشروع وإضافة متغيرات اتصال Supabase:
            </p>
            <pre style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '8px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#fff',
              margin: '4px 0 0',
              direction: 'ltr',
              textAlign: 'left',
              overflowX: 'auto'
            }}>
              VITE_SUPABASE_URL=your_project_url{"\n"}
              VITE_SUPABASE_ANON_KEY=your_anon_key
            </pre>
          </div>
        )}

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#ef4444',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-field">
            <label htmlFor="login-email" className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="#c5a862" />
              <span>البريد الإلكتروني:</span>
            </label>
            <input
              id="login-email"
              type="email"
              required
              className="standard-input"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={handleHover}
              style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password" className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="#c5a862" />
              <span>كلمة المرور:</span>
            </label>
            <input
              id="login-password"
              type="password"
              required
              className="standard-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handleHover}
              style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`action-btn filled ${isSubmitting ? 'loading' : ''}`}
            onMouseEnter={handleHover}
            style={{ width: '100%', padding: '14px', marginTop: '10px', justifyContent: 'center', gap: '10px' }}
          >
            <LogIn size={18} />
            <span>{isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
