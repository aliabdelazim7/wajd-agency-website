import { supabase } from './supabaseClient';

const checkSupabase = () => {
  if (!supabase) {
    throw new Error('قاعدة البيانات غير متصلة: يرجى إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env');
  }
};

// Wrap all API services dynamically to check Supabase connection first
const wrapService = (service) => {
  return new Proxy(service, {
    get(target, prop) {
      if (typeof target[prop] === 'function') {
        return function (...args) {
          checkSupabase();
          return target[prop].apply(this, args);
        };
      }
      return target[prop];
    }
  });
};

const sendEmailNotification = async (leadData) => {
  const recipientEmail = "wajd.marketing@gmail.com";
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  try {
    if (accessKey) {
      // Web3Forms implementation (Client-side, free)
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `طلب استشارة جديد من: ${leadData.name}`,
          from_name: "وكالة وجد للتسويق",
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          service: leadData.service,
          message: leadData.message
        })
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to send via Web3Forms");
      }
      console.log('Email sent successfully via Web3Forms');
    } else {
      // FormSubmit.co fallback (zero-config, works out-of-the-box!)
      const response = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          "الاسم": leadData.name,
          "البريد الإلكتروني": leadData.email,
          "رقم الجوال": leadData.phone,
          "الخدمة/المجال": leadData.service,
          "الرسالة/التفاصيل": leadData.message,
          "_subject": `طلب استشارة جديد من: ${leadData.name}`,
          "_captcha": "false"
        })
      });
      const result = await response.json();
      if (result.success !== "true" && result.success !== true) {
        throw new Error(result.message || "Failed to send via FormSubmit");
      }
      console.log('Email sent successfully via FormSubmit');
    }
  } catch (err) {
    console.error('Error sending email notification:', err);
  }
};

