import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Trophy, TrendingUp, Users, DollarSign, Sparkles, ArrowLeft } from 'lucide-react';
import { audioManager } from '../utils/audioManager';
import { PORTFOLIO_DATA, INDUSTRIES } from '../data/portfolioData';
import { api } from '../services/api';

const getCaseStudyDetails = (id) => {
  const details = {
    owaid: {
      challenge: 'متجر عسل العويد واجه صعوبة في تحسين معدل التحويل مع ارتفاع تكلفة الاكتساب للعميل (CAC) على منصات التواصل الاجتماعي وتشتت الميزانيات الإعلانية.',
      strategy: 'قمنا بإعادة هندسة العروض وبناء قمع تسويقي متكامل يركز على إعادة الاستهداف (Retargeting) وتخصيص رسائل إعلانية موجهة للجمهور الخليجي بناءً على الفئة العمرية والاهتمامات.',
      resultsList: ['زيادة العائد على الاستثمار الإعلاني إلى 2.6x', 'خفض تكلفة الاستحواذ بنسبة 35%', 'مضاعفة عدد الطلبات الشهرية']
    },
    barner: {
      challenge: 'علامة بارنر واجهت تراجعاً في مبيعات المتجر الإلكتروني وضعفاً في تهيئة قمع الشراء (Purchase Funnel) وتفاعل العملاء مع المحتوى.',
      strategy: 'تطبيق قمع شراء مخصص مع تحسين واجهة المتجر لتبسيط الدفع، وإطلاق حملات تركز على الفيديو القصير التفاعلي وصناع المحتوى المؤثرين.',
      resultsList: ['تحقيق عائد إعلاني 2.1x ROAS', 'تحسين معدل إإتمام الشراء بنسبة 45%', 'زيادة متوسط قيمة الطلب (AOV)']
    },
    toyo: {
      challenge: 'تطبيق تويو واجه تحدياً في زيادة عدد الطلبات النشطة وتحفيز المستخدمين الحاليين مع تحسين تكلفة التثبيت (CPI) والتفعيل.',
      strategy: 'بناء حملات إعلانية ذكية تركز على العروض الترويجية الحصرية واستخدام الكود الترويجي مع تكامل كامل لمعرفات التتبع وسيرفر التتبع.',
      resultsList: ['أكثر من 2,500 عملية طلب ناجحة', 'خفض تكلفة الطلب (CPO) بنسبة 40%', 'زيادة معدل تنشيط الحسابات']
    },
    jassar: {
      challenge: 'مجوهرات جسار كانت تحتاج إلى رفع معدل التحويل لمتجرها الإلكتروني وزيادة المبيعات في مواسم الأعياد والمناسبات.',
      strategy: 'استهدفنا شرائح عملاء فائقة الدقة مهتمة بالسلع الفاخرة والمجوهرات، وإطلاق استراتيجية تحسين معدل التحويل (CRO) وتسهيل عملية الدفع.',
      resultsList: ['زيادة معدل التحويل بنسبة +45%', 'تحسين مبيعات المواسم بنسبة 60%', 'زيادة ثقة وتفاعل الزوار']
    },
    flash: {
      challenge: 'تطبيق فلاش واجه تحدي الانتشار السريع واكتساب حصة سوقية في قطاع الخدمات الفورية المزدحم.',
      strategy: 'حملات إعلانية بصرية قوية ومكثفة على منصتي ميتا وسناب شات تستهدف الفئات الشابة مع عروض فورية واضحة.',
      resultsList: ['تحقيق عائد إعلاني 2.4x ROAS', 'زيادة سرعة انتشار العلامة التجارية', 'نمو قياسي في عدد المستخدمين النشطين']
    },
    qanateer: {
      challenge: 'متاجر قناطير كانت تعاني من ضعف متوسط قيمة الطلب (AOV) وارتفاع نسبة سلات التسوق المهجورة.',
      strategy: 'تطبيق آليات البيع المتقاطع والبيع البديل (Upselling & Cross-selling) في صفحة الدفع وتفعيل حملات إعادة استهداف ذكية للسلات المهجورة.',
      resultsList: ['تحقيق عائد إعلاني 2.5x ROAS', 'رفع متوسط قيمة الطلب (AOV) بنسبة 30%', 'استعادة 25% من السلات المهجورة']
    },
    camels: {
      challenge: 'متجر كاملز واجه ضعفاً في الوصول العضوي وتراجع تفاعل الجمهور المستهدف على قنوات التواصل الاجتماعي.',
      strategy: 'التركيز على إنتاج محتوى ترفيهي وتعليمي قصير (Reels & Snap Shows) يبرز هوية العلامة التجارية ويشجع الجمهور على الشراء المباشر.',
      resultsList: ['تحقيق عائد إعلاني 1.8x ROAS', 'نمو التفاعل العضوي بنسبة 150%', 'مضاعفة المبيعات المباشرة من منصة سناب']
    },
    manabit: {
      challenge: 'منابت واجهت صعوبة في التوسع وجلب عملاء جدد لمتجرها المبني على منصة زد مع ارتفاع المنافسة.',
      strategy: 'بناء حملات إعلانية متكاملة تركز على المنتجات الأكثر مبيعاً وتحسين قنوات الاستحواذ بالاعتماد على تحليلات جوجل المتطورة GA4.',
      resultsList: ['مضاعفة المبيعات إلى 2.0x', 'استقطاب 40% عملاء جدد للمتجر', 'تحسين ولاء العملاء وإعادة الشراء']
    }
  };

  return details[id] || {
    challenge: 'واجه العميل صعوبات في تحسين كفاءة الحملات الإعلانية ومعدلات التحويل مع ارتفاع التكلفة وضياع فرص النمو المتاحة.',
    strategy: 'قمنا بإعادة هندسة العروض وقنوات الاستحواذ للحملات الإعلانية مع تكامل كامل لأدوات التتبع وقياس الأداء.',
    resultsList: ['تحسين كفاءة الإنفاق الإعلاني', 'زيادة معدل المبيعات والتحويلات', 'تحسين العائد الكلي على الاستثمار']
  };
};

