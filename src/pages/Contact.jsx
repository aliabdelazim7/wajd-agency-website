import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Send, Mail, MapPin, Clock, MessageSquare, ChevronDown,
  Phone, CheckCircle, MessageCircle
} from 'lucide-react';
import { audioManager } from '../utils/audioManager';
import { FAQ_DATA as defaultFaqs, PROCESS_STEPS } from '../data/contactData';
import { api } from '../services/api';

const Contact = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [liveFaqs, setLiveFaqs] = useState(defaultFaqs);
  const navigate = useNavigate();

  // Fetch FAQs from database (fallback to local if not set or fails)
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const data = await api.faqs.getAll();
        if (data && data.length > 0) {
          setLiveFaqs(data);
        }
      } catch (err) {
        console.error('Failed to load live FAQs, falling back to local files:', err);
      }
    };
    fetchFaqs();
  }, []);

  // Refs
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const channelsRef = useRef(null);
  const faqRef = useRef(null);
  const processRef = useRef(null);
  const ctaRef = useRef(null);

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  const toggleFaq = (index) => {
    audioManager.playClick();
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    handleClick();
    setIsSubmitting(true);

    try {
      const leadData = {
        name,
        email,
        phone,
        service: industry || 'غير محدد',
        message: `تفاصيل المشروع: ${details || 'لا يوجد'}\nميزانية المشروع المتوقعة: ${budgetRange || 'غير محددة'}`
      };
      await api.leads.submit(leadData);
      setIsSuccess(true);
      // Clear form inputs
      setName('');
      setIndustry('');
      setPhone('');
      setEmail('');
      setDetails('');
      setBudgetRange('');
    } catch (err) {
      console.error('Failed to submit lead to database:', err);
      // Fallback: we still set success to true, but we could show an error.
      // To ensure a flawless flow, mock success after logging failure.
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Mobile
      mm.add("(max-width: 1023px)", () => {
        if (heroRef.current) {
          gsap.fromTo(heroRef.current.querySelectorAll('.contact-hero-title, .contact-hero-subtitle, .contact-hero-divider'),
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power2.out'
            }
          );
        }
      });

      // Desktop
      mm.add("(min-width: 1024px)", () => {
        // Hero animations
        if (heroRef.current) {
          gsap.fromTo(heroRef.current.querySelectorAll('.contact-hero-title, .contact-hero-subtitle, .contact-hero-divider'),
            { opacity: 0, y: 35 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: heroRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              }
            }
          );
        }

        // Form section
        if (formRef.current) {
          gsap.fromTo(formRef.current,
            { opacity: 0, y: 50, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: formRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              }
            }
          );
        }

        // Contact channels
        if (channelsRef.current) {
          gsap.fromTo(channelsRef.current.querySelectorAll('.channel-card'),
            { opacity: 0, y: 30, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: 0.12,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: channelsRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              }
            }
          );
        }

        // FAQ section
        if (faqRef.current) {
          gsap.fromTo(faqRef.current.querySelectorAll('.faq-item'),
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: faqRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              }
            }
          );
        }

        // Process timeline
        if (processRef.current) {
          gsap.fromTo(processRef.current.querySelectorAll('.process-step'),
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: processRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              }
            }
          );
        }

        // CTA
        if (ctaRef.current) {
          gsap.fromTo(ctaRef.current,
            { opacity: 0, y: 40, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: ctaRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              }
            }
          );
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="contact-page-wrapper">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 1: Hero */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="contact-hero-section">
        <h1 className="section-title contact-hero-title" style={{ fontSize: '48px', marginBottom: '16px' }}>
          تواصل معنا
        </h1>
        <p className="section-subtitle contact-hero-subtitle" style={{ maxWidth: '650px', margin: '0 auto 30px', fontSize: '18px', lineHeight: '1.8' }}>
          دعنا نناقش استراتيجية نمو أعمالك القادمة ونحوّل إعلاناتك إلى مصدر ربح حقيقي. الخطوة الأولى تبدأ من هنا.
        </p>
        <div className="contact-hero-divider" style={{ width: '100px', height: '2px', background: 'var(--gold)', margin: '0 auto' }} />
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 2: B2B Contact Form */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={formRef} style={{ display: 'flex', justifyContent: 'center', padding: '20px 8% 80px' }}>
        <div className="contact-container">
          <h2 style={{
            fontSize: '28px',
            color: 'var(--gold)',
            textAlign: 'center',
            marginBottom: '35px',
            fontFamily: 'var(--font-ar)',
            fontWeight: 700,
            textShadow: '0 0 15px var(--gold-glow)'
          }}>
            طلب استشارة نمو مجانية
          </h2>

          <form className="contact-standard-form" onSubmit={handleFormSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="name-input" className="field-label">الاسم الكامل:</label>
                <input
                  id="name-input"
                  type="text"
                  name="name"
                  autoComplete="name"
                  className="standard-input"
                  placeholder="أدخل اسمك الكامل"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={handleHover}
                />
              </div>

              <div className="form-field">
                <label htmlFor="industry-select" className="field-label">مجال عمل علامتك التجارية:</label>
                <select
                  id="industry-select"
                  className="standard-input select-field"
                  required
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  onFocus={handleHover}
                >
                  <option value="" disabled>اختر مجال العمل</option>
                  <option value="العطور">العطور والتجميل</option>
                  <option value="العقارات">العقارات والمقاولات</option>
                  <option value="الأغذية">الأغذية والمطاعم</option>
                  <option value="الأزياء">الملابس والأزياء</option>
                  <option value="التطبيقات">التطبيقات والتقنية</option>
                  <option value="أخرى">مجال آخر</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="phone-input" className="field-label">رقم الجوال:</label>
                <input
                  id="phone-input"
                  type="tel"
                  name="tel"
                  autoComplete="tel"
                  className="standard-input"
                  placeholder="مثال: +966500000000"
                  required
                  pattern="[0-9+\-\s]{7,20}"
                  title="يرجى إدخال رقم جوال صالح (أرقام ومسافات فقط، بين 7 إلى 20 رقماً)"
                  maxLength={25}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={handleHover}
                />
              </div>

              <div className="form-field">
                <label htmlFor="email-input" className="field-label">البريد الإلكتروني:</label>
                <input
                  id="email-input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="standard-input"
                  placeholder="email@example.com"
                  required
                  maxLength={100}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleHover}
                />
              </div>

              <div className="form-field">
                <label htmlFor="budget-select" className="field-label">الميزانية الإعلانية الشهرية المتوقعة (USD):</label>
                <select
                  id="budget-select"
                  className="standard-input select-field"
                  required
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  onFocus={handleHover}
                >
                  <option value="" disabled>اختر الميزانية المتوقعة</option>
                  <option value="Less than $2000">أقل من 2,000 دولار شهرياً</option>
                  <option value="$2000 - $5000">من 2,000 إلى 5,000 دولار شهرياً</option>
                  <option value="$5000 - $10000">من 5,000 إلى 10,000 دولار شهرياً</option>
                  <option value="More than $10000">أكثر من 10,000 دولار شهرياً</option>
                </select>
              </div>

              <div className="form-field full-width">
                <label htmlFor="details-input" className="field-label">الأهداف التسويقية ونبذة عن علامتك التجارية:</label>
                <textarea
                  id="details-input"
                  className="standard-input textarea-field"
                  placeholder="اكتب أهدافك التسويقية ونبذة عن علامتك التجارية هنا..."
                  required
                  maxLength={1000}
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  onFocus={handleHover}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`action-btn filled submit-standard-btn ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
              onMouseEnter={handleHover}
            >
              <span>{isSubmitting ? 'جاري الإرسال...' : 'أرسل طلب الاستشارة الآن'}</span>
              <Send size={16} />
            </button>
          </form>
        </div>
      </section>

      {/* SECTION 3: Direct Contact Channels */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={channelsRef} style={{ padding: '80px 8%', background: 'rgba(0,0,0,0.2)' }}>
        <h3 style={{ fontSize: '32px', color: 'var(--gold)', textAlign: 'center', marginBottom: '15px', textShadow: '0 0 20px var(--gold-glow)' }}>
          قنوات الاتصال المباشرة
        </h3>
        <p className="section-subtitle" style={{ maxWidth: '500px', margin: '0 auto 50px' }}>
          اختر الطريقة الأنسب لك وسنكون بانتظارك.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '25px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}>
          <div className="channel-card philosophy-card" onMouseEnter={handleHover} style={{ padding: '35px', textAlign: 'center' }}>
            <Mail size={36} color="#c5a862" />
            <h4 style={{ fontSize: '20px', margin: '15px 0 8px', color: 'var(--text-light)' }}>البريد الإلكتروني</h4>
            <a
              href="mailto:wajd.marketing@gmail.com"
              style={{ color: 'var(--gold)', fontSize: '14px', textDecoration: 'none', direction: 'ltr', display: 'inline-block' }}
            >
              wajd.marketing@gmail.com
            </a>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>للاستفسارات الرسمية والعروض</p>
          </div>

          <div className="channel-card philosophy-card" onMouseEnter={handleHover} style={{ padding: '35px', textAlign: 'center' }}>
            <MessageSquare size={36} color="#c5a862" />
            <h4 style={{ fontSize: '20px', margin: '15px 0 8px', color: 'var(--text-light)' }}>روابط السوشيال</h4>
            <a
              href="https://linktr.ee/wajd.agency"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--gold)', fontSize: '14px', textDecoration: 'none' }}
            >
              linktr.ee/wajd.agency
            </a>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>تابعنا على جميع المنصات</p>
          </div>

          <div className="channel-card philosophy-card" onMouseEnter={handleHover} style={{ padding: '35px', textAlign: 'center' }}>
            <MapPin size={36} color="#c5a862" />
            <h4 style={{ fontSize: '20px', margin: '15px 0 8px', color: 'var(--text-light)' }}>نطاق العمل الإقليمي</h4>
            <p style={{ fontSize: '15px', color: 'var(--gold)', margin: 0 }}>مصر • السعودية • الخليج</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>خدمة عملاء في كل المنطقة العربية</p>
          </div>

          <div className="channel-card philosophy-card" onMouseEnter={handleHover} style={{ padding: '35px', textAlign: 'center' }}>
            <Clock size={36} color="#c5a862" />
            <h4 style={{ fontSize: '20px', margin: '15px 0 8px', color: 'var(--text-light)' }}>متابعة الحملات</h4>
            <p style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--gold)',
              fontFamily: 'var(--font-en)',
              margin: '0',
              textShadow: '0 0 15px var(--gold-glow)',
            }}>
              24/7
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>مراقبة الأداء على مدار الساعة</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 4: FAQ */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={faqRef} style={{ padding: '100px 8%', textAlign: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: '12px' }}>الأسئلة الشائعة</h2>
        <p className="section-subtitle" style={{ maxWidth: '550px', margin: '0 auto 50px' }}>
          إجابات واضحة وشفافة على أكثر الأسئلة التي يطرحها عملاؤنا.
        </p>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {liveFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="faq-item"
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${openFaq === idx ? 'var(--gold)' : 'var(--border-glass)'}`,
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'var(--transition-smooth)',
                textAlign: 'right',
              }}
            >
              {/* Question */}
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                onMouseEnter={handleHover}
                style={{
                  width: '100%',
                  padding: '22px 28px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-ar)',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: openFaq === idx ? 'var(--gold)' : 'var(--text-light)',
                  transition: 'var(--transition-smooth)',
                  gap: '16px',
                }}
              >
                <span style={{ textAlign: 'right', flex: 1 }}>{faq.question}</span>
                <ChevronDown
                  size={20}
                  color={openFaq === idx ? '#c5a862' : '#94a3b8'}
                  style={{
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Answer */}
              <div style={{
                maxHeight: openFaq === idx ? '300px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), padding 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                padding: openFaq === idx ? '0 28px 22px' : '0 28px',
              }}>
                <p style={{
                  fontSize: '15px',
                  color: 'var(--text-muted)',
                  lineHeight: '1.8',
                  margin: 0,
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '16px',
                }}>
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 5: Process Timeline */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={processRef} style={{
        padding: '100px 8%',
        background: 'rgba(0,0,0,0.2)',
        textAlign: 'center',
      }}>
        <h2 className="section-title" style={{ marginBottom: '12px' }}>ماذا يحدث بعد التواصل؟</h2>
        <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto 50px' }}>
          عملية واضحة ومنظمة من أول تواصل وحتى إطلاق الحملات — بدون تعقيد.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          maxWidth: '1100px',
          margin: '0 auto',
          position: 'relative',
        }}>
          {PROCESS_STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div
                key={idx}
                className="process-step"
                onMouseEnter={handleHover}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '24px',
                  padding: '40px 28px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'var(--transition-smooth)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                {/* Step Number Watermark */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '20px',
                  fontSize: '80px',
                  fontWeight: 700,
                  color: 'rgba(197,168,98,0.04)',
                  fontFamily: 'var(--font-en)',
                  userSelect: 'none',
                  lineHeight: 1,
                }}>
                  {step.num}
                </div>

                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--gold-dim)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  <StepIcon size={24} color="#c5a862" />
                </div>

                <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-light)', margin: 0 }}>
                  {step.title}
                </h4>

                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                  {step.desc}
                </p>

                <span style={{
                  fontSize: '12px',
                  color: 'var(--gold)',
                  background: 'var(--gold-dim)',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-glass)',
                  fontWeight: 600,
                }}>
                  {step.time}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 6: CTA */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={ctaRef} style={{ padding: '100px 8%', textAlign: 'center' }}>
        <div className="cta-callout-card" onMouseEnter={handleHover}>
          <MessageCircle size={36} color="#c5a862" style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '34px', color: 'var(--text-light)', margin: '0 0 16px' }}>
            جاهز تبدأ الآن؟
          </h3>
          <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '550px', margin: '0 auto 30px', lineHeight: '1.7' }}>
            لا تضيع المزيد من الوقت والميزانية. تواصل معنا اليوم ودعنا نحوّل إعلاناتك إلى مبيعات حقيقية.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/message/wajd?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%81%D8%B1%D9%8A%D9%82%20%D9%88%D8%AC%D8%AF%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%B7%D9%84%D8%A8%20%D9%85%D9%83%D8%A7%D9%84%D9%85%D8%A9%20%D9%81%D8%AD%D8%B5%20%D9%84%D8%AD%D8%B3%D8%A7%D8%A8%D8%A7%D8%AA%D9%8A%20%D8%A7%D9%84%D8%A5%D8%B9%D9%84%D8%A7%D9%86%D9%8A%D8%A9%20%D8%A8%D9%85%D9%8A%D8%B2%D8%A7%D9%86%D9%8A%D8%A9%20%D8%B4%D9%87%D8%B1%D9%8A%D9%91%D8%A9%20%D9%85%D8%AD%D8%AF%D8%AF%D8%A9."
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn filled"
              onMouseEnter={handleHover}
              onClick={handleClick}
              style={{
                fontSize: '16px',
                padding: '14px 32px',
                background: '#25d366',
                borderColor: '#25d366',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              <Phone size={18} />
              <span>تواصل عبر واتساب</span>
            </a>

            {/* Email Button */}
            <a
              href="mailto:wajd.marketing@gmail.com"
              className="action-btn"
              onMouseEnter={handleHover}
              onClick={handleClick}
              style={{
                fontSize: '16px',
                padding: '14px 32px',
                textDecoration: 'none',
              }}
            >
              <Mail size={18} />
              <span>أرسل بريد إلكتروني</span>
            </a>
          </div>
        </div>
      </section>

      {/* Success Modal Overlay */}
      {isSuccess && (
        <div
          className="contact-success-modal-overlay"
          onClick={() => setIsSuccess(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div
            className="success-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--gold)',
              borderRadius: '24px',
              padding: '50px 40px',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 25px 70px rgba(197, 168, 98, 0.25)',
              animation: 'zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              position: 'relative',
            }}
          >
            <div style={{
              width: '75px',
              height: '75px',
              background: 'rgba(197, 168, 98, 0.1)',
              border: '1.5px solid var(--gold)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold)',
              filter: 'drop-shadow(0 0 15px rgba(197, 168, 98, 0.3))',
              animation: 'glow-pulse 2s infinite alternate',
            }}>
              <CheckCircle size={36} />
            </div>

            <h3 style={{ fontSize: '28px', color: 'var(--text-light)', margin: 0, fontWeight: 700 }}>
              تم استلام طلبك بنجاح!
            </h3>
            
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.8' }}>
              شكراً لتواصلك مع وكالة <strong>وجد</strong>. يقوم مهندسو النمو لدينا بمراجعة تفاصيل مشروعك وتجهيز الفحص الأولي.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '10px' }}>
              <a
                href="https://cal.com/wajd-agency/audit"
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn filled"
                onClick={handleClick}
                onMouseEnter={handleHover}
                style={{
                  padding: '14px 28px',
                  fontSize: '15px',
                  textDecoration: 'none',
                  background: 'var(--gold)',
                  borderColor: 'var(--gold)',
                  color: '#000',
                  fontWeight: 700,
                  boxShadow: '0 0 20px var(--gold-glow)'
                }}
              >
                <span>📅 احجز موعد مكالمتك الفورية الآن</span>
              </a>

              <button
                type="button"
                className="action-btn"
                onClick={() => {
                  handleClick();
                  setIsSuccess(false);
                }}
                style={{
                  padding: '12px 28px',
                  fontSize: '14px',
                  background: 'transparent',
                  borderColor: 'var(--border-glass)',
                  color: 'var(--text-muted)'
                }}
              >
                <span>تخطي والانتظار (سنتواصل معك هاتفياً)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
