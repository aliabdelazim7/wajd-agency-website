import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  MessageSquare, 
  Tag, 
  Download,
  Send,
  X,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { audioManager } from '../../utils/audioManager';

const LeadsManager = () => {
  const [leads, setLeads] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedTemplateLead, setSelectedTemplateLead] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Status mappings
  const statuses = [
    { value: 'all', label: 'الكل', color: '#c5a862' },
    { value: 'New', label: 'جديد', color: '#3b82f6' },
    { value: 'Contacted', label: 'تم التواصل', color: '#eab308' },
    { value: 'Qualified', label: 'مستهدف/مؤهل', color: '#a855f7' },
    { value: 'Closed', label: 'مكتمل/مغلق', color: '#22c55e' },
    { value: 'Lost', label: 'مستبعد', color: '#ef4444' }
  ];

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  const fetchLeads = async () => {
    try {
      const data = await api.leads.getAll(statusFilter);
      setLeads(data);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setFeedback({ type: 'error', msg: 'فشل تحميل قائمة العملاء.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await api.whatsappTemplates.getAll();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    handleClick();
    setFeedback({ type: '', msg: '' });
    try {
      await api.leads.updateStatus(id, newStatus);
      setFeedback({ type: 'success', msg: 'تم تحديث حالة العميل بنجاح!' });
      fetchLeads();
    } catch (err) {
      console.error('Error updating status:', err);
      setFeedback({ type: 'error', msg: 'فشل تحديث حالة العميل.' });
    }
  };

  // CSV Export Handler with UTF-8 BOM encoding to support Arabic correctly in Excel
  const handleExportCSV = () => {
    handleClick();
    if (filteredLeads.length === 0) return;

    const headers = ['الاسم', 'البريد الإلكتروني', 'الجوال', 'الخدمة المطلوبة', 'الرسالة', 'الحالة', 'تاريخ الطلب'];
    const rows = filteredLeads.map(lead => [
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.service || '',
      (lead.message || '').replace(/\n/g, ' ').replace(/"/g, '""'),
      lead.status === 'New' ? 'جديد' : 
      lead.status === 'Contacted' ? 'تم التواصل' : 
      lead.status === 'Qualified' ? 'مؤهل' : 
      lead.status === 'Closed' ? 'مكتمل' : 'مستبعد',
      new Date(lead.created_at).toLocaleString('ar-EG')
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(','), 
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wajd_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedback({ type: 'success', msg: 'تم تصدير ملف العملاء بنجاح!' });
  };

  const handleSendTemplate = (template, lead) => {
    handleClick();
    let text = template.message
      .replace(/{name}/g, lead.name || '')
      .replace(/{service}/g, lead.service || '')
      .replace(/{phone}/g, lead.phone || '');
    
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    let finalPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      if (cleanPhone.startsWith('05')) {
        finalPhone = '966' + cleanPhone.substring(1);
      } else if (cleanPhone.startsWith('01')) {
        finalPhone = '20' + cleanPhone.substring(1);
      }
    }
    const url = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSelectedTemplateLead(null);
  };

  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.phone?.toLowerCase().includes(term) ||
      lead.service?.toLowerCase().includes(term) ||
      lead.message?.toLowerCase().includes(term)
    );
  });

  const totalCount = leads.length;
  const newCount = leads.filter(l => l.status === 'New').length;
  const closedCount = leads.filter(l => l.status === 'Closed').length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="faq-item" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>إجمالي العملاء المستلمة</span>
          <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-en)' }}>{totalCount}</span>
        </div>
        <div className="faq-item" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>العملاء الجدد (قيد الانتظار)</span>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6', fontFamily: 'var(--font-en)' }}>{newCount}</span>
        </div>
        <div className="faq-item" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>الصفقات المغلقة / الناجحة</span>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#22c55e', fontFamily: 'var(--font-en)' }}>{closedCount}</span>
        </div>
        <div className="faq-item" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>معدل إغلاق العملاء</span>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-en)' }}>
            {totalCount > 0 ? `${Math.round((closedCount / totalCount) * 100)}%` : '0%'}
          </span>
        </div>
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

      {/* Filter & Search Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        background: 'rgba(255,255,255,0.02)',
        padding: '18px 24px',
        borderRadius: '20px',
        border: '1px solid var(--border-glass)'
      }}>
        
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {statuses.map(st => (
            <button
              key={st.value}
              onClick={() => { handleClick(); setStatusFilter(st.value); }}
              className={`action-btn ${statusFilter === st.value ? 'filled' : 'outline'}`}
              onMouseEnter={handleHover}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                borderColor: statusFilter === st.value ? 'var(--gold)' : 'rgba(255,255,255,0.1)'
              }}
            >
              <span>{st.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Export Actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '500px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleExportCSV}
            onMouseEnter={handleHover}
            className="action-btn outline"
            disabled={filteredLeads.length === 0}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              borderColor: 'var(--gold)',
              color: 'var(--gold)',
              gap: '8px'
            }}
          >
            <Download size={16} />
            <span>تصدير البيانات (CSV)</span>
          </button>

          <div style={{ position: 'relative', width: '250px' }}>
            <input
              type="text"
              className="standard-input"
              placeholder="بحث بالاسم، الخدمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleHover}
              style={{ paddingRight: '40px' }}
            />
            <Search size={16} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--gold)' }}>
          <span>جاري تحميل العملاء...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          
          {/* Leads Listing */}
          <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
            
            {filteredLeads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                لا توجد طلبات عملاء مطابقة للخيارات المحددة.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredLeads.map((lead) => {
                  const currentStatus = statuses.find(s => s.value === lead.status) || statuses[1];
                  const isExpanded = selectedLeadId === lead.id;
                  
                  return (
                    <div
                      key={lead.id}
                      className="faq-item"
                      style={{
                        padding: '24px',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        borderRight: `4px solid ${currentStatus.color}`
                      }}
                    >
                      
                      {/* Main Lead Line */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', textAlign: 'right' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'rgba(197, 168, 98, 0.05)',
                            border: '1px solid rgba(197, 168, 98, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--gold)'
                          }}>
                            <User size={20} />
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-light)' }}>{lead.name}</span>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Tag size={12} style={{ color: 'var(--gold)' }} />
                                {lead.service}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-en)' }}>
                                <Calendar size={12} />
                                {formatDate(lead.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Dropdown & Expansion toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          
                          {/* Quick WhatsApp Template Trigger */}
                          <button
                            onClick={() => { handleClick(); setSelectedTemplateLead(lead); }}
                            onMouseEnter={handleHover}
                            className="action-btn outline"
                            style={{
                              padding: '8px 12px',
                              fontSize: '12px',
                              borderColor: 'rgba(34, 197, 94, 0.3)',
                              color: '#22c55e',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Send size={12} />
                            <span>رد سريع</span>
                          </button>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>الحالة:</span>
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              onFocus={handleHover}
                              style={{
                                background: '#111',
                                border: '1px solid var(--border-glass)',
                                color: currentStatus.color,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {statuses.slice(1).map(st => (
                                <option key={st.value} value={st.value} style={{ color: st.color }}>
                                  {st.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={() => { handleClick(); setSelectedLeadId(isExpanded ? null : lead.id); }}
                            className="action-btn outline"
                            onMouseEnter={handleHover}
                            style={{ padding: '8px 16px', fontSize: '12px' }}
                          >
                            <span>{isExpanded ? 'إخفاء التفاصيل' : 'تفاصيل الطلب'}</span>
                          </button>

                        </div>

                      </div>

                      {/* Expanded Panel (Full Contact Channels + message text) */}
                      {isExpanded && (
                        <div style={{
                          paddingTop: '20px',
                          borderTop: '1px solid var(--border-glass)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '15px',
                          textAlign: 'right'
                        }}>
                          
                          {/* Contact quick links */}
                          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <a
                              href={`mailto:${lead.email}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="back-to-site-link"
                              onMouseEnter={handleHover}
                              onClick={handleClick}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}
                            >
                              <Mail size={14} style={{ color: 'var(--gold)' }} />
                              <span style={{ fontFamily: 'var(--font-en)' }}>{lead.email}</span>
                            </a>

                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="back-to-site-link"
                              onMouseEnter={handleHover}
                              onClick={handleClick}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}
                            >
                              <Phone size={14} style={{ color: 'var(--gold)' }} />
                              <span style={{ fontFamily: 'var(--font-en)', direction: 'ltr' }}>{lead.phone}</span>
                            </a>
                          </div>

                          {/* Message content */}
                          <div style={{
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px dashed var(--border-glass)',
                            borderRadius: '10px',
                            padding: '16px',
                            marginTop: '5px'
                          }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', color: 'var(--gold)', fontSize: '13px', fontWeight: 700 }}>
                              <MessageSquare size={14} />
                              <span>رسالة العميل:</span>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.7', margin: 0 }}>
                              {lead.message || 'لا توجد رسالة مرفقة من العميل.'}
                            </p>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* Quick WhatsApp Template Picker Modal */}
      {selectedTemplateLead && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(7, 8, 11, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px',
          direction: 'rtl'
        }}>
          <div className="contact-container" style={{ maxWidth: '600px', width: '100%', padding: '35px', borderRadius: '24px', position: 'relative' }}>
            <button
              onClick={() => { handleClick(); setSelectedTemplateLead(null); }}
              className="mobile-menu-btn"
              style={{ position: 'absolute', left: '20px', top: '20px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '22px', color: 'var(--gold)', fontWeight: 700, marginBottom: '10px', textAlign: 'right' }}>
              الرد السريع بالواتساب
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'right' }}>
              اختر أحد القوالب الجاهزة للرد الفوري على العميل <strong>{selectedTemplateLead.name}</strong> بخصوص طلب <strong>{selectedTemplateLead.service}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px', overflowY: 'auto', paddingLeft: '4px' }}>
              {templates.length === 0 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  color: '#f59e0b',
                  fontSize: '13px'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>لا توجد قوالب واتساب مسجلة حالياً. يمكنك إضافتها من صفحة الإعدادات.</span>
                </div>
              ) : (
                templates.map(tmpl => {
                  const renderedText = tmpl.message
                    .replace(/{name}/g, selectedTemplateLead.name || '')
                    .replace(/{service}/g, selectedTemplateLead.service || '')
                    .replace(/{phone}/g, selectedTemplateLead.phone || '');

                  return (
                    <div
                      key={tmpl.id}
                      className="faq-item"
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        cursor: 'pointer',
                        border: '1px solid var(--border-glass)'
                      }}
                      onClick={() => handleSendTemplate(tmpl, selectedTemplateLead)}
                      onMouseEnter={handleHover}
                    >
                      <strong style={{ color: 'var(--gold)', fontSize: '15px' }}>{tmpl.title}</strong>
                      <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {renderedText}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#22c55e',
                        fontWeight: 600,
                        alignSelf: 'flex-start'
                      }}>
                        <Send size={12} />
                        <span>اختيار وإرسال عبر واتساب</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LeadsManager;
