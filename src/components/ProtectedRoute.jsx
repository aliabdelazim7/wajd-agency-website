import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Fetch session
        const session = await api.auth.getSession().catch((err) => {
          console.error('[SECURITY WARNING] Supabase session retrieval error:', err);
          throw new Error('فشل التحقق من الجلسة (Supabase Session Error)');
        });

        if (!session) {
          console.warn('[SECURITY INFO] No active session found. Access denied.');
          if (isMounted) {
            setIsAuthenticated(false);
            setAuthError('لا توجد جلسة نشطة. يرجى تسجيل الدخول.');
          }
          return;
        }

        // Verify session user and expiry
        const user = session.user;
        if (!user || !user.id) {
          console.error('[SECURITY WARNING] Invalid user object in session. Access denied.');
          if (isMounted) {
            setIsAuthenticated(false);
            setAuthError('حساب مستخدم غير صالح في الجلسة.');
          }
          return;
        }

        // Fetch user profile securely
        const profile = await api.auth.getProfile(user.id).catch((err) => {
          console.error(`[SECURITY WARNING] Profile fetch error for user ${user.id}:`, err);
          throw new Error('فشل جلب الصلاحيات الإدارية للمستخدم (Profile Fetch Failure)');
        });

        if (!profile) {
          console.error(`[SECURITY WARNING] User ${user.id} has no profile entry. Access denied.`);
          if (isMounted) {
            setIsAuthenticated(false);
            setAuthError('ملف التعريف غير موجود. الدخول مرفوض.');
          }
          return;
        }

        if (profile.role !== 'admin') {
          console.error(`[SECURITY WARNING] User ${user.email} (ID: ${user.id}) has role "${profile.role}". Required role: "admin". Access denied.`);
          if (isMounted) {
            setIsAuthenticated(false);
            setAuthError('عذراً، لا تمتلك الصلاحيات الإدارية اللازمة لدخول هذه الصفحة.');
          }
          return;
        }

        // Securely authenticated as admin
        if (isMounted) {
          setIsAuthenticated(true);
          setAuthError('');
        }
      } catch (err) {
        console.error('[SECURITY ALERT] Unauthorized access attempt or system failure:', err.message || err);
        if (isMounted) {
          setIsAuthenticated(false);
          setAuthError(err.message || 'حدث خطأ أمني أثناء التحقق من الصلاحيات.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        width: '100vw',
        justifyContent: 'center', 
        alignItems: 'center', 
        background: 'var(--bg-dark)',
        color: 'var(--gold)',
        fontFamily: 'var(--font-ar)',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(197, 168, 98, 0.1)',
            borderTop: '3px solid var(--gold)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div>جاري التحقق من الصلاحيات الإدارية...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Log failure attempt to database if audit log is available (best effort)
    try {
      api.auditLogs.log('محاولة دخول غير مصرح بها', `تم حجب محاولة دخول إلى ${location.pathname} بسبب: ${authError || 'جلسة غير صالحة'}`).catch(() => {});
    } catch (e) {
      console.warn("Audit logging failed:", e);
    }

    return <Navigate to="/admin/login" state={{ from: location, error: authError }} replace />;
  }

  return children;
};

export default ProtectedRoute;

