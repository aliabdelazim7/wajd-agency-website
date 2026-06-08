import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, Upload } from 'lucide-react';
import { api } from '../../services/api';
import { audioManager } from '../../utils/audioManager';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [quote, setQuote] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  const fetchTestimonials = async () => {
    try {
      const data = await api.testimonials.getAll();
      setTestimonials(data);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setQuote('');
    setName('');
    setCompany('');
    setAvatarUrl('');
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleEditClick = (test) => {
    handleClick();
    setIsEditing(true);
    setCurrentId(test.id);
    setQuote(test.quote);
    setName(test.name);
    setCompany(test.company);
    setAvatarUrl(test.avatar_url || '');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    handleClick();
    setUploading(true);
    setFeedback({ type: '', msg: '' });

    try {
      const publicUrl = await api.storage.uploadImage('avatar-images', file, 'avatars');
      setAvatarUrl(publicUrl);
      setFeedback({ type: 'success', msg: 'تم رفع الصورة الشخصية بنجاح!' });
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setFeedback({ type: 'error', msg: err.message || 'فشل رفع الصورة.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleClick();
    setFeedback({ type: '', msg: '' });

    try {
      const testData = {
        quote,
        name,
        company,
        avatar_url: avatarUrl
      };
      if (currentId) {
        testData.id = currentId;
      }

      await api.testimonials.upsert(testData);
      setFeedback({ type: 'success', msg: currentId ? 'تم تحديث رأي الشريك بنجاح!' : 'تم إضافة رأي الشريك بنجاح!' });
      resetForm();
      fetchTestimonials();
    } catch (err) {
      console.error('Error saving testimonial:', err);
      setFeedback({ type: 'error', msg: 'حدث خطأ أثناء الحفظ. يرجى المحاولة لاحقاً.' });
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف رأي الشريك هذا؟')) return;
    handleClick();
    setFeedback({ type: '', msg: '' });

    try {
      await api.testimonials.delete(id);
      setFeedback({ type: 'success', msg: 'تم حذف رأي الشريك بنجاح!' });
      fetchTestimonials();
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      setFeedback({ type: 'error', msg: 'فشل حذف رأي الشريك. يرجى المحاولة لاحقاً.' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--gold)' }}>
        <span>جاري تحميل آراء الشركاء...</span>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Testimonials List */}
        <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--text-light)', margin: '0 0 24px', fontWeight: 700 }}>
            آراء الشركاء وشهادات النجاح الحالية
          </h3>

          {testimonials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              لا توجد شهادات نجاح مضافة حالياً.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {testimonials.map((test) => (
                <div 
                  key={test.id} 
                  className="faq-item" 
                  style={{ 
                    padding: '24px', 
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    position: 'relative'
                  }}
                >
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.7', margin: 0, fontStyle: 'italic', textAlign: 'right' }}>
                    "{test.quote}"
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-glass)',
                        background: 'rgba(255,255,255,0.03)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {test.avatar_url ? (
                          <img src={test.avatar_url} alt={test.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '14px', color: 'var(--gold)', fontWeight: 700 }}>
                            {test.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)' }}>{test.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{test.company}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleEditClick(test)} 
                        className="action-btn outline"
                        onMouseEnter={handleHover}
                        style={{ padding: '8px' }}
                        aria-label="تعديل"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(test.id)} 
                        className="action-btn outline"
                        onMouseEnter={handleHover}
                        style={{ padding: '8px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                        aria-label="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
              {isEditing ? 'تعديل رأي الشريك' : 'إضافة رأي شريك جديد'}
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
            
            <div className="form-field">
              <label htmlFor="test-quote" className="field-label">نص الشهادة / الرأي (Quote):</label>
              <textarea
                id="test-quote"
                required
                className="standard-input"
                rows={4}
                placeholder="اكتب رأي الشريك أو العميل هنا بالتفصيل..."
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                onFocus={handleHover}
                style={{ lineHeight: '1.7' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-field">
                <label htmlFor="test-name" className="field-label">اسم العميل الكريم (Name):</label>
                <input
                  id="test-name"
                  type="text"
                  required
                  className="standard-input"
                  placeholder="مثال: عبدالله المنصور"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={handleHover}
                />
              </div>

              <div className="form-field">
                <label htmlFor="test-company" className="field-label">اسم الشركة / الجهة (Company):</label>
                <input
                  id="test-company"
                  type="text"
                  required
                  className="standard-input"
                  placeholder="مثال: متجر إلكتروني - الرياض"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onFocus={handleHover}
                />
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="form-field">
              <label className="field-label">الصورة الشخصية / الشعار (Avatar URL):</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  className="standard-input"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  onFocus={handleHover}
                  placeholder="رابط الصورة الشخصية المباشر"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
                <label className="action-btn" style={{ cursor: 'pointer', padding: '12px 20px', gap: '8px' }}>
                  <Upload size={16} />
                  <span>رفع صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {avatarUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--gold)',
                    overflow: 'hidden'
                  }}>
                    <img src={avatarUrl} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span className="field-label">معاينة الصورة الحالية</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="action-btn filled"
              onMouseEnter={handleHover}
              style={{ padding: '12px', marginTop: '10px', justifyContent: 'center', gap: '8px' }}
            >
              <Save size={16} />
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة الشهادة'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default TestimonialsManager;
