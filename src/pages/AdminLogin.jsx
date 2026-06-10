import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { audioManager } from '../utils/audioManager';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isDbConnected = !!supabase;

  const from = location.state?.from?.pathname || '/admin';

  // Parse query parameters for invitations
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === 'true') {
      setIsSignUp(true);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, [location.search]);

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
    setSuccessMsg('');

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

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    handleClick();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Sign up using supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });

      if (error) throw error;

      await api.auditLogs.log('تسجيل حساب جديد', `قام الحساب ${email} بالتسجيل كمشرف مرخص.`).catch(() => {});

      if (data?.session) {
        // Logged in immediately (email confirmation disabled in Supabase)
        const profile = await api.auth.getProfile(data.user.id);
        if (profile && profile.role === 'admin') {
          setSuccessMsg('تم إنشاء وتفعيل حسابك بنجاح! جاري التوجيه إلى لوحة التحكم...');
          setTimeout(() => {
            navigate('/admin', { replace: true });
          }, 2000);
        } else {
          setErrorMsg('تم إنشاء الحساب، ولكن هذا البريد الإلكتروني غير مرخص كمسؤول في قاعدة البيانات.');
          await api.auth.logout();
        }
      } else {
        // Confirmation email sent
        setSuccessMsg('تم إرسال رابط تأكيد الحساب إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد وتأكيد الحساب لتفعيل صلاحياتك.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة لاحقاً.');
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
            {isSignUp ? 'تفعيل حساب الإشراف' : 'بوابة الإشراف'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            {isSignUp ? 'قم بتعيين كلمة مرور لحسابك المرخص للبدء' : 'سجل الدخول لإدارة محتوى وكالة وجد للتسويق'}
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
            marginBottom: '20px',
            textAlign: 'right'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#22c55e',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'right'
          }}>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={isSignUp ? handleSignUpSubmit : handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              disabled={isSignUp && !!new URLSearchParams(location.search).get('email')}
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

          {isSignUp && (
            <div className="form-field">
              <label htmlFor="login-confirm-password" className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} color="#c5a862" />
                <span>تأكيد كلمة المرور:</span>
              </label>
              <input
                id="login-confirm-password"
                type="password"
                required
                className="standard-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={handleHover}
                style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`action-btn filled ${isSubmitting ? 'loading' : ''}`}
            onMouseEnter={handleHover}
            style={{ width: '100%', padding: '14px', marginTop: '10px', justifyContent: 'center', gap: '10px' }}
          >
            {isSignUp ? <UserCheck size={18} /> : <LogIn size={18} />}
            <span>{isSubmitting ? 'جاري التنفيذ...' : (isSignUp ? 'إنشاء وتفعيل الحساب' : 'تسجيل الدخول')}</span>
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => { handleClick(); setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
            onMouseEnter={handleHover}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--gold)',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'هل لديك حساب بالفعل؟ سجل الدخول من هنا' : 'هل تم ترخيص بريدك الإلكتروني؟ أنشئ حسابك من هنا'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
