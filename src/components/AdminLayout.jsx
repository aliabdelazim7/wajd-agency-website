import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  MessageSquare, 
  Briefcase, 
  HelpCircle, 
  Settings, 
  ShieldAlert, 
  LogOut,
  Sparkles,
  ArrowLeft,
  FileImage,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { audioManager } from '../utils/audioManager';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isClearing, setIsClearing] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  const handleLogout = async () => {
    handleClick();
    try {
      await api.auditLogs.log('تسجيل خروج مشرف', 'تم تسجيل خروج المشرف من لوحة التحكم').catch(() => {});
      await api.auth.logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Fallback
      navigate('/admin/login');
    }
  };

  const handleClearCache = async () => {
    handleClick();
    setIsClearing(true);
    
    // Simulate Cache clear duration for premium B2B UI feedback
    await new Promise(resolve => setTimeout(resolve, 1400));

    try {
      // 1. Clear Cache Storage API (Service Worker assets)
      if (window.caches) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // 2. Clear localStorage selectively (MUST retain Supabase session token)
      const keptKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('sb-') || key.includes('supabase'))) {
          keptKeys.push({ key, value: localStorage.getItem(key) });
        }
      }
      localStorage.clear();
      keptKeys.forEach(item => localStorage.setItem(item.key, item.value));

      // 3. Clear sessionStorage
      sessionStorage.clear();

      // Show toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Log action to database audits
      await api.auditLogs.log('مسح الكاش', 'قام المشرف بتنظيف الذاكرة المؤقتة وملفات التخزين').catch(() => {});
    } catch (error) {
      console.error('Failed to purge browser cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const menuItems = [
    { path: '/admin', label: 'لوحة التحكم العامة', icon: LayoutDashboard },
    { path: '/admin/leads', label: 'إدارة العملاء المحتملين', icon: MessageSquare },
    { path: '/admin/hero', label: 'محتوى الهيرو', icon: Sparkles },
    { path: '/admin/stats', label: 'إدارة الإحصائيات', icon: BarChart3 },
    { path: '/admin/testimonials', label: 'إدارة آراء الشركاء', icon: HelpCircle },
    { path: '/admin/portfolio', label: 'إدارة معرض الأعمال', icon: Briefcase },
    { path: '/admin/media', label: 'مكتبة الوسائط', icon: FileImage },
    { path: '/admin/faqs', label: 'إدارة الأسئلة الشائعة', icon: HelpCircle },
    { path: '/admin/seo', label: 'إدارة الـ SEO والبيانات', icon: ShieldAlert },
    { path: '/admin/settings', label: 'الإعدادات العامة', icon: Settings },
  ];

  return (
    <div className="admin-layout-container" style={{ direction: 'rtl' }}>
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="logo-text">وجد</div>
          <span className="admin-badge">لوحة التحكم</span>
        </div>

        <nav className="admin-sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-menu-item ${isActive ? 'active' : ''}`}
                onMouseEnter={handleHover}
                onClick={handleClick}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button 
            type="button" 
            className="action-btn outline logout-btn" 
            onClick={handleLogout}
            onMouseEnter={handleHover}
          >
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
          
          <Link 
            to="/" 
            className="back-to-site-link"
            onMouseEnter={handleHover}
            onClick={handleClick}
          >
            <ArrowLeft size={14} />
            <span>العودة للموقع الرئيسي</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="admin-main-panel">
        <header className="admin-main-header">
          <h1 className="admin-section-page-title">
            {menuItems.find(item => item.path === location.pathname)?.label || 'لوحة التحكم'}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Clear Cache WordPress style Button */}
            <button
              type="button"
              onClick={handleClearCache}
              onMouseEnter={handleHover}
              disabled={isClearing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(197, 168, 98, 0.05)',
                border: '1.5px solid rgba(197, 168, 98, 0.25)',
                borderRadius: '20px',
                color: '#c5a862',
                fontSize: '12px',
                fontWeight: '700',
                cursor: isClearing ? 'not-allowed' : 'pointer',
                transition: 'var(--transition-smooth)',
                outline: 'none'
              }}
              className="admin-cache-btn"
            >
              <Trash2 size={13} className={isClearing ? 'spinner-icon' : ''} />
              <span>{isClearing ? 'جاري مسح الكاش...' : 'مسح كاش النظام'}</span>
            </button>

            <div className="admin-user-profile">
              <span className="user-dot"></span>
              <span className="user-name">مدير المنصة</span>
            </div>
          </div>
        </header>

        <div className="admin-page-content">
          <Outlet />
        </div>
      </div>

      {/* Cache purge Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          zIndex: 10000,
          background: 'rgba(15, 16, 22, 0.95)',
          border: '1.5px solid var(--gold)',
          boxShadow: '0 10px 30px rgba(197, 168, 98, 0.25)',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'fadeIn 0.3s ease',
          direction: 'rtl'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(37, 211, 102, 0.1)',
            border: '1px solid #25d366',
            color: '#25d366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>✓</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-light)' }}>تم مسح الكاش بنجاح</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>تم تنظيف الذاكرة المؤقتة وملفات التخزين المحفوظة.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
