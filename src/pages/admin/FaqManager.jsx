import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '../../services/api';
import { audioManager } from '../../utils/audioManager';

const FaqManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  const fetchFaqs = async () => {
    try {
      const data = await api.faqs.getAll();
      setFaqs(data);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const resetForm = () => {
    setQuestion('');
    setAnswer('');
    setCurrentId(null);
    setIsEditing(false);
  };

  const handleEditClick = (faq) => {
    handleClick();
    setIsEditing(true);
    setCurrentId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleClick();
    setFeedback({ type: '', msg: '' });

    try {
      const faqData = {
        question,
        answer
      };

      if (currentId) {
        faqData.id = currentId;
        // Keep existing order_index if editing
        const existing = faqs.find(f => f.id === currentId);
        if (existing) faqData.order_index = existing.order_index;
      } else {
        // Assign order_index as the last item's index + 1
        faqData.order_index = faqs.length;
      }

      await api.faqs.upsert(faqData);
      setFeedback({ type: 'success', msg: currentId ? 'تم تحديث السؤال بنجاح!' : 'تم إضافة السؤال بنجاح!' });
      resetForm();
      fetchFaqs();
    } catch (err) {
      console.error('Error saving FAQ:', err);
      setFeedback({ type: 'error', msg: 'حدث خطأ أثناء الحفظ. يرجى المحاولة لاحقاً.' });
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا السؤال؟')) return;
    handleClick();
    setFeedback({ type: '', msg: '' });

    try {
      await api.faqs.delete(id);
      setFeedback({ type: 'success', msg: 'تم حذف السؤال بنجاح!' });
      fetchFaqs();
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      setFeedback({ type: 'error', msg: 'فشل حذف السؤال. يرجى المحاولة لاحقاً.' });
    }
  };

  // Reorder FAQ items locally and update database
  const handleMove = async (index, direction) => {
    handleClick();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= faqs.length) return;

    const reorderedList = [...faqs];
    // Swap items
    const temp = reorderedList[index];
    reorderedList[index] = reorderedList[newIndex];
    reorderedList[newIndex] = temp;

    // Optimistically update local state
    setFaqs(reorderedList);

    try {
      await api.faqs.reorder(reorderedList);
    } catch (err) {
      console.error('Failed to update FAQ order in database:', err);
      setFeedback({ type: 'error', msg: 'فشل حفظ الترتيب الجديد في قاعدة البيانات.' });
      // Revert back by re-fetching
      fetchFaqs();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--gold)' }}>
        <span>جاري تحميل الأسئلة الشائعة...</span>
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
        
        {/* FAQs List and Reordering */}
        <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--text-light)', margin: '0 0 24px', fontWeight: 700 }}>
            الأسئلة الشائعة الحالية وترتيب ظهورها
          </h3>

          {faqs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              لا توجد أسئلة شائعة مضافة حالياً.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {faqs.map((faq, index) => (
                <div 
                  key={faq.id} 
                  className="faq-item" 
                  style={{ 
                    padding: '20px', 
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'right' }}>
                      {/* Reordering Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button 
                          type="button" 
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          style={{
                            padding: '3px',
                            background: 'none',
                            border: 'none',
                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                            color: index === 0 ? 'var(--text-muted)' : 'var(--gold)',
                            opacity: index === 0 ? 0.3 : 1
                          }}
                          onMouseEnter={handleHover}
                          aria-label="تحريك لأعلى"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === faqs.length - 1}
                          style={{
                            padding: '3px',
                            background: 'none',
                            border: 'none',
                            cursor: index === faqs.length - 1 ? 'not-allowed' : 'pointer',
                            color: index === faqs.length - 1 ? 'var(--text-muted)' : 'var(--gold)',
                            opacity: index === faqs.length - 1 ? 0.3 : 1
                          }}
                          onMouseEnter={handleHover}
                          aria-label="تحريك لأسفل"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-light)' }}>
                        {index + 1}. {faq.question}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleEditClick(faq)} 
                        className="action-btn outline"
                        onMouseEnter={handleHover}
                        style={{ padding: '8px' }}
                        aria-label="تعديل"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(faq.id)} 
                        className="action-btn outline"
                        onMouseEnter={handleHover}
                        style={{ padding: '8px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                        aria-label="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.7', margin: 0, paddingRight: '28px', textAlign: 'right' }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create / Edit Form */}
        <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--text-light)', margin: 0, fontWeight: 700 }}>
              {isEditing ? 'تعديل السؤال الشائع' : 'إضافة سؤال شائع جديد'}
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
              <label htmlFor="faq-question" className="field-label">السؤال (Question):</label>
              <input
                id="faq-question"
                type="text"
                required
                className="standard-input"
                placeholder="مثال: كم تستغرق الحملات الإعلانية للظهور؟"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onFocus={handleHover}
              />
            </div>

            <div className="form-field">
              <label htmlFor="faq-answer" className="field-label">الإجابة (Answer):</label>
              <textarea
                id="faq-answer"
                required
                className="standard-input"
                rows={5}
                placeholder="اكتب الإجابة المفصلة والشافية للسؤال هنا..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onFocus={handleHover}
                style={{ lineHeight: '1.7' }}
              />
            </div>

            <button
              type="submit"
              className="action-btn filled"
              onMouseEnter={handleHover}
              style={{ padding: '12px', marginTop: '10px', justifyContent: 'center', gap: '8px' }}
            >
              <Save size={16} />
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة السؤال'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default FaqManager;
