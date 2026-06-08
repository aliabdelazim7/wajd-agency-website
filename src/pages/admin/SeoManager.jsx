import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Globe, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';
import { audioManager } from '../../utils/audioManager';

const SeoManager = () => {
  const pages = [
    { value: 'Home', label: 'الصفحة الرئيسية' },
    { value: 'About', label: 'من نحن (نبذة عن الوكالة)' },
    { value: 'Portfolio', label: 'معرض الأعمال والقصص' },
    { value: 'Contact', label: 'صفحة اتصل بنا / الحجز' }
  ];

  const [activeTab, setActiveTab] = useState('Home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [currentId, setCurrentId] = useState(null);

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  const loadSeoData = async (pageName) => {
    setLoading(true);
    setFeedback({ type: '', msg: '' });
    try {
      const data = await api.seo.getForPage(pageName);
      if (data) {
        setCurrentId(data.id);
        setTitle(data.title || '');
        setDescription(data.description || '');
        setKeywords(data.keywords || '');
        setOgTitle(data.og_title || '');
        setOgDescription(data.og_description || '');
      } else {
        // Reset form for fresh page entries
        setCurrentId(null);
        setTitle('');
        setDescription('');
        setKeywords('');
        setOgTitle('');
        setOgDescription('');
      }
    } catch (err) {
      console.error(`Error loading SEO for ${pageName}:`, err);
      setFeedback({ type: 'error', msg: 'فشل تحميل بيانات السيو للصفحة المحددة.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeoData(activeTab);
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleClick();
    setSaving(true);
    setFeedback({ type: '', msg: '' });

    try {
      const pageData = {
        page: activeTab,
        title,
        description,
        keywords,
        og_title: ogTitle || title, // fallback to title if empty
        og_description: ogDescription || description // fallback to description if empty
      };

      if (currentId) {
        pageData.id = currentId;
      }

      const savedData = await api.seo.upsert(pageData);
      if (savedData && savedData[0]) {
        setCurrentId(savedData[0].id);
      }
      setFeedback({ type: 'success', msg: `تم تحديث بيانات الـ SEO لصفحة [${pages.find(p => p.value === activeTab).label}] بنجاح!` });
    } catch (err) {
      console.error('Error saving SEO data:', err);
      setFeedback({ type: 'error', msg: 'حدث خطأ أثناء حفظ التحديثات. يرجى المحاولة لاحقاً.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Tab Selector buttons */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '15px' }}>
        {pages.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => { handleClick(); setActiveTab(p.value); }}
            className={`action-btn ${activeTab === p.value ? 'filled' : 'outline'}`}
            onMouseEnter={handleHover}
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {feedback.msg && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 600,
          background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: feedback.type === 'success' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          color: feedback.type === 'success' ? '#22c55e' : '#ef4444'
        }}>
          {feedback.msg}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--gold)' }}>
          <span>جاري تحميل الإعدادات الحالية لـ {pages.find(p => p.value === activeTab).label}...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
          
          {/* SEO Metadata Editor Form */}
          <div className="contact-container" style={{ padding: '35px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: '0 0 24px', fontWeight: 700 }}>
              بيانات الميتا الرئيسية (Meta Tags)
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div className="form-field">
                <label htmlFor="seo-title" className="field-label">عنوان الصفحة (Page Title Tag):</label>
                <input
                  id="seo-title"
                  type="text"
                  required
                  className="standard-input"
                  placeholder="عنوان يظهر في شريط المتصفح وجوجل (الحد الأقصى الموصى به: 60 حرفاً)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={handleHover}
                />
              </div>

              <div className="form-field">
                <label htmlFor="seo-desc" className="field-label">وصف الصفحة (Meta Description):</label>
                <textarea
                  id="seo-desc"
                  required
                  className="standard-input"
                  rows={4}
                  placeholder="وصف مختصر يظهر أسفل عنوان الصفحة في نتائج محرك البحث (الحد الموصى به: 150-160 حرفاً)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={handleHover}
                  style={{ lineHeight: '1.7' }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="seo-keywords" className="field-label">الكلمات الدلالية (Keywords):</label>
                <input
                  id="seo-keywords"
                  type="text"
                  className="standard-input"
                  placeholder="افصل بين الكلمات بفاصلة (مثال: تسويق، مبيعات، حملات ممولة، عائد إعلاني)"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onFocus={handleHover}
                />
              </div>

              <h4 style={{ fontSize: '15px', color: 'var(--gold)', margin: '15px 0 5px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                مشاركة وسائل التواصل الاجتماعي (Open Graph / FB / Twitter)
              </h4>

              <div className="form-field">
                <label htmlFor="seo-og-title" className="field-label">عنوان المشاركة الاجتماعي (OG Title):</label>
                <input
                  id="seo-og-title"
                  type="text"
                  className="standard-input"
                  placeholder="العنوان الذي يظهر عند إرسال الرابط في واتساب/تويتر/فيسبوك"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  onFocus={handleHover}
                />
              </div>

              <div className="form-field">
                <label htmlFor="seo-og-desc" className="field-label">وصف المشاركة الاجتماعي (OG Description):</label>
                <textarea
                  id="seo-og-desc"
                  className="standard-input"
                  rows={3}
                  placeholder="الوصف المرافق للرابط عند المشاركة على منصات التواصل"
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  onFocus={handleHover}
                  style={{ lineHeight: '1.7' }}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="action-btn filled"
                onMouseEnter={handleHover}
                style={{ padding: '14px', marginTop: '10px', justifyContent: 'center', gap: '10px' }}
              >
                {saving ? <RefreshCw className="spinner-icon" size={18} /> : <Save size={18} />}
                <span>{saving ? 'جاري الحفظ والرفع...' : 'تحديث إعدادات الـ SEO للصفحة'}</span>
              </button>

            </form>
          </div>

          {/* Visual Google Search Preview Widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Google Preview */}
            <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-light)', margin: '0 0 20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} style={{ color: 'var(--gold)' }} />
                <span>معاينة الظهور في نتائج بحث جوجل</span>
              </h3>
              
              <div style={{
                background: '#ffffff',
                color: '#1a0dab',
                padding: '20px',
                borderRadius: '12px',
                fontFamily: 'arial, sans-serif',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                direction: 'rtl',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '14px', color: '#202124', marginBottom: '2px', fontFamily: 'arial, sans-serif', direction: 'ltr', textAlign: 'right' }}>
                  https://wajd.agency <span style={{ color: '#5f6368', fontSize: '12px' }}>› {activeTab.toLowerCase()}</span>
                </div>
                <div style={{ fontSize: '20px', color: '#1a0dab', hover: { textDecoration: 'underline' }, cursor: 'pointer', marginBottom: '4px', lineHeight: '1.3' }}>
                  {title || 'يرجى كتابة عنوان الصفحة للتحقق من المظهر...'}
                </div>
                <div style={{ fontSize: '14px', color: '#4d5156', lineHeight: '1.57' }}>
                  {description || 'يرجى كتابة وصف الميتا للصفحة لعرضه هنا كما سيظهر للعملاء والباحثين في محرك بحث جوجل...'}
                </div>
              </div>
            </div>

            {/* Social Share Preview (WhatsApp style) */}
            <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-light)', margin: '0 0 20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} style={{ color: 'var(--gold)' }} />
                <span>معاينة الرابط عند الإرسال على واتساب</span>
              </h3>

              <div style={{
                background: '#0b141a',
                padding: '16px',
                borderRadius: '12px',
                maxWidth: '350px',
                border: '1px solid rgba(255,255,255,0.05)',
                direction: 'rtl',
                textAlign: 'right'
              }}>
                <div style={{
                  background: '#1f2c34',
                  borderRadius: '10px',
                  padding: '12px',
                  borderRight: '4px solid #c5a862',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>
                    {ogTitle || title || 'عنوان مشاركة الرابط'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#8696a0', lineHeight: '1.4' }}>
                    {ogDescription || description || 'وصف مشاركة الرابط المختصر...'}
                  </span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-en)' }}>
                    wajd.agency/{activeTab.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default SeoManager;
