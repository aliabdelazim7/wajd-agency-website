import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await api.auth.getSession();
        if (session) {
          try {
            // Verify role is admin
            const profile = await api.auth.getProfile(session.user.id);
            setIsAuthenticated(profile && profile.role === 'admin');
          } catch (err) {
            console.error('Security Warning: Failed to retrieve user role profile:', err);
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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
        <div className="spinner">جاري التحقق من الصلاحيات الإدارية...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