const Portfolio = () => {
  const [filter, setFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [liveProjects, setLiveProjects] = useState(PORTFOLIO_DATA);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Listen to Escape key to close case study drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch portfolio studies from database
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const dbProjects = await api.portfolio.getAll();
        if (dbProjects && dbProjects.length > 0) {
          const formatted = dbProjects.map(p => {
            let categories = [p.category];
            if (p.category === 'ميتا') categories.push('meta');
            if (p.category === 'سناب') categories.push('snap');
            if (p.category === 'سلة') categories.push('salla');
            if (p.category === 'زد') categories.push('zid');
            if (p.category === 'جوجل') categories.push('google');
            if (p.category === 'تيك توك') categories.push('tiktok');
            if (p.category === 'شوبيفاي') categories.push('shopify');
            
            let metricNum = '';
            let metricLabel = '';
            if (p.results_json && typeof p.results_json === 'object') {
              const keys = Object.keys(p.results_json);
              if (keys.length > 0) {
                metricNum = p.results_json[keys[0]];
                metricLabel = keys[0];
              }
            }

            return {
              id: p.slug || p.id,
              name: p.name,
              categories,
              metricNum,
              metricLabel,
              image: p.image_url,
              desc: p.strategy,
              challenge: p.challenge,
              strategy: p.strategy,
              results_json: p.results_json,
              isDbItem: true
            };
          });
          setLiveProjects(formatted);
        }
      } catch (err) {
        console.error('Error fetching database portfolio items, falling back to local files:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Compute active project details for the drawer
  const activeDetails = selectedProject
    ? selectedProject.isDbItem
      ? {
          challenge: selectedProject.challenge,
          strategy: selectedProject.strategy,
          resultsList: Object.entries(selectedProject.results_json || {}).map(([k, v]) => `${k}: ${v}`)
        }
      : getCaseStudyDetails(selectedProject.id)
    : null;

  // Refs
  const heroRef = useRef(null);
  const horizontalRef = useRef(null);
  const wrapperRef = useRef(null);
  const progressRef = useRef(null);
  const statsRef = useRef(null);
  const industriesRef = useRef(null);
  const ctaRef = useRef(null);
  const counterRefs = useRef([]);

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleFilterClick = (cat) => {
    audioManager.playClick();
    setFilter(cat);
  };

  const filteredItems = filter === 'all'
    ? liveProjects
    : liveProjects.filter(item => item.categories.includes(filter));

  useEffect(() => {
    if (loading) return;

    gsap.registerPlugin(ScrollTrigger);
    let timer;
    const ctx = gsap.context(() => {

      // Hero animations
      if (heroRef.current) {
        gsap.fromTo(heroRef.current.querySelectorAll('.portfolio-hero-title, .portfolio-hero-subtitle, .portfolio-filters'),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        );
      }

      // Horizontal scroll gallery
      const container = horizontalRef.current;
      const wrapper = wrapperRef.current;
      if (container && wrapper) {
        timer = setTimeout(() => {
          const mm = gsap.matchMedia();

          // Desktop breakpoint
          mm.add("(min-width: 769px)", () => {
            const initialScrollWidth = container.scrollWidth;
            const initialViewportWidth = window.innerWidth;

            if (initialScrollWidth > initialViewportWidth) {
              const isRTL = document.documentElement.dir === 'rtl';
              gsap.to(container, {
                x: () => {
                  const distance = container.scrollWidth - window.innerWidth;
                  return isRTL ? distance : -distance;
                },
                ease: 'none',
                scrollTrigger: {
                  trigger: wrapper,
                  start: 'top top',
                  end: () => '+=' + (container.scrollWidth - window.innerWidth),
                  scrub: 1,
                  pin: true,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                  onUpdate: (self) => {
                    if (progressRef.current) {
                      progressRef.current.style.width = `${self.progress * 100}%`;
                    }
                  }
                }
              });
            } else {
              // Reset container transform and progress bar if not scrolling
              gsap.set(container, { x: 0 });
              if (progressRef.current) {
                progressRef.current.style.width = '100%';
              }
            }

            // Animate individual cards on entry
            const cards = container.querySelectorAll('.horizontal-project-card');
            cards.forEach((card, i) => {
              gsap.fromTo(card,
                { opacity: 0, scale: 0.9, y: 30 },
                {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  duration: 0.6,
                  delay: i * 0.08,
                  scrollTrigger: {
                    trigger: wrapper,
                    start: 'top 90%',
                    toggleActions: 'play none none none',
                  }
                }
              );
            });
          });

          // Mobile breakpoint
          mm.add("(max-width: 768px)", () => {
            // Reset transforms
            gsap.set(container, { x: 0 });
            if (progressRef.current) {
              progressRef.current.style.width = '100%';
            }

            // Simple reveal for cards on mobile
            const cards = container.querySelectorAll('.horizontal-project-card');
            cards.forEach((card, i) => {
              gsap.fromTo(card,
                { opacity: 0, scale: 0.95, y: 20 },
                {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  duration: 0.5,
                  delay: i * 0.05,
                  scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                  }
                }
              );
            });
          });
        }, 100);
      }

      // Stats section - counter animations
      if (statsRef.current) {
        gsap.fromTo(statsRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
              onEnter: () => {
                // Animate counters
                const counters = [
                  { target: 8, suffix: '+', idx: 0 },
                  { target: 2.3, suffix: 'x', idx: 1, decimal: true },
                  { target: 120, suffix: 'K+', idx: 2 },
                  { target: 12, suffix: 'M+', idx: 3 },
                ];
                counters.forEach(({ target, suffix, idx, decimal }) => {
                  const el = counterRefs.current[idx];
                  if (el) {
                    gsap.fromTo(el, { innerText: 0 }, {
                      innerText: target,
                      duration: 2,
                      ease: 'power2.out',
                      snap: decimal ? { innerText: 0.1 } : { innerText: 1 },
                      onUpdate: function () {
                        const val = decimal
                          ? parseFloat(el.innerText).toFixed(1)
                          : Math.round(parseFloat(el.innerText));
                        el.innerText = val + suffix;
                      }
                    });
                  }
                });
              }
            }
          }
        );
      }

      // Industries grid
      if (industriesRef.current) {
        gsap.fromTo(industriesRef.current.querySelectorAll('.industry-card'),
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: industriesRef.current,
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

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [loading, filter]);

  return (
    <div className="portfolio-page-wrapper">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 1: Portfolio Hero */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="portfolio-hero-section">
        <h1 className="section-title portfolio-hero-title" style={{ fontSize: '48px', marginBottom: '16px' }}>
          معرض النجاح والأثر
        </h1>
        <p className="section-subtitle portfolio-hero-subtitle" style={{ maxWidth: '700px', margin: '0 auto 40px', fontSize: '18px', lineHeight: '1.8' }}>
          لقطات حقيقية موثقة من لوحات التحكم لمديري الإعلانات ومنصات البيع — نتائج لا تحتاج تجميل، الأرقام تتحدث وحدها.
        </p>

        {/* Filter Buttons */}
        <div className="portfolio-filters" style={{ justifyContent: 'center', marginBottom: '0' }}>
          {[
            { key: 'all', label: 'الكل' },
            { key: 'meta', label: 'ميتا' },
            { key: 'snap', label: 'سناب' },
            { key: 'tiktok', label: 'تيك توك' },
            { key: 'google', label: 'جوجل' },
            { key: 'salla', label: 'سلة' },
            { key: 'zid', label: 'زد' },
            { key: 'shopify', label: 'شوبيفاي' },
          ].map(f => (
            <button
              key={f.key}
              type="button"
              className={`filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => handleFilterClick(f.key)}
              onMouseEnter={handleHover}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 2: Horizontal Scroll Gallery (THE STAR FEATURE) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={wrapperRef} className="horizontal-scroll-wrapper" style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
        <div
          ref={horizontalRef}
          className="horizontal-scroll-container"
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: '35px',
            padding: '60px 8% 100px',
            willChange: 'transform',
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="horizontal-project-card"
              onMouseEnter={handleHover}
            >
              {/* Screenshot Image */}
              <div style={{
                width: '100%',
                height: '280px',
                overflow: 'hidden',
                borderBottom: '1px solid var(--border-glass)',
                background: '#000',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => {
                audioManager.playClick();
                setSelectedProject(item);
              }}>
                <img
                  src={item.image}
                  alt={item.name}
                  data-cursor-view="true"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    transition: 'var(--transition-smooth)',
                    opacity: 0.85,
                  }}
                  className="portfolio-brand-img"
                />
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '80px',
                  background: 'linear-gradient(to top, rgba(15,16,22,0.9), transparent)',
                  pointerEvents: 'none',
                }} />
              </div>

              {/* Card Content */}
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '16px' }}>
                {/* Tags */}
                <div className="portfolio-tag-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {item.categories.map(cat => (
                    <span key={cat} className="portfolio-tag">
                      {cat === 'meta' ? 'ميتا' : 
                       cat === 'snap' ? 'سناب' : 
                       cat === 'salla' ? 'سلة' : 
                       cat === 'zid' ? 'زد' : 
                       cat === 'google' ? 'جوجل' : 
                       cat === 'tiktok' ? 'تيك توك' : 
                       cat === 'shopify' ? 'شوبيفاي' : cat}
                    </span>
                  ))}
                </div>

                {/* Brand Name */}
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-light)', margin: 0 }}>
                  {item.name}
                </h3>

                {/* Metric Box */}
                <div className="impact-metric-box" style={{
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px dashed var(--border-glass)',
                  borderRadius: '14px',
                  padding: '18px',
                  textAlign: 'center',
                }}>
                  <span className="impact-num" style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-en)',
                    color: 'var(--gold)',
                    display: 'block',
                    textShadow: '0 0 20px var(--gold-glow)',
                  }}>
                    {item.metricNum}
                  </span>
                  <span className="impact-lbl" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {item.metricLabel}
                  </span>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  lineHeight: '1.7',
                  margin: 0,
                  flexGrow: 1,
                }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Progress Bar */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '8%',
          right: '8%',
          height: '4px',
          background: 'rgba(197,168,98,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          zIndex: 10,
        }}>
          <div
            ref={progressRef}
            style={{
              height: '100%',
              width: '0%',
              background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
              borderRadius: '4px',
              boxShadow: '0 0 12px var(--gold-glow)',
              transition: 'none',
            }}
          />
        </div>

        {/* Scroll hint label */}
        <div style={{
          position: 'absolute',
          bottom: '45px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          opacity: 0.6,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
        }}>
          <ArrowLeft size={14} />
          <span>مرر للأسفل لتصفح المشاريع</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 3: Results Summary */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={statsRef} style={{ padding: '100px 8%', textAlign: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: '12px' }}>ملخص الإنجازات</h2>
        <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto 50px' }}>
          أرقام حقيقية من نتائج حملاتنا مع عملائنا — لأن الأرقام لا تجامل.
        </p>

        <div className="stats-grid" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="stat-card" onMouseEnter={handleHover} style={{ position: 'relative', overflow: 'hidden' }}>
            <Trophy size={28} color="#c5a862" style={{ marginBottom: '12px' }} />
            <span
              ref={el => counterRefs.current[0] = el}
              className="stat-num"
              style={{ fontSize: '52px' }}
            >
              8+
            </span>
            <span className="stat-label">علامات تجارية تم تطوير أداءها</span>
          </div>

          <div className="stat-card" onMouseEnter={handleHover} style={{ position: 'relative', overflow: 'hidden' }}>
            <TrendingUp size={28} color="#c5a862" style={{ marginBottom: '12px' }} />
            <span
              ref={el => counterRefs.current[1] = el}
              className="stat-num"
              style={{ fontSize: '52px' }}
            >
              2.3x
            </span>
            <span className="stat-label">متوسط العائد الإعلاني ROAS</span>
          </div>

          <div className="stat-card" onMouseEnter={handleHover} style={{ position: 'relative', overflow: 'hidden' }}>
            <Users size={28} color="#c5a862" style={{ marginBottom: '12px' }} />
            <span
              ref={el => counterRefs.current[2] = el}
              className="stat-num"
              style={{ fontSize: '52px' }}
            >
              120K+
            </span>
            <span className="stat-label">عمليات شراء ومبيعات فعلية</span>
          </div>

          <div className="stat-card" onMouseEnter={handleHover} style={{ position: 'relative', overflow: 'hidden' }}>
            <DollarSign size={28} color="#c5a862" style={{ marginBottom: '12px' }} />
            <span
              ref={el => counterRefs.current[3] = el}
              className="stat-num"
              style={{ fontSize: '52px' }}
            >
              $12M+
            </span>
            <span className="stat-label">ميزانيات إعلانية تمت إدارتها بنجاح</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 4: Industries Served */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={industriesRef} style={{
        padding: '100px 8%',
        background: 'rgba(0,0,0,0.2)',
        textAlign: 'center',
      }}>
        <h2 className="section-title" style={{ marginBottom: '12px' }}>القطاعات التي خدمناها</h2>
        <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto 50px' }}>
          خبرة متراكمة في قطاعات متنوعة — نفهم طبيعة كل سوق ونصنع له استراتيجية مخصصة.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '25px',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {INDUSTRIES.map((industry, idx) => {
            const IconComp = industry.icon;
            return (
              <div
                key={idx}
                className="industry-card"
                onMouseEnter={handleHover}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '20px',
                  padding: '35px 20px',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'var(--transition-smooth)',
                  cursor: 'default',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <IconComp size={32} color="#c5a862" />
                <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-light)', margin: 0 }}>
                  {industry.name}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                  {industry.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SECTION 5: CTA */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={ctaRef} style={{ padding: '100px 8%', textAlign: 'center' }}>
        <div className="cta-callout-card" onMouseEnter={handleHover}>
          <Sparkles size={36} color="#c5a862" style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '34px', color: 'var(--text-light)', margin: '0 0 16px' }}>
            هل أنت مستعد لتكون القصة القادمة؟
          </h3>
          <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '550px', margin: '0 auto 30px', lineHeight: '1.7' }}>
            انضم لمعرض نجاحات وجد واجعل علامتك التجارية التالية في قائمة الإنجازات. دعنا نبني استراتيجية نمو تناسب أهدافك.
          </p>
          <button
            type="button"
            className="action-btn filled"
            onClick={() => {
              audioManager.playClick();
              navigate('/contact');
            }}
            onMouseEnter={handleHover}
            style={{ margin: '0 auto', fontSize: '18px', padding: '14px 40px' }}
          >
            <span>تواصل معنا الآن</span>
          </button>
        </div>
      </section>

      {/* Case Study Slide-over Drawer */}
      {selectedProject && (
        <div 
          className="drawer-overlay"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setSelectedProject(null)}
              aria-label="إغلاق دراسة الحالة"
            >
              &times;
            </button>

            <div className="drawer-header">
              <span className="drawer-tag">دراسة حالة (Case Study)</span>
              <h2>{selectedProject.name}</h2>
              <div className="drawer-main-metric">
                <span className="metric-number">{selectedProject.metricNum}</span>
                <span className="metric-label">{selectedProject.metricLabel}</span>
              </div>
            </div>

            <div className="drawer-body-sections">
              <div className="drawer-section">
                <h3>🚨 التحدي (The Challenge)</h3>
                <p>{activeDetails?.challenge}</p>
              </div>

              <div className="drawer-section">
                <h3>💡 الاستراتيجية والأثر (Wajd Strategy)</h3>
                <p>{activeDetails?.strategy}</p>
              </div>

              <div className="drawer-section">
                <h3>🏆 الإنجازات المحققة (Achievements)</h3>
                <ul className="drawer-achievements-list">
                  {activeDetails?.resultsList.map((res, i) => (
                    <li key={`ach-${i}`}>{res}</li>
                  ))}
                </ul>
              </div>

              <div className="drawer-section">
                <h3>📊 لقطة موثقة للأداء (Performance Proof)</h3>
                <div className="drawer-image-card">
                  <img
                    src={selectedProject.image}
                    alt={`نتائج حملة ${selectedProject.name}`}
                    className="drawer-proof-img"
                  />
                </div>
              </div>
            </div>
            
            <div className="drawer-footer" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px 20px',
              borderTop: '1px solid var(--border-glass)',
              background: 'rgba(0, 0, 0, 0.4)',
              textAlign: 'center',
              borderRadius: '0 0 24px 24px'
            }}>
              <h4 style={{ fontSize: '18px', color: 'var(--text-light)', margin: 0, fontWeight: 600 }}>
                هل تريد تحقيق عائد إعلاني (ROAS) مشابه لـ {selectedProject.name}؟
              </h4>
              <button
                type="button"
                className="action-btn filled drawer-cta-btn"
                onMouseEnter={handleHover}
                onClick={() => {
                  audioManager.playClick();
                  setSelectedProject(null);
                  navigate('/contact');
                }}
                style={{
                  padding: '14px 40px',
                  fontSize: '16px',
                  boxShadow: '0 0 20px var(--gold-glow)'
                }}
              >
                <span>احصل على استراتيجية نمو خاصة بك 🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
