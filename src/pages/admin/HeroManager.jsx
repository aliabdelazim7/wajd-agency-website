import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Upload, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { audioManager } from '../../utils/audioManager';

const HeroManager = () => {
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const data = await api.hero.get();
        if (data) {
          setHeadline(data.headline);
          setSubheadline(data.subheadline);
          setCtaText(data.cta_text || '');
          setCtaLink(data.cta_link || '');
          setBgImage(data.background_image || '');
        }
      } catch (err) {
        console.error('Error fetching hero content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    handleClick();
    setUploading(true);
    setFeedback({ type: '', msg: '' });

    try {
      const publicUrl = await api.storage.uploadImage('hero-images', file, 'hero');
      setBgImage(publicUrl);
      setFeedback({ type: 'success', msg: 'تم رفع الصورة بنجاح!' });
    } catch (err) {
      console.error('Image upload failed:', err);
      setFeedback({ type: 'error', msg: err.message || 'فشل رفع الصورة. يرجى التأكد من الحجم والصيغة.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleClick();
    setSaving(true);
    setFeedback({ type: '', msg: '' });

    try {
      await api.hero.update({
        headline,
        subheadline,
        cta_text: ctaText,
        cta_link: ctaLink,
        background_image: bgImage
      });
      setFeedback({ type: 'success', msg: 'تم حفظ تعديلات الهيرو بنجاح!' });
    } catch (err) {
      console.error('Saving hero content failed:', err);
      setFeedback({ type: 'error', msg: 'حدث خطأ أثناء الحفظ. يرجى المحاولة لاحقاً.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--gold)' }}>
        <span>جاري تحميل إعدادات الهيرو...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
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

      <div className="contact-container" style={{ borderRadius: '24px', padding: '35px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="form-field">
            <label htmlFor="hero-headline" className="field-label">العنوان الرئيسي (Headline):</label>
            <input
              id="hero-headline"
              type="text"
              required
              className="standard-input"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              onFocus={handleHover}
              placeholder="مثال: نُوجِد الأثر الرقمي الذي يتحول إلى مبيعات"
            />
          </div>

          <div className="form-field">
            <label htmlFor="hero-subheadline" className="field-label">العنوان الفرعي والوصف (Subheadline):</label>
            <textarea
              id="hero-subheadline"
              required
              className="standard-input"
              rows={4}
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              onFocus={handleHover}
              placeholder="أدخل النص الوصفي لقسم الهيرو هنا..."
              style={{ lineHeight: '1.7' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-field">
              <label htmlFor="hero-cta-text" className="field-label">نص زر الدعوة للإجراء (CTA Text):</label>
              <input
                id="hero-cta-text"
                type="text"
                className="standard-input"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                onFocus={handleHover}
                placeholder="مثال: تفاعل الأثر التسويقي 🎛️"
              />
            </div>

            <div className="form-field">
              <label htmlFor="hero-cta-link" className="field-label">رابط الزر (CTA Link):</label>
              <input
                id="hero-cta-link"
                type="text"
                className="standard-input"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                onFocus={handleHover}
                placeholder="مثال: #simulator-anchor أو /contact"
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="form-field">
            <label className="field-label">صورة الخلفية / المجسم الفني (Background Image URL):</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                className="standard-input"
                value={bgImage}
                onChange={(e) => setBgImage(e.target.value)}
                onFocus={handleHover}
                placeholder="رابط الصورة المباشر"
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
              <label className="action-btn" style={{ cursor: 'pointer', padding: '12px 20px', gap: '8px' }}>
                <Upload size={16} />
                <span>رفع صورة</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {bgImage && (
              <div style={{ marginTop: '15px' }}>
                <span className="field-label" style={{ display: 'block', marginBottom: '8px' }}>معاينة الصورة الحالية:</span>
                <div style={{ 
                  width: '100%', 
                  maxHeight: '200px', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img src={bgImage} alt="Hero preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className={`action-btn filled ${saving ? 'loading' : ''}`}
            onMouseEnter={handleHover}
            style={{ padding: '14px', marginTop: '10px', justifyContent: 'center', gap: '10px' }}
          >
            <Save size={18} />
            <span>{saving ? 'جاري حفظ التعديلات...' : 'حفظ تغييرات الهيرو'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeroManager;