const rawApi = {
  // --- Audit Logs Service ---
  auditLogs: {
    async getAll() {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async log(action, details) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userEmail = session?.user?.email || 'system@wajd-agency.com';
        await supabase.from('audit_logs').insert([{ user_email: userEmail, action, details }]);
      } catch (err) {
        console.warn('Failed to insert audit log:', err);
      }
    }
  },

  // --- Auth Service ---
  auth: {
    async login(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async logout() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    async getSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    async getProfile(uid) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
      if (error) throw error;
      return data;
    }
  },

  // --- Admins Management ---
  admins: {
    async getAll() {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      rawApi.auditLogs.log('حذف مشرف', `تمت إزالة صلاحية المشرف بالمعرف: ${id}`);
    }
  },

  // --- WhatsApp Templates ---
  whatsappTemplates: {
    async getAll() {
      const { data, error } = await supabase.from('whatsapp_templates').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    async upsert(template) {
      const { data, error } = await supabase.from('whatsapp_templates').upsert(template).select();
      if (error) throw error;
      rawApi.auditLogs.log('تعديل قالب واتساب', `تم حفظ قالب واتساب: ${template.title}`);
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('whatsapp_templates').delete().eq('id', id);
      if (error) throw error;
      rawApi.auditLogs.log('حذف قالب واتساب', `تم حذف قالب واتساب بالمعرف: ${id}`);
    }
  },

  // --- Storage Service ---
  storage: {
    async uploadImage(bucket, file, folder = 'uploads') {
      if (!file) return null;
      
      // Validation: Size limits (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('حجم الملف يجب ألا يتجاوز 2 ميجابايت');
      }
      
      // Validation: Type restrictions
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
        throw new Error('صيغة الملف غير مدعومة. يرجى رفع صور JPG, PNG, WEBP, or SVG');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (error) throw error;

      // Generate public URL
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      rawApi.auditLogs.log('رفع ملف', `تم رفع صورة جديدة إلى Bucket: ${bucket}`);
      return publicUrl;
    },
    async listImages(bucket) {
      const { data, error } = await supabase.storage.from(bucket).list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'desc' }
      });
      if (error) throw error;
      
      return data.map(item => {
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(item.name);
        return {
          ...item,
          url: publicUrl
        };
      });
    },
    async deleteImage(bucket, path) {
      const { data, error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
      rawApi.auditLogs.log('حذف ملف', `تم حذف الملف ${path} من Bucket: ${bucket}`);
      return data;
    }
  },

  // --- Site Settings Service ---
  settings: {
    async get() {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      if (error) throw error;
      return data;
    },
    async update(settingsData) {
      const { data, error } = await supabase.from('site_settings').upsert({ id: 1, ...settingsData }).select().single();
      if (error) throw error;
      rawApi.auditLogs.log('تعديل الإعدادات العامة', 'تحديث بيانات الاتصال أو شبكات التواصل للموقع');
      return data;
    },
    async triggerGlobalCacheReset() {
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('site_settings').update({ updated_at: now }).eq('id', 1).select().single();
      if (error) throw error;
      rawApi.auditLogs.log('إعادة تعيين الكاش العام', 'تم فرض تحديث ذاكرة التخزين المؤقت لجميع الأجهزة والزوار');
      return data;
    }
  },

  // --- Hero Content Service ---
  hero: {
    async get() {
      const { data, error } = await supabase.from('hero_content').select('*').eq('id', 1).maybeSingle();
      if (error) throw error;
      return data;
    },
    async update(heroData) {
      const { data, error } = await supabase.from('hero_content').upsert({ id: 1, ...heroData }).select().single();
      if (error) throw error;
      rawApi.auditLogs.log('تعديل الهيرو', 'تحديث نصوص أو خلفية قسم الهيرو الرئيسي');
      return data;
    }
  },

  // --- Statistics Service ---
  stats: {
    async getAll() {
      const { data, error } = await supabase.from('statistics').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    async upsert(stat) {
      const { data, error } = await supabase.from('statistics').upsert(stat).select();
      if (error) throw error;
      rawApi.auditLogs.log('تحديث الإحصائيات', `إضافة أو تعديل الإحصائية: ${stat.label}`);
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('statistics').delete().eq('id', id);
      if (error) throw error;
      rawApi.auditLogs.log('حذف إحصائية', `حذف إحصائية بالمعرف: ${id}`);
    }
  },

  // --- Testimonials Service ---
  testimonials: {
    async getAll() {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async upsert(testimonial) {
      const { data, error } = await supabase.from('testimonials').upsert(testimonial).select();
      if (error) throw error;
      rawApi.auditLogs.log('تحديث آراء الشركاء', `إضافة أو تعديل رأي الشريك: ${testimonial.name}`);
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      rawApi.auditLogs.log('حذف رأي شريك', `حذف رأي الشريك بالمعرف: ${id}`);
    }
  },

  // --- Portfolio Service ---
  portfolio: {
    async getAll() {
      const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async upsert(project) {
      const { data, error } = await supabase.from('portfolio').upsert(project).select();
      if (error) throw error;
      rawApi.auditLogs.log('تحديث معرض الأعمال', `إضافة أو تعديل دراسة حالة: ${project.name}`);
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('portfolio').delete().eq('id', id);
      if (error) throw error;
      rawApi.auditLogs.log('حذف مشروع', `حذف مشروع بالمعرف: ${id}`);
    }
  },

  // --- FAQ Service ---
  faqs: {
    async getAll() {
      const { data, error } = await supabase.from('faqs').select('*').order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
    async upsert(faq) {
      const { data, error } = await supabase.from('faqs').upsert(faq).select();
      if (error) throw error;
      rawApi.auditLogs.log('تحديث الأسئلة الشائعة', `إضافة أو تعديل السؤال: ${faq.question}`);
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
      rawApi.auditLogs.log('حذف سؤال شائع', `حذف سؤال بالمعرف: ${id}`);
    },
    async reorder(orderedFaqs) {
      const ids = orderedFaqs.map(faq => faq.id);
      const { error } = await supabase.rpc('reorder_faqs', { faq_ids: ids });
      if (error) throw error;
      rawApi.auditLogs.log('إعادة ترتيب الأسئلة الشائعة', 'تحديث أولويات ترتيب ظهور الأسئلة الشائعة');
    }
  },

  // --- SEO Pages Service ---
  seo: {
    async getAll() {
      const { data, error } = await supabase.from('seo_pages').select('*');
      if (error) throw error;
      return data;
    },
    async getForPage(pageName) {
      const { data, error } = await supabase.from('seo_pages').select('*').eq('page', pageName).maybeSingle();
      if (error) throw error;
      return data;
    },
    async upsert(pageData) {
      const { data, error } = await supabase.from('seo_pages').upsert(pageData).select();
      if (error) throw error;
      rawApi.auditLogs.log('تحديث السيو', `تحديث أرشفة الصفحة: ${pageData.page}`);
      return data;
    }
  },

  // --- Leads Service ---
  leads: {
    async getAll(statusFilter = 'all') {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    async updateStatus(id, newStatus) {
      const { data, error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id).select();
      if (error) throw error;
      rawApi.auditLogs.log('تحديث حالة عميل', `تغيير حالة العميل معرف ${id} إلى ${newStatus}`);
      return data;
    },
    async submit(leadData) {
      // Trigger email notification in background immediately (independent of DB success)
      try {
        sendEmailNotification(leadData).catch(err => console.error('Background email notification error:', err));
      } catch (e) {
        console.warn('Failed to trigger email notification:', e);
      }

      const { data, error } = await supabase.from('leads').insert([leadData]).select();
      if (error) throw error;

      return data[0];
    }
  },

  analytics: {
    async logPageView(sessionId, pagePath, referrer, userAgent) {
      const { data, error } = await supabase
        .from('traffic_analytics')
        .insert([{ session_id: sessionId, page_path: pagePath, referrer, user_agent: userAgent }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async updateDuration(recordId, durationSeconds) {
      const clampedSeconds = Math.max(0, Math.min(86400, parseInt(durationSeconds, 10) || 0));
      const { data, error } = await supabase
        .from('traffic_analytics')
        .update({ duration_seconds: clampedSeconds })
        .eq('id', recordId)
        .select();
      if (error) throw error;
      return data;
    },
    async getOverview(days = 30) {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('traffic_analytics')
        .select('id, session_id, page_path, duration_seconds, created_at, updated_at')
        .gte('created_at', startDate);
      if (error) throw error;
      return data;
    }
  },

  scripts: {
    async getAll() {
      const { data, error } = await supabase
        .from('custom_scripts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async getAllActive() {
      const { data, error } = await supabase
        .from('custom_scripts')
        .select('*')
        .eq('active', true);
      if (error) throw error;
      return data;
    },
    async upsert(script) {
      const { data, error } = await supabase
        .from('custom_scripts')
        .upsert(script)
        .select();
      if (error) throw error;
      rawApi.auditLogs.log('تحديث كود التتبع', `إضافة أو تعديل كود تتبع: ${script.name}`);
      return data;
    },
    async delete(id) {
      const { error } = await supabase
        .from('custom_scripts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      rawApi.auditLogs.log('حذف كود التتبع', `تم حذف كود تتبع بالمعرف: ${id}`);
    }
  },

  // --- Preauthorized Admins Service ---
  preauthAdmins: {
    async getAll() {
      const { data, error } = await supabase.from('preauthorized_admins').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async add(email) {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const { data, error } = await supabase.from('preauthorized_admins').insert([{ email, invited_by: userId }]).select();
      if (error) throw error;
      rawApi.auditLogs.log('إضافة تصريح مسؤول', `تم السماح للبريد الإلكتروني: ${email}`);
      return data[0];
    },
    async delete(id, email) {
      const { error } = await supabase.from('preauthorized_admins').delete().eq('id', id);
      if (error) throw error;
      rawApi.auditLogs.log('إزالة تصريح مسؤول', `تم إلغاء الترخيص للبريد الإلكتروني: ${email}`);
    }
  }
};

export const api = {
  auditLogs: wrapService(rawApi.auditLogs),
  auth: wrapService(rawApi.auth),
  admins: wrapService(rawApi.admins),
  whatsappTemplates: wrapService(rawApi.whatsappTemplates),
  storage: wrapService(rawApi.storage),
  settings: wrapService(rawApi.settings),
  hero: wrapService(rawApi.hero),
  stats: wrapService(rawApi.stats),
  testimonials: wrapService(rawApi.testimonials),
  portfolio: wrapService(rawApi.portfolio),
  faqs: wrapService(rawApi.faqs),
  seo: wrapService(rawApi.seo),
  leads: wrapService(rawApi.leads),
  analytics: wrapService(rawApi.analytics),
  scripts: wrapService(rawApi.scripts),
  preauthAdmins: wrapService(rawApi.preauthAdmins),
};
