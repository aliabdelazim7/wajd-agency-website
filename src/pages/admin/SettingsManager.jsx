import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  Users, 
  MessageSquare, 
  Clock, 
  Settings, 
  Trash2, 
  Plus, 
  AlertCircle,
  ShieldAlert,
  UserCheck,
  Code,
  UserPlus
} from 'lucide-react';
import { api } from '../../services/api';
import { audioManager } from '../../utils/audioManager';

const SettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Form states (General Settings)
  const [companyName, setCompanyName] = useState('وجد للتسويق');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  // WhatsApp Templates States
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ id: null, title: '', message: '' });
  const [editingTemplate, setEditingTemplate] = useState(false);

  // Custom Scripts States
  const [scriptsList, setScriptsList] = useState([]);
  const [newScript, setNewScript] = useState({ id: null, name: '', placement: 'head', script_code: '', active: true });
  const [editingScript, setEditingScript] = useState(false);

  // Admin List States
  const [admins, setAdmins] = useState([]);
  const [preauthEmails, setPreauthEmails] = useState([]);
  const [newPreauthEmail, setNewPreauthEmail] = useState('');

  // Audit Logs States
  const [logs, setLogs] = useState([]);

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  const fetchData = async () => {
    try {
      // General Settings
      const settingsData = await api.settings.get().catch((err) => {
        console.warn('site_settings table error:', err);
        return null;
      });

      if (settingsData) {
        setCompanyName(settingsData.company_name || 'وجد للتسويق');
        setPhone(settingsData.phone || '');
        setWhatsapp(settingsData.whatsapp || '');
        setEmail(settingsData.email || '');
        setAddress(settingsData.address || '');
        setFacebookUrl(settingsData.facebook_url || '');
        setInstagramUrl(settingsData.instagram_url || '');
        setLinkedinUrl(settingsData.linkedin_url || '');
        setTiktokUrl(settingsData.tiktok_url || '');
      }

      // Templates
      const templatesData = await api.whatsappTemplates.getAll().catch((err) => {
        console.warn('whatsapp_templates table error:', err);
        return [];
      });
      setTemplates(templatesData);

      // Custom scripts
      const scriptsData = await api.scripts.getAll().catch((err) => {
        console.warn('custom_scripts table error:', err);
        return [];
      });
      setScriptsList(scriptsData);

      // Admins
      const adminsData = await api.admins.getAll().catch((err) => {
        console.warn('profiles/admins table error:', err);
        return [];
      });
      setAdmins(adminsData);

      // Pre-authorized Admins
      const preauthData = await api.preauthAdmins.getAll().catch((err) => {
        console.warn('preauthorized_admins table error:', err);
        return [];
      });
      setPreauthEmails(preauthData);

      // Audit Logs
      const logsData = await api.auditLogs.getAll().catch((err) => {
        console.warn('audit_logs table error:', err);
        return [];
      });
      setLogs(logsData);
    } catch (err) {
      console.error('Unexpected error fetching settings tabs data:', err);
      setFeedback({ type: 'error', msg: 'حدث خطأ غير متوقع أثناء تحميل الإعدادات.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    handleClick();
    setSaving(true);
    setFeedback({ type: '', msg: '' });

    try {
      const settingsData = {
        company_name: companyName,
        phone,
        whatsapp,
        email,
        address,
        facebook_url: facebookUrl,
        instagram_url: instagramUrl,
        linkedin_url: linkedinUrl,
        tiktok_url: tiktokUrl
      };

      await api.settings.update(settingsData);
      setFeedback({ type: 'success', msg: 'تم حفظ وتحديث الإعدادات العامة بنجاح!' });
      fetchData();
    } catch (err) {
      console.error('Error updating settings:', err);
      setFeedback({ type: 'error', msg: 'حدث خطأ أثناء الحفظ. يرجى المحاولة لاحقاً.' });
    } finally {
      setSaving(false);
    }
  };

  // WhatsApp Templates CRUD Handlers
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    handleClick();
    setSaving(true);
    setFeedback({ type: '', msg: '' });

    try {
      const templateData = {
        title: newTemplate.title,
        message: newTemplate.message
      };
      if (newTemplate.id) {
        templateData.id = newTemplate.id;
      }

      await api.whatsappTemplates.upsert(templateData);
      setFeedback({ type: 'success', msg: 'تم حفظ قالب الواتساب بنجاح!' });
      setNewTemplate({ id: null, title: '', message: '' });
      setEditingTemplate(false);
      fetchData();
    } catch (err) {
      console.error('Error saving template:', err);
      setFeedback({ type: 'error', msg: 'فشل حفظ قالب الواتساب.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('هل تريد حذف قالب الواتساب هذا نهائياً؟')) return;
    handleClick();
    try {
      await api.whatsappTemplates.delete(id);
      setFeedback({ type: 'success', msg: 'تم حذف القالب بنجاح!' });
      fetchData();
    } catch (err) {
      console.error('Error deleting template:', err);
      setFeedback({ type: 'error', msg: 'فشل حذف القالب.' });
    }
  };

  // Custom Scripts CRUD Handlers
  const handleSaveScript = async (e) => {
    e.preventDefault();
    handleClick();
    setSaving(true);
    setFeedback({ type: '', msg: '' });

    // 1. Ask for confirmation before modifying custom injected scripts
    const confirmMsg = newScript.id 
      ? 'تحذير أمني: تعديل كود تتبع نشط قد يعطل الموقع أو يعرض بيانات المستخدمين للخطر. هل تريد الاستمرار بحفظ التعديلات؟'
      : 'تحذير أمني: أنت على وشك حقن كود تتبع جديد في الموقع. قد يسبب هذا ثغرات XSS أو يؤثر على أداء الموقع. هل أنت متأكد من موثوقية هذا الكود؟';
    
    if (!window.confirm(confirmMsg)) {
      setSaving(false);
      return;
    }

    // 2. Validate tags before publishing
    const code = newScript.script_code.trim();
    const hasValidHtmlTags = /<[a-z][\s\S]*>/i.test(code);
    if (!hasValidHtmlTags && code.length > 0) {
      if (!window.confirm('تنبيه: الكود المدخل لا يبدو أنه يحتوي على وسوم HTML صالحة (مثل <script> أو <noscript>). هل أنت متأكد من رغبتك في حفظه كـ HTML محقون على أي حال؟')) {
        setSaving(false);
        return;
      }
    }

    try {
      const scriptData = {
        name: newScript.name,
        placement: newScript.placement,
        script_code: newScript.script_code,
        active: newScript.active
      };
      if (newScript.id) {
        scriptData.id = newScript.id;
      }

      // Find old script version for rollback/audit trail
      const oldScript = scriptsList.find(s => s.id === newScript.id);
      const oldCode = oldScript ? oldScript.script_code : '';

      await api.scripts.upsert(scriptData);
      
      // Detailed audit log for rollback support
      const auditDetails = oldScript
        ? `تعديل كود التتبع "${newScript.name}".\n\n[الكود القديم]:\n${oldCode}\n\n[الكود الجديد]:\n${newScript.script_code}`
        : `إضافة كود تتبع جديد "${newScript.name}":\n${newScript.script_code}`;
      await api.auditLogs.log(oldScript ? 'تعديل كود التتبع' : 'إضافة كود تتبع', auditDetails).catch(() => {});

      setFeedback({ type: 'success', msg: 'تم حفظ وتحديث كود التتبع وسجل الأمان بنجاح!' });
      setNewScript({ id: null, name: '', placement: 'head', script_code: '', active: true });
      setEditingScript(false);
      fetchData();
    } catch (err) {
      console.error('Error saving script:', err);
      setFeedback({ type: 'error', msg: 'فشل حفظ كود التتبع. يرجى التحقق من الاتصال بالخادم.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScript = async (id) => {
    if (!window.confirm('هل تريد حذف كود التتبع هذا نهائياً؟')) return;
    handleClick();
    try {
      await api.scripts.delete(id);
      setFeedback({ type: 'success', msg: 'تم حذف كود التتبع بنجاح!' });
      fetchData();
    } catch (err) {
      console.error('Error deleting script:', err);
      setFeedback({ type: 'error', msg: 'فشل حذف كود التتبع.' });
    }
  };

  const toggleScriptActive = async (script) => {
    handleClick();
    try {
      const updated = { ...script, active: !script.active };
      await api.scripts.upsert(updated);
      const statusText = updated.active ? 'تفعيل' : 'تعطيل';
      await api.auditLogs.log('تعديل حالة كود تتبع', `تم ${statusText} كود التتبع: ${script.name}`).catch(() => {});
      setFeedback({ type: 'success', msg: `تم تحديث حالة كود التتبع: ${script.name}` });
      fetchData();
    } catch (err) {
      console.error('Error toggling script active status:', err);
      setFeedback({ type: 'error', msg: 'فشل تعديل حالة الكود.' });
    }
  };

  // Delete Admin profile handler
  const handleDeleteAdmin = async (id, adminEmail) => {
    if (!window.confirm(`هل أنت متأكد من إلغاء صلاحية المشرف للحساب: ${adminEmail}؟ لن يتمكن من دخول لوحة التحكم.`)) return;
    handleClick();
    try {
      await api.admins.delete(id);
      setFeedback({ type: 'success', msg: 'تم إلغاء صلاحيات المشرف بنجاح!' });
      fetchData();
    } catch (err) {
      console.error('Error deleting admin:', err);
      setFeedback({ type: 'error', msg: 'فشل إلغاء صلاحيات المشرف.' });
    }
  };

  // Pre-authorized Admin Handlers
  const handleAddPreauthEmail = async (e) => {
    e.preventDefault();
    handleClick();
    if (!newPreauthEmail) return;
    const emailToInvite = newPreauthEmail.trim().toLowerCase();
    setSaving(true);
    setFeedback({ type: '', msg: '' });

    try {
      await api.preauthAdmins.add(emailToInvite);
      
      // Send invite email notification in background
      setFeedback({ type: 'success', msg: `تمت إضافة الحساب ${emailToInvite} بنجاح، جاري إرسال بريد الدعوة...` });
      
      const emailSent = await api.preauthAdmins.sendInviteEmail(emailToInvite);
      if (emailSent) {
        setFeedback({ type: 'success', msg: `تم إضافة الحساب ${emailToInvite} بنجاح وإرسال بريد إلكتروني للدعوة وتعيين كلمة المرور!` });
      } else {
        setFeedback({ type: 'success', msg: `تم إضافة الحساب ${emailToInvite} بنجاح، ولكن فشل إرسال البريد الإلكتروني تلقائياً (يرجى إرسال رابط التسجيل له يدوياً).` });
      }
      
      setNewPreauthEmail('');
      fetchData();
    } catch (err) {
      console.error('Error adding preauth email:', err);
      setFeedback({ type: 'error', msg: 'فشل ترخيص البريد الإلكتروني. قد يكون مضافاً بالفعل.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePreauthEmail = async (id, email) => {
    if (!window.confirm(`هل أنت متأكد من إلغاء الترخيص المسبق للحساب: ${email}؟`)) return;
    handleClick();
    try {
      await api.preauthAdmins.delete(id, email);
      setFeedback({ type: 'success', msg: 'تم إلغاء ترخيص المشرف بنجاح!' });
      fetchData();
    } catch (err) {
      console.error('Error deleting preauth email:', err);
      setFeedback({ type: 'error', msg: 'فشل إلغاء ترخيص المشرف.' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--gold)' }}>
        <span>جاري تحميل الإعدادات والتهيئات...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'الإعدادات العامة', icon: Settings },
    { id: 'templates', label: 'قوالب الواتساب', icon: MessageSquare },
    { id: 'scripts', label: 'مدير الأكواد (Scripts)', icon: Code },
    { id: 'admins', label: 'إدارة المشرفين', icon: Users },
    { id: 'logs', label: 'سجل النشاطات', icon: Clock }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Tabs Switcher */}
      <div 
        role="tablist" 
        aria-label="تبويبات الإعدادات والتحكم"
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '12px',
          flexWrap: 'wrap'
        }}
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => { handleClick(); setActiveTab(tab.id); setFeedback({ type: '', msg: '' }); }}
              className={`action-btn ${activeTab === tab.id ? 'filled' : 'outline'}`}
              onMouseEnter={handleHover}
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                borderColor: activeTab === tab.id ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {feedback.msg && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 600,
          background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: feedback.type === 'success' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          color: feedback.type === 'success' ? '#22c55e' : '#ef4444',
          textAlign: 'right'
        }}>
          {feedback.msg}
        </div>
      )}

      {/* --- TAB 1: General Settings --- */}
      {activeTab === 'general' && (
        <div 
          role="tabpanel" 
          id="panel-general" 
          aria-labelledby="tab-general" 
          tabIndex={0}
          className="contact-container" 
          style={{ padding: '40px', borderRadius: '24px', outline: 'none' }}
        >
          <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: '0 0 24px', fontWeight: 700, textAlign: 'right' }}>
            تعديل بيانات الاتصال ومواقع التواصل الاجتماعي للوكالة
          </h3>

          <form onSubmit={handleGeneralSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h4 style={{ fontSize: '15px', color: 'var(--gold)', margin: '0 0 4px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', textAlign: 'right' }}>
              البيانات الأساسية للشركة
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
              <div className="form-field">
                <label htmlFor="company-name" className="field-label">اسم الوكالة التجاري (Company Name):</label>
                <input
                  id="company-name"
                  type="text"
                  required
                  className="standard-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onFocus={handleHover}
                  placeholder="مثال: وجد للتسويق الرقمي"
                />
              </div>

              <div className="form-field">
                <label htmlFor="company-email" className="field-label">البريد الإلكتروني للوكالة (Email):</label>
                <input
                  id="company-email"
                  type="email"
                  required
                  className="standard-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleHover}
                  placeholder="مثال: info@wajd.agency"
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-field">
                <label htmlFor="company-phone" className="field-label">رقم الهاتف (Phone):</label>
                <input
                  id="company-phone"
                  type="text"
                  className="standard-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={handleHover}
                  placeholder="مثال: 966500000000+"
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="company-whatsapp" className="field-label">رقم الواتساب للتواصل المباشر (WhatsApp):</label>
                <input
                  id="company-whatsapp"
                  type="text"
                  className="standard-input"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  onFocus={handleHover}
                  placeholder="مثال: 966500000000+"
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="company-address" className="field-label">العنوان الجغرافي / المقر (Address):</label>
              <input
                id="company-address"
                type="text"
                className="standard-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={handleHover}
                placeholder="مثال: الرياض، المملكة العربية السعودية"
              />
            </div>

            <h4 style={{ fontSize: '15px', color: 'var(--gold)', margin: '15px 0 4px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', textAlign: 'right' }}>
              روابط قنوات التواصل الاجتماعي (Social Links)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-field">
                <label htmlFor="company-linkedin" className="field-label">حساب لينكد إن (LinkedIn URL):</label>
                <input
                  id="company-linkedin"
                  type="url"
                  className="standard-input"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  onFocus={handleHover}
                  placeholder="https://linkedin.com/company/wajd-agency"
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="company-instagram" className="field-label">حساب إنستغرام (Instagram URL):</label>
                <input
                  id="company-instagram"
                  type="url"
                  className="standard-input"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  onFocus={handleHover}
                  placeholder="https://instagram.com/wajd.agency"
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-field">
                <label htmlFor="company-facebook" className="field-label">صفحة فيسبوك (Facebook URL):</label>
                <input
                  id="company-facebook"
                  type="url"
                  className="standard-input"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  onFocus={handleHover}
                  placeholder="https://facebook.com/wajd.agency"
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="company-tiktok" className="field-label">حساب تيك توك (TikTok URL):</label>
                <input
                  id="company-tiktok"
                  type="url"
                  className="standard-input"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  onFocus={handleHover}
                  placeholder="https://tiktok.com/@wajd.agency"
                  style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="action-btn filled"
              onMouseEnter={handleHover}
              style={{ padding: '14px', marginTop: '15px', justifyContent: 'center', gap: '10px' }}
            >
              {saving ? <RefreshCw className="spinner-icon" size={18} /> : <Save size={18} />}
              <span>{saving ? 'جاري حفظ الإعدادات...' : 'حفظ وتحديث الإعدادات العامة'}</span>
            </button>
          </form>
        </div>
      )}

      {/* --- TAB 2: WhatsApp Templates --- */}
      {activeTab === 'templates' && (
        <div 
          role="tabpanel" 
          id="panel-templates" 
          aria-labelledby="tab-templates" 
          tabIndex={0}
          style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start', outline: 'none' }}
        >
          
          {/* List of current templates */}
          <div className="contact-container" style={{ padding: '30px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: 0, fontWeight: 700, textAlign: 'right' }}>
              قوالب الرسائل المسجلة
            </h3>

            {templates.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>
                لا توجد قوالب رسائل مسجلة حالياً.
              </div>
            ) : (
              templates.map(tmpl => (
                <div 
                  key={tmpl.id} 
                  className="faq-item" 
                  style={{ 
                    padding: '20px', 
                    borderRadius: '16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px',
                    textAlign: 'right'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--gold)', fontSize: '15px' }}>{tmpl.title}</strong>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => { handleClick(); setNewTemplate(tmpl); setEditingTemplate(true); }}
                        className="back-to-site-link"
                        onMouseEnter={handleHover}
                        style={{ fontSize: '12px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        تعديل
                      </button>
                      <span style={{ color: 'var(--border-glass)' }}>|</span>
                      <button 
                        onClick={() => handleDeleteTemplate(tmpl.id)}
                        className="back-to-site-link"
                        onMouseEnter={handleHover}
                        style={{ fontSize: '12px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {tmpl.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Create/Edit template form */}
          <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: '0 0 20px', fontWeight: 700, textAlign: 'right' }}>
              {editingTemplate ? 'تعديل قالب رسالة' : 'إنشاء قالب رسالة جديد'}
            </h3>

            <form onSubmit={handleSaveTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'right' }}>
              <div className="form-field">
                <label htmlFor="tmpl-title" className="field-label">عنوان القالب (الوصف البسيط):</label>
                <input 
                  id="tmpl-title"
                  type="text"
                  required
                  className="standard-input"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  placeholder="مثال: رسالة ترحيبية بالعميل الجديد"
                  onFocus={handleHover}
                />
              </div>

              <div className="form-field">
                <label htmlFor="tmpl-message" className="field-label">نص الرسالة (يمكنك استخدام المتغيرات):</label>
                <textarea
                  id="tmpl-message"
                  required
                  rows={8}
                  className="standard-input"
                  value={newTemplate.message}
                  onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                  placeholder="اكتب رسالتك هنا...&#10;مثال: مرحباً {name}، يسعدنا تواصلك معنا بخصوص خدمة {service}..."
                  onFocus={handleHover}
                  style={{ resize: 'vertical', lineHeight: '1.6', padding: '12px 16px' }}
                />
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px dashed var(--border-glass)',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                lineHeight: '1.6'
              }}>
                <strong>💡 المتغيرات المدعومة:</strong>
                <ul style={{ margin: '6px 0 0', paddingRight: '20px' }}>
                  <li><code>{`{name}`}</code> سيتم استبدالها باسم العميل تلقائياً.</li>
                  <li><code>{`{service}`}</code> سيتم استبدالها بالخدمة المطلوبة.</li>
                  <li><code>{`{phone}`}</code> سيتم استبدالها بجوال العميل.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="action-btn filled"
                  onMouseEnter={handleHover}
                  style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                >
                  <Save size={16} style={{ marginLeft: '6px' }} />
                  <span>{editingTemplate ? 'تحديث القالب' : 'حفظ القالب الجديد'}</span>
                </button>
                {editingTemplate && (
                  <button
                    type="button"
                    onClick={() => { setNewTemplate({ id: null, title: '', message: '' }); setEditingTemplate(false); }}
                    className="action-btn outline"
                    onMouseEnter={handleHover}
                    style={{ padding: '12px' }}
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      )}

      {/* --- TAB 3: Custom Scripts Injector --- */}
      {activeTab === 'scripts' && (
        <div 
          role="tabpanel" 
          id="panel-scripts" 
          aria-labelledby="tab-scripts" 
          tabIndex={0}
          style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start', outline: 'none' }}
        >
          
          {/* List of custom tracking scripts */}
          <div className="contact-container" style={{ padding: '30px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: 0, fontWeight: 700, textAlign: 'right' }}>
              أكواد التتبع والبكسل النشطة (Active Pixels & Scripts)
            </h3>

            {scriptsList.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>
                لا توجد أكواد تتبع مضافة حالياً.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scriptsList.map(script => (
                  <div 
                    key={script.id} 
                    className="faq-item" 
                    style={{ 
                      padding: '20px', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      textAlign: 'right'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ color: 'var(--gold)', fontSize: '15px' }}>{script.name}</strong>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-glass)',
                          color: 'var(--text-muted)'
                        }}>
                          {script.placement === 'head' ? 'وسم Head' : 
                           script.placement === 'body_start' ? 'بداية Body' : 'نهاية Body'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Active status quick toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {script.active ? 'نشط' : 'معطل'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleScriptActive(script)}
                            onMouseEnter={handleHover}
                            style={{
                              width: '38px',
                              height: '20px',
                              borderRadius: '20px',
                              background: script.active ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                              border: '1px solid var(--border-glass)',
                              position: 'relative',
                              cursor: 'pointer',
                              padding: 0,
                              transition: 'all 0.3s'
                            }}
                          >
                            <span style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: '#fff',
                              display: 'block',
                              position: 'absolute',
                              top: '2px',
                              left: script.active ? '22px' : '2px',
                              transition: 'all 0.3s'
                            }} />
                          </button>
                        </div>
                        
                        <span style={{ color: 'var(--border-glass)' }}>|</span>
                        
                        <button 
                          onClick={() => { handleClick(); setNewScript(script); setEditingScript(true); }}
                          className="back-to-site-link"
                          onMouseEnter={handleHover}
                          style={{ fontSize: '12px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          تعديل
                        </button>
                        
                        <span style={{ color: 'var(--border-glass)' }}>|</span>
                        
                        <button 
                          onClick={() => handleDeleteScript(script.id)}
                          className="back-to-site-link"
                          onMouseEnter={handleHover}
                          style={{ fontSize: '12px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                    <pre style={{
                      margin: 0,
                      padding: '12px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'Consolas, monospace',
                      color: 'var(--text-muted)',
                      maxHeight: '100px',
                      overflow: 'auto',
                      direction: 'ltr',
                      textAlign: 'left'
                    }}>
                      {script.script_code}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Custom Script Form */}
          <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: '0 0 20px', fontWeight: 700, textAlign: 'right' }}>
              {editingScript ? 'تعديل كود التتبع' : 'إضافة كود تتبع جديد (Pixel)'}
            </h3>

            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#ef4444',
              fontSize: '12px',
              lineHeight: '1.6',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px',
              textAlign: 'right'
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>
                <strong>تحذير أمني:</strong> حقن أكواد HTML/Javascript غير موثوقة قد يسبب هجمات XSS أو يعطل واجهة الموقع بالكامل. يرجى مراجعة الأكواد بعناية قبل الحفظ.
              </span>
            </div>

            <form onSubmit={handleSaveScript} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'right' }}>
              <div className="form-field">
                <label htmlFor="script-name" className="field-label">اسم كود التتبع (الوصف):</label>
                <input 
                  id="script-name"
                  type="text"
                  required
                  className="standard-input"
                  value={newScript.name}
                  onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
                  placeholder="مثال: Meta Pixel / Google Tag Manager"
                  onFocus={handleHover}
                />
              </div>

              <div className="form-field">
                <label htmlFor="script-placement" className="field-label">مكان حقن الكود في الموقع (Placement):</label>
                <select
                  id="script-placement"
                  className="standard-input"
                  value={newScript.placement}
                  onChange={(e) => setNewScript({ ...newScript, placement: e.target.value })}
                  onFocus={handleHover}
                  style={{ background: 'var(--bg-card)', color: 'var(--text-light)' }}
                >
                  <option value="head">داخل وسم الرأس &lt;head&gt; (موصى به لمعظم الأكواد)</option>
                  <option value="body_start">بداية وسم الجسم &lt;body&gt; (مباشرة بعد الفتح)</option>
                  <option value="body_end">نهاية وسم الجسم &lt;body&gt; (قبل الإغلاق)</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="script-code" className="field-label">كود البرمجة / التتبع بالكامل (HTML / Script Tags):</label>
                <textarea
                  id="script-code"
                  required
                  rows={10}
                  className="standard-input"
                  value={newScript.script_code}
                  onChange={(e) => setNewScript({ ...newScript, script_code: e.target.value })}
                  placeholder={`اكتب كود التتبع هنا...\nمثال:\n<script>\n  fbq('init', 'YOUR-PIXEL-ID');\n  fbq('track', 'PageView');\n</script>\n<noscript>\n  <img height="1" width="1" src="https://www.facebook.com/tr?id=YOUR-PIXEL-ID&ev=PageView" />\n</noscript>`}
                  onFocus={handleHover}
                  style={{ 
                    resize: 'vertical', 
                    lineHeight: '1.5', 
                    padding: '12px 16px',
                    fontFamily: 'Consolas, monospace',
                    direction: 'ltr',
                    textAlign: 'left',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  id="script-active"
                  type="checkbox"
                  checked={newScript.active}
                  onChange={(e) => setNewScript({ ...newScript, active: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="script-active" style={{ fontSize: '13px', color: 'var(--text-light)', cursor: 'pointer' }}>تفعيل الكود وحقنه مباشرة في صفحات الموقع العامة</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="action-btn filled"
                  onMouseEnter={handleHover}
                  style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                >
                  <Save size={16} style={{ marginLeft: '6px' }} />
                  <span>{editingScript ? 'تحديث الكود' : 'حفظ وحقن الكود الجديد'}</span>
                </button>
                {editingScript && (
                  <button
                    type="button"
                    onClick={() => { setNewScript({ id: null, name: '', placement: 'head', script_code: '', active: true }); setEditingScript(false); }}
                    className="action-btn outline"
                    onMouseEnter={handleHover}
                    style={{ padding: '12px' }}
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      )}

      {/* --- TAB 4: Admin Accounts --- */}
      {activeTab === 'admins' && (
        <div 
          role="tabpanel" 
          id="panel-admins" 
          aria-labelledby="tab-admins" 
          tabIndex={0}
          style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start', outline: 'none' }}
        >
          
          {/* Active Admins List */}
          <div className="contact-container" style={{ padding: '30px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: 0, fontWeight: 700, textAlign: 'right' }}>
              المشرفون النشطون على المنصة
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(197, 168, 98, 0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '14px 18px',
              color: 'var(--gold)',
              fontSize: '13px',
              textAlign: 'right'
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>فقط الحسابات المدرجة هنا أو الحاصلة على ترخيص مسبق يمكنها تسجيل الدخول لوحة التحكم.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {admins.map((adm) => (
                <div 
                  key={adm.id} 
                  className="faq-item" 
                  style={{ 
                    padding: '16px 20px', 
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'right' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(197, 168, 98, 0.05)',
                      border: '1px solid rgba(197, 168, 98, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold)'
                    }}>
                      <UserCheck size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', fontFamily: 'var(--font-en)' }}>{adm.email}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        تاريخ التسجيل: {new Date(adm.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '20px',
                      background: 'rgba(34, 197, 94, 0.05)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      color: '#22c55e'
                    }}>
                      نشط
                    </span>
                    
                    {admins.length > 1 && (
                      <button
                        onClick={() => handleDeleteAdmin(adm.id, adm.email)}
                        onMouseEnter={handleHover}
                        className="action-btn outline"
                        style={{ padding: '6px 10px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                        title="سحب الصلاحيات الإدارية"
                        aria-label={`إلغاء صلاحية المشرف ${adm.email}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Authorized Admins Section */}
          <div className="contact-container" style={{ padding: '30px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: 0, fontWeight: 700, textAlign: 'right' }}>
              تراخيص المشرفين المسبقة (Pre-Authorization)
            </h3>

            {/* Add Preauth Form */}
            <form onSubmit={handleAddPreauthEmail} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'right' }}>
              <div className="form-field">
                <label htmlFor="preauth-email" className="field-label">إضافة بريد إلكتروني مسموح له بالتسجيل:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    id="preauth-email"
                    type="email"
                    required
                    className="standard-input"
                    value={newPreauthEmail}
                    onChange={(e) => setNewPreauthEmail(e.target.value)}
                    placeholder="admin@wajd.agency"
                    onFocus={handleHover}
                    style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'var(--font-en)' }}
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="action-btn filled"
                    onMouseEnter={handleHover}
                    style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
                  >
                    {saving ? <RefreshCw className="spinner-icon" size={16} /> : <UserPlus size={16} />}
                    <span>ترخيص الحساب</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Preauth Emails List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--gold)', margin: '10px 0 0', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', textAlign: 'right' }}>
                الحسابات المُرخصة مسبقاً
              </h4>

              {preauthEmails.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px', fontSize: '13px' }}>
                  لا توجد حسابات مرخصة مسبقاً حالياً.
                </div>
              ) : (
                preauthEmails.map((item) => {
                  const inviter = admins.find(a => a.id === item.invited_by);
                  const inviterEmail = inviter ? inviter.email : 'النظام الرئيسي';
                  return (
                    <div 
                      key={item.id} 
                      className="faq-item" 
                      style={{ 
                        padding: '14px 18px', 
                        borderRadius: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        textAlign: 'right'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', fontFamily: 'var(--font-en)' }}>
                          {item.email}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          مرخص بواسطة: <span style={{ fontFamily: 'var(--font-en)' }}>{inviterEmail}</span> | {new Date(item.created_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeletePreauthEmail(item.id, item.email)}
                        onMouseEnter={handleHover}
                        className="action-btn outline"
                        style={{ padding: '6px 10px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', flexShrink: 0 }}
                        title="إلغاء الترخيص"
                        aria-label={`إلغاء ترخيص الحساب ${item.email}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 5: Audit Logs --- */}
      {activeTab === 'logs' && (
        <div 
          role="tabpanel" 
          id="panel-logs" 
          aria-labelledby="tab-logs" 
          tabIndex={0}
          className="contact-container" 
          style={{ padding: '30px', borderRadius: '24px', outline: 'none' }}
        >
          <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: '0 0 20px', fontWeight: 700, textAlign: 'right' }}>
            سجل العمليات والنشاطات
          </h3>

          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>
              لا توجد نشاطات مسجلة في النظام حتى الآن.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'right',
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <th style={{ padding: '12px 10px', color: 'var(--gold)' }}>المشرف</th>
                    <th style={{ padding: '12px 10px', color: 'var(--gold)' }}>العملية</th>
                    <th style={{ padding: '12px 10px', color: 'var(--gold)' }}>التفاصيل</th>
                    <th style={{ padding: '12px 10px', color: 'var(--gold)', textAlign: 'left' }}>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr 
                      key={log.id} 
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.02)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 10px', fontWeight: 600, color: 'var(--text-light)', fontFamily: 'var(--font-en)' }}>
                        {log.user_email}
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(197, 168, 98, 0.05)',
                          border: '1px solid var(--border-glass)',
                          color: 'var(--gold)',
                          fontWeight: 'bold',
                          fontSize: '11px'
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', color: 'var(--text-muted)' }}>
                        {log.details || '-'}
                      </td>
                      <td style={{ padding: '14px 10px', color: 'var(--text-muted)', fontFamily: 'var(--font-en)', textAlign: 'left', direction: 'ltr' }}>
                        {new Date(log.created_at).toLocaleString('ar-EG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SettingsManager;
