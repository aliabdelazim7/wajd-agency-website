import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, Upload, Link2 } from 'lucide-react';
import { api } from '../../services/api';
import { audioManager } from '../../utils/audioManager';
import { DEFAULT_DB_PROJECTS, PORTFOLIO_DATA } from '../../data/portfolioData';

const PortfolioManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('ميتا');
  const [challenge, setChallenge] = useState('');
  const [strategy, setStrategy] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [metrics, setMetrics] = useState([{ label: '', value: '' }]);

  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const categories = ['ميتا', 'سناب', 'سلة', 'زد', 'جوجل', 'تيك توك', 'شوبيفاي', 'لينكد إن', 'أخرى'];

  const resolveImageUrl = (url, slug) => {
    if (url && url.startsWith('/src/assets/')) {
      const localMatch = PORTFOLIO_DATA.find(item => slug && slug.includes(item.id));
      if (localMatch) {
        return localMatch.image;
      }
    }
    return url;
  };

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  const fetchProjects = async () => {
    try {
      const data = await api.portfolio.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const importDefaultProjects = async () => {
    handleClick();
    setLoading(true);
    setFeedback({ type: '', msg: '' });
    try {
      for (const p of DEFAULT_DB_PROJECTS) {
        await api.portfolio.upsert(p);
      }

      setFeedback({ type: 'success', msg: 'تم استيراد كافة المشاريع الـ 8 الافتراضية بنجاح بنسبة 100%!' });
      fetchProjects();
    } catch (err) {
      console.error('Error importing default projects:', err);
      setFeedback({ type: 'error', msg: 'حدث خطأ أثناء استيراد المشاريع.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setCategory('ميتا');
    setChallenge('');
    setStrategy('');
    setImageUrl('');
    setThumbnailUrl('');
    setAltText('');
    setMetrics([{ label: '', value: '' }]);
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleEditClick = (project) => {
    handleClick();
    setIsEditing(true);
    setCurrentId(project.id);
    setName(project.name);
    setSlug(project.slug);
    setCategory(project.category);
    setChallenge(project.challenge);
    setStrategy(project.strategy);
    setImageUrl(project.image_url || '');
    setThumbnailUrl(project.thumbnail_url || '');
    setAltText(project.alt_text || '');

    // Deserialise results_json to metrics array
    if (project.results_json && typeof project.results_json === 'object') {
      const formattedMetrics = Object.entries(project.results_json).map(([label, value]) => ({
        label,
        value: String(value)
      }));
      setMetrics(formattedMetrics.length > 0 ? formattedMetrics : [{ label: '', value: '' }]);
    } else {
      setMetrics([{ label: '', value: '' }]);
    }
  };

  const handleImageUpload = async (e, type = 'image') => {
    const file = e.target.files[0];
    if (!file) return;

    handleClick();
    setUploading(true);
    setFeedback({ type: '', msg: '' });

    try {
      const publicUrl = await api.storage.uploadImage('portfolio-images', file, 'projects');
      if (type === 'image') {
        setImageUrl(publicUrl);
        if (!thumbnailUrl) setThumbnailUrl(publicUrl); // Default thumbnail to main image if empty
      } else {
        setThumbnailUrl(publicUrl);
      }
      setFeedback({ type: 'success', msg: 'تم رفع الصورة بنجاح!' });
    } catch (err) {
      console.error('Image upload failed:', err);
      setFeedback({ type: 'error', msg: err.message || 'فشل رفع الصورة.' });
    } finally {
      setUploading(false);
    }
  };

  // Helper to update metrics key-value inputs
  const handleMetricChange = (index, field, value) => {
    const newMetrics = [...metrics];
    newMetrics[index][field] = value;
    setMetrics(newMetrics);
  };

  const addMetricField = () => {
    handleClick();
    setMetrics([...metrics, { label: '', value: '' }]);
  };

  const removeMetricField = (index) => {
    handleClick();
    const newMetrics = metrics.filter((_, i) => i !== index);
    setMetrics(newMetrics.length > 0 ? newMetrics : [{ label: '', value: '' }]);
  };

  const generateSlugFromName = () => {
    handleClick();
    if (!name) return;
    // Basic Arabic & English friendly slug generator
    const cleanName = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0621-\u064A-]+/g, ''); // Keep English chars, Arabic chars, and dashes
    setSlug(cleanName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleClick();
    setFeedback({ type: '', msg: '' });

    if (!slug) {
      setFeedback({ type: 'error', msg: 'يرجى إدخال الرابط الفريد (Slug)' });
      return;
    }

    try {
      // Serialize metrics array to JSON object
      const results_json = {};
      metrics.forEach((item) => {
        if (item.label.trim()) {
          results_json[item.label.trim()] = item.value.trim();
        }
      });

      const projectData = {
        name,
        slug,
        category,
        challenge,
        strategy,
        results_json,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl || imageUrl,
        alt_text: altText || name
      };

      if (currentId) {
        projectData.id = currentId;
      }

      await api.portfolio.upsert(projectData);
      setFeedback({ type: 'success', msg: currentId ? 'تم تحديث المشروع بنجاح!' : 'تم إضافة المشروع بنجاح!' });
      resetForm();
      fetchProjects();
    } catch (err) {
      console.error('Error saving portfolio item:', err);
      setFeedback({ type: 'error', msg: 'حدث خطأ أثناء الحفظ. يرجى التأكد من عدم تكرار الرابط الفريد (Slug).' });
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع؟')) return;
    handleClick();
    setFeedback({ type: '', msg: '' });

    try {
      await api.portfolio.delete(id);
      setFeedback({ type: 'success', msg: 'تم حذف المشروع بنجاح!' });
      fetchProjects();
    } catch (err) {
      console.error('Error deleting portfolio item:', err);
      setFeedback({ type: 'error', msg: 'فشل حذف المشروع. يرجى المحاولة لاحقاً.' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--gold)' }}>
        <span>جاري تحميل معرض الأعمال...</span>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Projects List */}
        <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--text-light)', margin: '0 0 24px', fontWeight: 700 }}>
            المشاريع الحالية في معرض الأعمال
          </h3>

          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>لا توجد مشاريع مضافة حالياً في قاعدة البيانات.</span>
              <button
                type="button"
                className="action-btn filled"
                onClick={importDefaultProjects}
                onMouseEnter={handleHover}
                style={{ fontSize: '13px', padding: '10px 20px', border: '1px solid var(--border-glass)' }}
              >
                استيراد المشاريع الـ 8 الافتراضية
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {projects.map((proj) => (
                <div 
                  key={proj.id} 
                  className="faq-item" 
                  style={{ 
                    padding: '20px', 
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'right' }}>
                    {proj.thumbnail_url ? (
                      <div style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                        <img src={resolveImageUrl(proj.thumbnail_url || proj.image_url, proj.slug)} alt={proj.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: '80px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Link2 size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-light)' }}>{proj.name}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="admin-badge" style={{ padding: '2px 8px', fontSize: '10px' }}>{proj.category}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-en)' }}>/{proj.slug}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleEditClick(proj)} 
                      className="action-btn outline"
                      onMouseEnter={handleHover}
                      style={{ padding: '8px' }}
                      aria-label="تعديل"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(proj.id)} 
                      className="action-btn outline"
                      onMouseEnter={handleHover}
                      style={{ padding: '8px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                      aria-label="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create / Edit Form */}
        <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--text-light)', margin: 0, fontWeight: 700 }}>
              {isEditing ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد للمعرض'}
            </h3>
            {isEditing && (
              <button 
                onClick={() => { handleClick(); resetForm(); }}
                className="action-btn outline"
                onMouseEnter={handleHover}
                style={{ padding: '8px' }}
                aria-label="إلغاء التعديل"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div className="form-field">
                <label htmlFor="proj-name" className="field-label">اسم البراند / المشروع (Name):</label>
                <input
                  id="proj-name"
                  type="text"
                  required
                  className="standard-input"
                  placeholder="مثال: عطور العويد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={handleHover}
                />
              </div>

              <div className="form-field">
                <label htmlFor="proj-category" className="field-label">التصنيف الأساسي (Category):</label>
                <select
                  id="proj-category"
                  className="standard-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onFocus={handleHover}
                  style={{ background: 'var(--bg-dark)', color: 'var(--text-light)' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="proj-slug" className="field-label">رابط المشروع الفريد (Slug):</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  id="proj-slug"
                  type="text"
                  required
                  className="standard-input"
                  placeholder="مثال: al-owaid-perfume"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  onFocus={handleHover}
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
                <button
                  type="button"
                  className="action-btn outline"
                  onClick={generateSlugFromName}
                  onMouseEnter={handleHover}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  توليد الرابط تلقائياً
                </button>
              </div>
              <small style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                سيستخدم هذا الاسم في مسار الصفحة مثل: wajd.agency/portfolio/al-owaid-perfume
              </small>
            </div>

            <div className="form-field">
              <label htmlFor="proj-challenge" className="field-label">التحدي قبل التدخل (Challenge):</label>
              <textarea
                id="proj-challenge"
                required
                className="standard-input"
                rows={3}
                placeholder="صف المشاكل والعقبات التي كان يعاني منها العميل في البداية..."
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                onFocus={handleHover}
                style={{ lineHeight: '1.7' }}
              />
            </div>

            <div className="form-field">
              <label htmlFor="proj-strategy" className="field-label">استراتيجية وجد للحل والنمو (Strategy):</label>
              <textarea
                id="proj-strategy"
                required
                className="standard-input"
                rows={3}
                placeholder="اشرح الخطة والمنهجية وهندسة العروض التي طبقها فريق وجد للنمو..."
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                onFocus={handleHover}
                style={{ lineHeight: '1.7' }}
              />
            </div>

            {/* Interactive Metrics (results_json editor) */}
            <div className="form-field">
              <label className="field-label">الأرقام والنتائج المحققة (Metrics):</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {metrics.map((metric, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="standard-input"
                      placeholder="اسم المؤشر (مثل: ROAS)"
                      value={metric.label}
                      onChange={(e) => handleMetricChange(index, 'label', e.target.value)}
                      onFocus={handleHover}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      className="standard-input"
                      placeholder="القيمة (مثل: 6.4x)"
                      value={metric.value}
                      onChange={(e) => handleMetricChange(index, 'value', e.target.value)}
                      onFocus={handleHover}
                      style={{ flex: 1, fontFamily: 'var(--font-en)', direction: 'ltr', textAlign: 'left' }}
                    />
                    {metrics.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMetricField(index)}
                        className="action-btn outline"
                        onMouseEnter={handleHover}
                        style={{ padding: '12px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                        aria-label="حذف المؤشر"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMetricField}
                  className="action-btn outline"
                  onMouseEnter={handleHover}
                  style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '12px', gap: '6px' }}
                >
                  <Plus size={14} />
                  <span>إضافة مؤشر نجاح</span>
                </button>
              </div>
            </div>

            {/* Project Image */}
            <div className="form-field">
              <label className="field-label">صورة النتائج أو المشروع الأساسية (Project Image):</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  className="standard-input"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onFocus={handleHover}
                  placeholder="رابط صورة المشروع المباشر"
                  style={{ direction: 'ltr', textAlign: 'left', flex: 1 }}
                />
                <label className="action-btn" style={{ cursor: 'pointer', padding: '12px 20px', gap: '8px' }}>
                  <Upload size={16} />
                  <span>رفع صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              {imageUrl && (
                <div style={{ marginTop: '10px', width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                  <img src={resolveImageUrl(imageUrl, slug)} alt="Project Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0a0a0a' }} />
                </div>
              )}
            </div>

            {/* Alt text & Thumbnail */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-field">
                <label htmlFor="proj-thumbnail" className="field-label">رابط المصغرة (اختياري):</label>
                <input
                  id="proj-thumbnail"
                  type="text"
                  className="standard-input"
                  placeholder="اتركه فارغاً ليطابق الصورة الأساسية"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  onFocus={handleHover}
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="proj-alt" className="field-label">نص بديل للصورة (SEO Alt Text):</label>
                <input
                  id="proj-alt"
                  type="text"
                  className="standard-input"
                  placeholder="مثال: لقطة شاشة لنتائج إعلانات العويد"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  onFocus={handleHover}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="action-btn filled"
              onMouseEnter={handleHover}
              style={{ padding: '12px', marginTop: '10px', justifyContent: 'center', gap: '8px' }}
            >
              <Save size={16} />
              <span>{isEditing ? 'حفظ تعديلات المشروع' : 'إضافة المشروع للمعرض'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PortfolioManager;
