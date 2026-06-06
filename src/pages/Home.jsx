import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RoiSimulator from '../components/RoiSimulator';
import ThreeDModel from '../components/ThreeDModel';
import {
  ArrowDown,
  Star,
  Quote,
  Sparkles,
} from 'lucide-react';
import { audioManager } from '../utils/audioManager';
import {
  statsData,
  whyCards,
  roadmapSteps,
  platformsData,
  testimonials,
} from '../data/homeData';

const Home = () => {
  const navigate = useNavigate();

  // Refs for GSAP animations
  const heroRef = useRef(null);
  const marqueeRef = useRef(null);
  const statsRef = useRef(null);
  const whyRef = useRef(null);
  const roadmapRef = useRef(null);
  const platformsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  // Counter refs for animated statistics
  const counterRefs = useRef([]);
  const roadmapPanelRef = useRef(null);

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleStartClick = () => {
    audioManager.playClick();
    navigate('/contact');
  };

  // GSAP Animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // --- Hero Section Animation ---
      if (heroRef.current) {
        const heroTl = gsap.timeline({ delay: 0.3 });
        heroTl
          .from('.hero-text-logo-3d', {
            opacity: 0,
            scale: 0.5,
            duration: 1,
            ease: 'back.out(1.7)',
          })
          .from('.hero-tagline', {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power3.out',
          }, '-=0.4')
          .from('.hero-description', {
            opacity: 0,
            y: 30,
            duration: 0.7,
            ease: 'power3.out',
          }, '-=0.3')
          .from('.hero-ctas', {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power3.out',
          }, '-=0.2')
          .from('.hero-3d-side', {
            opacity: 0,
            x: -60,
            duration: 1,
            ease: 'power3.out',
          }, '-=0.8');
      }

      // --- Stats Counter Animation ---
      if (statsRef.current) {
        statsData.forEach((stat, i) => {
          const counterEl = counterRefs.current[i];
          if (!counterEl) return;

          const obj = { val: 0 };
          const decimals = stat.decimals || 0;

          gsap.to(obj, {
            val: stat.value,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              once: true,
            },
            onUpdate: () => {
              const formatted = decimals > 0 ? obj.val.toFixed(decimals) : Math.round(obj.val);
              counterEl.textContent = `${stat.prefix}${formatted}${stat.suffix}`;
            },
          });
        });

        gsap.from('.stat-card', {
          opacity: 0,
          y: 50,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            once: true,
          },
        });
      }

      // --- Why Wajd Cards Animation ---
      if (whyRef.current) {
        gsap.from('.why-card', {
          opacity: 0,
          y: 60,
          stagger: 0.12,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: whyRef.current,
            start: 'top 75%',
            once: true,
          },
        });
      }

      // --- Roadmap Pinned Scroll Section ---
      if (roadmapRef.current && roadmapPanelRef.current) {
        const steps = roadmapPanelRef.current.querySelectorAll('.roadmap-step-pinned');
        const mm = gsap.matchMedia();

        // Desktop breakpoint
        mm.add("(min-width: 769px)", () => {
          gsap.set(steps, { opacity: 0, y: 50 });

          const roadmapTl = gsap.timeline({
            scrollTrigger: {
              trigger: roadmapRef.current,
              start: 'top top',
              end: `+=${steps.length * 600}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
            },
          });

          steps.forEach((step, i) => {
            roadmapTl.to(step, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power2.out',
            }, i * 1.2);

            // Fade out previous step (except last)
            if (i < steps.length - 1) {
              roadmapTl.to(step, {
                opacity: 0.15,
                y: -30,
                duration: 0.8,
                ease: 'power2.in',
              }, (i * 1.2) + 0.8);
            }
          });
        });

        // Mobile breakpoint
        mm.add("(max-width: 768px)", () => {
          steps.forEach((step) => {
            gsap.fromTo(step,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: step,
                  start: 'top 85%',
                  toggleActions: 'play none none none',
                }
              }
            );
          });
        });
      }

      // --- Platforms Grid Animation ---
      if (platformsRef.current) {
        gsap.from('.platform-card', {
          opacity: 0,
          scale: 0.85,
          stagger: 0.1,
          duration: 0.6,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: platformsRef.current,
            start: 'top 75%',
            once: true,
          },
        });
      }

      // --- Testimonials Animation ---
      if (testimonialsRef.current) {
        gsap.from('.testimonial-card', {
          opacity: 0,
          y: 50,
          stagger: 0.2,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 80%',
            once: true,
          },
        });
      }

      // --- Final CTA Animation ---
      if (ctaRef.current) {
        gsap.from('.cta-callout-card', {
          opacity: 0,
          scale: 0.9,
          y: 40,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            once: true,
          },
        });
      }
    });

    // Cleanup
    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="home-page-wrapper">
      {/* ============================================= */}
      {/* SECTION 1: Hero - Split Screen with 3D Model  */}
      {/* ============================================= */}
      <section
        ref={heroRef}
        className="hero-section"
        id="home"
      >
        <div className="hero-split-grid">
          {/* Right: Copywriting text */}
          <div className="hero-text-side">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>وجد لـ هندسة النمو</span>
            </div>
            <div className="hero-text-logo-3d">وجد</div>
            <h1 className="hero-tagline">
              نُوجِد الأثر الرقمي الذي يتحول إلى <span>مبيعات</span>
            </h1>
            <p className="hero-description">
              نصنع الأثر المالي لحملاتك الإعلانية. نحن لا نبيع إعجابات أو نطلق وعوداً عشوائية. نحن شريكك التقني والاستراتيجي في تصميم مسارات شراء ذكية تحقق أعلى عائد إعلاني (ROAS) قابل للتوسع والقياس.
            </p>
            <div className="hero-ctas">
              <a
                href="#simulator-anchor"
                className="action-btn filled"
                onClick={(e) => {
                  e.preventDefault();
                  audioManager.playClick();
                  document
                    .getElementById('simulator-anchor')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                onMouseEnter={handleHover}
              >
                <span>مفاعل الأثر التسويقي 🎛️</span>
              </a>
              <button
                type="button"
                className="action-btn"
                onClick={() => {
                  audioManager.playClick();
                  navigate('/about');
                }}
                onMouseEnter={handleHover}
              >
                <span>اكتشف فلسفتنا</span>
                <ArrowDown size={14} />
              </button>
            </div>
          </div>

          {/* Left: 3D Torus Knot Model with floating badges */}
          <div className="hero-3d-side" onMouseEnter={handleHover}>
            <ThreeDModel />
            <div className="floating-badge badge-1">
              <div className="badge-glow" />
              <span className="badge-title">+320%</span>
              <span className="badge-desc">متوسط العائد ROAS</span>
            </div>
            <div className="floating-badge badge-2">
              <div className="badge-glow" />
              <span className="badge-title">بيانات حيّة 📊</span>
              <span className="badge-desc">مراقبة 24/7 للأداء</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BRAND TRUST BAR ─── */}
      <section className="brand-trust-bar">
        <span className="trust-bar-title">شركاء النجاح والأثر المالي:</span>
        <div className="trust-logos-wrapper">
          <span className="trust-logo">تويو</span>
          <span className="trust-logo">العويد</span>
          <span className="trust-logo">بارنر</span>
          <span className="trust-logo">منابت</span>
          <span className="trust-logo">جسار</span>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 2: Scrolling Marquee (Infinite Loop)  */}
      {/* ============================================= */}
      <section ref={marqueeRef} className="marquee-section">
        <div className="marquee-track">
          <div className="marquee-content">
            <span>إعلانات ممولة</span>
            <span className="marquee-dot">•</span>
            <span>استراتيجيات نمو</span>
            <span className="marquee-dot">•</span>
            <span>تحليل بيانات</span>
            <span className="marquee-dot">•</span>
            <span>هندسة عروض</span>
            <span className="marquee-dot">•</span>
            <span>تسويق أداء</span>
            <span className="marquee-dot">•</span>
            <span>بناء هوية رقمية</span>
            <span className="marquee-dot">•</span>
            <span>إعلانات ممولة</span>
            <span className="marquee-dot">•</span>
            <span>استراتيجيات نمو</span>
            <span className="marquee-dot">•</span>
            <span>تحليل بيانات</span>
            <span className="marquee-dot">•</span>
            <span>هندسة عروض</span>
            <span className="marquee-dot">•</span>
            <span>تسويق أداء</span>
            <span className="marquee-dot">•</span>
            <span>بناء هوية رقمية</span>
            <span className="marquee-dot">•</span>
          </div>
          <div className="marquee-content" aria-hidden="true">
            <span>إعلانات ممولة</span>
            <span className="marquee-dot">•</span>
            <span>استراتيجيات نمو</span>
            <span className="marquee-dot">•</span>
            <span>تحليل بيانات</span>
            <span className="marquee-dot">•</span>
            <span>هندسة عروض</span>
            <span className="marquee-dot">•</span>
            <span>تسويق أداء</span>
            <span className="marquee-dot">•</span>
            <span>بناء هوية رقمية</span>
            <span className="marquee-dot">•</span>
            <span>إعلانات ممولة</span>
            <span className="marquee-dot">•</span>
            <span>استراتيجيات نمو</span>
            <span className="marquee-dot">•</span>
            <span>تحليل بيانات</span>
            <span className="marquee-dot">•</span>
            <span>هندسة عروض</span>
            <span className="marquee-dot">•</span>
            <span>تسويق أداء</span>
            <span className="marquee-dot">•</span>
            <span>بناء هوية رقمية</span>
            <span className="marquee-dot">•</span>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 3: Statistics with Counter Animation   */}
      {/* ============================================= */}
      <section ref={statsRef} className="home-section-block stats-section">
        <h2 className="section-title">وجد بالأرقام</h2>
        <p className="section-subtitle">
          لأن لغة الأرقام هي الوحيدة التي لا تكذب.
        </p>

        <div className="stats-grid">
          {statsData.map((stat, i) => (
            <div className="stat-card" key={i} onMouseEnter={handleHover}>
              <span
                className="stat-num"
                ref={(el) => (counterRefs.current[i] = el)}
              >
                {stat.prefix}0{stat.suffix}
              </span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 4: Why Wajd? (Value Proposition)      */}
      {/* ============================================= */}
      <section ref={whyRef} className="home-section-block why-section">
        <h2 className="section-title">لماذا وجد؟</h2>
        <p className="section-subtitle">
          لأننا لا نُسوّق فحسب — بل نُهندس نتائج مبيعات حقيقية بمنهجية علمية
          مبنية على البيانات.
        </p>

        <div className="why-grid">
          {whyCards.map((card, i) => {
            const IconComponent = card.icon;
            return (
              <div className="why-card" key={i} onMouseEnter={handleHover}>
                <div className="why-card-icon">
                  <IconComponent size={36} />
                </div>
                <h3 className="why-card-title">{card.title}</h3>
                <p className="why-card-desc">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 5: How We Work (Pinned Scroll)        */}
      {/* ============================================= */}
      <section ref={roadmapRef} className="home-section-block roadmap-pinned-section">
        <div className="roadmap-pinned-header">
          <h2 className="section-title">كيف نُوجِد الأثر؟</h2>
          <p className="section-subtitle">
            من الفحص الأولي وحتى تحقيق وتوسيع الأرباح — أربع مراحل مدروسة
            بعناية.
          </p>
        </div>

        <div className="roadmap-pinned-panel" ref={roadmapPanelRef}>
          {roadmapSteps.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <div className="roadmap-step-pinned" key={i} onMouseEnter={handleHover}>
                <div className="step-pinned-num">{step.num}</div>
                <div className="step-pinned-content">
                  <div className="step-pinned-icon">
                    <StepIcon size={28} />
                  </div>
                  <h3 className="step-pinned-title">{step.title}</h3>
                  <p className="step-pinned-desc">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 6: Platforms We Master                 */}
      {/* ============================================= */}
      <section ref={platformsRef} className="home-section-block platforms-section">
        <h2 className="section-title">المنصات التي نتقنها</h2>
        <p className="section-subtitle">
          نُدير حملاتك على أهم المنصات الرقمية بخبرة واحترافية تضمن أعلى عائد
          لاستثمارك.
        </p>

        <div className="platforms-grid">
          {platformsData.map((platform, i) => (
            <div className="platform-card" key={i} onMouseEnter={handleHover}>
              <div className="platform-name">{platform.name}</div>
              <div className="platform-subtitle">{platform.subtitle}</div>
              <p className="platform-desc">{platform.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 7: ROI Simulator                       */}
      {/* ============================================= */}
      <section className="home-section-block" id="simulator-anchor">
        <RoiSimulator />
      </section>

      {/* ============================================= */}
      {/* SECTION 8: Client Testimonials / Trust         */}
      {/* ============================================= */}
      <section ref={testimonialsRef} className="home-section-block testimonials-section">
        <h2 className="section-title">شركاء النجاح يتحدثون</h2>
        <p className="section-subtitle">
          أصحاب أعمال حقيقيون يشاركون تجربتهم مع وجد.
        </p>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, i) => (
            <div className="testimonial-card" key={i} onMouseEnter={handleHover}>
              <div className="testimonial-quote-icon">
                <Quote size={32} />
              </div>
              <p className="testimonial-text">{testimonial.quote}</p>
              <div className="testimonial-stars">
                {[...Array(5)].map((_, si) => (
                  <Star key={si} size={16} fill="currentColor" />
                ))}
              </div>
              <div className="testimonial-author">
                <span className="testimonial-name">{testimonial.name}</span>
                <span className="testimonial-company">
                  {testimonial.company}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================= */}
      {/* SECTION 9: Final CTA                           */}
      {/* ============================================= */}
      <section
        ref={ctaRef}
        className="home-section-block cta-callout-block"
      >
        <div className="cta-callout-card" onMouseEnter={handleHover}>
          <h3>جاهز لتحويل إعلاناتك إلى أصول مبيعات حقيقية؟</h3>
          <p>
            توقف عن هدر ميزانيتك في حملات تفاعل وهمية. دعنا نضع لك استراتيجية
            الأثر الفعلي التي تحوّل كل ريال إعلاني إلى عائد مبيعات ملموس.
          </p>
          <button
            type="button"
            className="action-btn filled"
            onClick={handleStartClick}
            onMouseEnter={handleHover}
            style={{ margin: '24px auto 0' }}
          >
            <span>ابدأ فحص حسابك الآن</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
