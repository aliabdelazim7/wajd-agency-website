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
  FileImage
} from 'lucide-react';
import { api } from '../services/api';
import { audioManager } from '../utils/audioManager';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
          <div className="admin-user-profile">
            <span className="user-dot"></span>
            <span className="user-name">مدير المنصة</span>
          </div>
        </header>

        <div className="admin-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
