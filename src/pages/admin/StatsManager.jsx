import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { api } from '../../services/api';
import { audioManager } from '../../utils/audioManager';

const StatsManager = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [value, setValue] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [label, setLabel] = useState('');
  const [decimals, setDecimals] = useState(0);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  const fetchStats = async () => {
    try {
      const data = await api.stats.getAll();
      setStats(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const resetForm = () => {
    setValue('');
    setPrefix('');
    setSuffix('');
    setLabel('');
    setDecimals(0);
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleEditClick = (stat) => {
    handleClick();
    setIsEditing(true);
    setCurrentId(stat.id);
    setValue(stat.value);
    setPrefix(stat.prefix || '');
    setSuffix(stat.suffix || '');
    setLabel(stat.label);
    setDecimals(stat.decimals || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleClick();
    setFeedback({ type: '', msg: '' });

    try {
      const statData = {
        value: Number(value),
        prefix,
        suffix,
        label,
        decimals: Number(decimals)
      };
      if (currentId) {
        statData.id = currentId;
      }

      await api.stats.upsert(statData);
      setFeedback({ type: 'success', msg: currentId ? 'تم تحديث الإحصائية بنجاح!' : 'تم إضافة الإحصائية بنجاح!' });
      resetForm();
      fetchStats();
    } catch (err) {
      console.error('Error saving statistic:', err);
      setFeedback({ type: 'error', msg: 'حدث خطأ أثناء الحفظ. يرجى المحاولة لاحقاً.' });
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الإحصائية؟')) return;
    handleClick();
    setFeedback({ type: '', msg: '' });

    try {
      await api.stats.delete(id);
      setFeedback({ type: 'success', msg: 'تم حذف الإحصائية بنجاح!' });
      fetchStats();
    } catch (err) {
      console.error('Error deleting statistic:', err);
      setFeedback({ type: 'error', msg: 'فشل حذف الإحصائية. يرجى المحاولة لاحقاً.' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--gold)' }}>
        <span>جاري تحميل الإحصائيات...</span>
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
        
        {/* Statistics List Table */}
        <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--text-light)', margin: '0 0 24px', fontWeight: 700 }}>
            قائمة المؤشرات والأرقام الحالية
          </h3>

          {stats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              لا توجد إحصائيات مضافة حالياً.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.map((stat) => (
                <div 
                  key={stat.id} 
                  className="faq-item" 
                  style={{ 
                    padding: '20px 24px', 
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ 
                      fontSize: '28px', 
                      fontWeight: 800, 
                      color: 'var(--gold)',
                      fontFamily: 'var(--font-en)'
                    }}>
                      {stat.prefix}{stat.decimals > 0 ? Number(stat.value).toFixed(stat.decimals) : stat.value}{stat.suffix}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{stat.label}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleEditClick(stat)} 
                      className="action-btn outline"
                      onMouseEnter={handleHover}
                      style={{ padding: '10px' }}
                      aria-label="تعديل"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(stat.id)} 
                      className="action-btn outline"
                      onMouseEnter={handleHover}
                      style={{ padding: '10px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                      aria-label="حذف"
                    >
                      <Trash2 size={16} />
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
              {isEditing ? 'تعديل الإحصائية' : 'إضافة إحصائية جديدة'}
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
              <label htmlFor="stat-label" className="field-label">اسم المؤشر / الوصف (Label):</label>
              <input
                id="stat-label"
                type="text"
                required
                className="standard-input"
                placeholder="مثال: أعلى عائد إعلاني ROAS"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onFocus={handleHover}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-field">
                <label htmlFor="stat-value" className="field-label">القيمة الرقمية (Value):</label>
                <input
                  id="stat-value"
                  type="number"
                  step="any"
                  required
                  className="standard-input"
                  placeholder="مثال: 6.4"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onFocus={handleHover}
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="stat-decimals" className="field-label">الخانات العشرية (Decimals):</label>
                <input
                  id="stat-decimals"
                  type="number"
                  min="0"
                  max="4"
                  required
                  className="standard-input"
                  value={decimals}
                  onChange={(e) => setDecimals(e.target.value)}
                  onFocus={handleHover}
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-field">
                <label htmlFor="stat-prefix" className="field-label">البادئة (Prefix):</label>
                <input
                  id="stat-prefix"
                  type="text"
                  className="standard-input"
                  placeholder="مثال: $"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  onFocus={handleHover}
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="stat-suffix" className="field-label">اللاحقة (Suffix):</label>
                <input
                  id="stat-suffix"
                  type="text"
                  className="standard-input"
                  placeholder="مثال: x أو M+"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  onFocus={handleHover}
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>
            </div>

            {/* Live Visual Preview */}
            <div style={{
              background: 'rgba(197, 168, 98, 0.03)',
              border: '1px dashed rgba(197, 168, 98, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              marginTop: '10px'
            }}>
              <span className="field-label" style={{ display: 'block', marginBottom: '8px' }}>معاينة الشكل النهائي:</span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-en)', marginBottom: '4px' }}>
                {prefix}{Number(value || 0).toFixed(decimals)}{suffix}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label || 'اسم المؤشر'}</div>
            </div>

            <button
              type="submit"
              className="action-btn filled"
              onMouseEnter={handleHover}
              style={{ padding: '12px', marginTop: '10px', justifyContent: 'center', gap: '8px' }}
            >
              <Save size={16} />
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة إحصائية'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default StatsManager;
