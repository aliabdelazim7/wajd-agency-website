import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Megaphone,
  Layers,
  Globe,
  LineChart,
  Cpu,
  ShieldCheck,
  Sparkles,
  Eye,
  Handshake,
  Heart,
  Star,
  BookOpen,
  Trophy,
  ArrowLeft,
  Server,
  Database,
  BarChart3,
  ShoppingCart,
  MousePointerClick,
  MonitorDot,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react';
import { audioManager } from '../utils/audioManager';

const About = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const philosophyRef = useRef(null);
  const differenceRef = useRef(null);
  const servicesRef = useRef(null);
  const techRef = useRef(null);
  const valuesRef = useRef(null);
  const ctaRef = useRef(null);

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  useEffect(() => {
    const perfMode = true;
    if (perfMode || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('[Accessibility/Performance] Disabling GSAP animations.');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Mobile Viewports (< 1024px)
      mm.add("(max-width: 1023px)", () => {
        // Hero animations (run immediately on load, no ScrollTrigger)
        gsap.fromTo(
          '.about-hero__title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );
        gsap.fromTo(
          '.about-hero__subtitle',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: 'power2.out' }
        );
        gsap.fromTo(
          '.about-hero__line',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, delay: 0.3, ease: 'power2.out' }
        );
        gsap.fromTo(
          '.about-hero__intro',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.4, ease: 'power2.out' }
        );
      });

      // Desktop Viewports (>= 1024px)
      mm.add("(min-width: 1024px)", () => {
        // Hero animations
        gsap.fromTo(
          '.about-hero__title',
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' }
        );
        gsap.fromTo(
          '.about-hero__subtitle',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' }
        );
        gsap.fromTo(
          '.about-hero__line',
          { scaleX: 0 },
          { scaleX: 1, duration: 1.2, delay: 0.5, ease: 'power2.out' }
        );
        gsap.fromTo(
          '.about-hero__intro',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, delay: 0.7, ease: 'power3.out' }
        );

        // Story section
        gsap.fromTo(
          '.story-text',
          { opacity: 0, x: 80 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: storyRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
        gsap.fromTo(
          '.about-story__visual',
          { opacity: 0, x: -80 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: storyRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Philosophy cards
        gsap.fromTo(
          '.philosophy-card',
          { opacity: 0, y: 60, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: philosophyRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Difference cards
        gsap.fromTo(
          '.comparison-card',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: differenceRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Services cards
        gsap.fromTo(
          '.service-card',
          { opacity: 0, y: 50, rotateX: 8 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: servicesRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Tech items
        gsap.fromTo(
          '.about-tech__item',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: techRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Values cards
        gsap.fromTo(
          '.value-card',
          { opacity: 0, y: 50, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: valuesRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // CTA section
        gsap.fromTo(
          '.about-cta__inner',
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Section title reveals
      gsap.utils.toArray('.about-section__title').forEach((title) => {
        gsap.fromTo(
          title,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: title,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      gsap.utils.toArray('.about-section__subtitle').forEach((sub) => {
        gsap.fromTo(
          sub,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sub,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Recalculate ScrollTrigger offsets after layout renders
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);
    }, pageRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  const philosophyPillars = [
    {
      word: 'الأثر',
      english: 'Impact',
      icon: <Sparkles size={36} />,
      desc: 'نقيس نجاح كل حملة بالمبيعات الحقيقية والعائد المالي الفعلي، وليس بالإعجابات أو التفاعل الوهمي. كل ريال يُنفق يجب أن يعود مضاعفاً.',
    },
    {
      word: 'الشفافية',
      english: 'Transparency',
      icon: <Eye size={36} />,
      desc: 'نشارك لوحات بيانات حيّة مع كل عميل. لا بيانات مخفية ولا تقارير مُزيّنة. ترى ما نراه — الأرقام الحقيقية كما هي بدون فلترة.',
    },
    {
      word: 'الشراكة',
      english: 'Partnership',
      icon: <Handshake size={36} />,
      desc: 'لسنا مزوّد خدمات عادي. نحن شريك نموّك الاستراتيجي. ننجح معاً ونتحمل المسؤولية معاً. نعامل مشروعك كأنه مشروعنا.',
    },
  ];

  const comparisonData = [
    {
      traditional: 'التركيز على الإعجابات والمتابعين',
      wajd: 'التركيز على المبيعات والعائد الإعلاني (ROAS)',
    },
    {
      traditional: 'تقارير شهرية تقليدية فقط',
      wajd: 'لوحة بيانات حيّة يمكنك الوصول إليها على مدار الساعة',
    },
    {
      traditional: 'حملات عامة نمطية لكل الأنشطة',
      wajd: 'مسارات شراء مخصصة (Custom Funnels) لكل نشاط تجاري',
    },
    {
      traditional: 'إخفاء النتائج السيئة والتبريرات',
      wajd: 'شفافية مطلقة في كل شيء — حتى الأخطاء',
    },
    {
      traditional: 'تركيب بكسل بسيط وتجاهل التتبع',
      wajd: 'تكاملات تقنية متقدمة (API Conversions, Server-Side Tracking)',
    },
  ];

  const servicesData = [
    {
      icon: <Megaphone size={28} />,
      title: 'الحملات الإعلانية الممولة',
      platforms: 'Meta • Snapchat • TikTok • Google',
      desc: 'إطلاق وإدارة حملات ممولة بمعدلات عائد مرتفعة ومحسوبة على منصات التواصل ومحركات البحث لرفع المبيعات الفعلية وتوسيع قاعدة العملاء.',
    },
    {
      icon: <Layers size={28} />,
      title: 'استراتيجيات التسويق والنمو',
      platforms: 'Funnel Setup • Offer Engineering',
      desc: 'تخطيط وتأسيس مسار العميل الشرائي مع هندسة عروض لا يمكن لجمهورك المستهدف رفضها لرفع معدل التحويل وزيادة تكرار الطلبات.',
    },
    {
      icon: <Globe size={28} />,
      title: 'بناء وإدارة الهوية الرقمية',
      platforms: 'Content Strategy • Brand Voice',
      desc: 'إنتاج محتوى استراتيجي يخدم أهداف المبيعات ويقوّي حضورك الرقمي في أسواق الخليج والشرق الأوسط بقوة وتناسق وهوية بصرية مميزة.',
    },
    {
      icon: <LineChart size={28} />,
      title: 'تحليل البيانات والأداء',
      platforms: 'GA4 • Data Studio • Looker',
      desc: 'قراءة مؤشرات جوجل اناليتكس وتحليل المبيعات لتحديد مكامن الخلل ومعالجتها لرفع العائد باستمرار بالاعتماد على الأرقام لا التخمين.',
    },
    {
      icon: <Cpu size={28} />,
      title: 'التكاملات التقنية',
      platforms: 'Pixel • API Conversions • Server-Side',
      desc: 'إعداد وربط بكسل المنصات الإعلانية بأحدث التقنيات لضمان دقة التتبع ورفع جودة استهداف الجماهير وتقليل تكلفة الاكتساب.',
    },
    {
      icon: <ShieldCheck size={28} />,
      title: 'حماية الأصول الرقمية',
      platforms: 'Account Security • Access Management',
      desc: 'إدارة حساباتك وصلاحيات الوصول من خلال حسابات أعمال رسمية ومؤمنة للوكالة لضمان أمان أصولك الرقمية وحمايتها من أي تهديد.',
    },
  ];

  const techCapabilities = [
    {
      icon: <Server size={28} />,
      title: 'API Conversions',
      subtitle: 'Meta CAPI • Snap CAPI',
      desc: 'ربط خوادم متجرك مباشرة مع خوادم المنصات الإعلانية لتفادي خسارة بيانات التتبع بسبب حجب المتصفحات وتحديثات الخصوصية.',
    },
    {
      icon: <MonitorDot size={28} />,
      title: 'التتبع من جانب الخادم',
      subtitle: 'Server-Side Tracking',
      desc: 'تقنية تتبع متقدمة تعمل من جانب الخادم لضمان دقة عالية في رصد سلوك المستخدمين ومعدلات التحويل دون الاعتماد على ملفات تعريف الارتباط.',
    },
    {
      icon: <BarChart3 size={28} />,
      title: 'Google Analytics 4',
      subtitle: 'إعداد وتهيئة متقدمة',
      desc: 'تركيب وإعداد GA4 مع أحداث مخصصة لتتبع كل خطوة في رحلة العميل من الزيارة الأولى وحتى إتمام عملية الشراء.',
    },
    {
      icon: <ShoppingCart size={28} />,
      title: 'منصات التجارة الإلكترونية',
      subtitle: 'سلة • زد • شوبيفاي',
      desc: 'تكامل كامل مع أشهر منصات التجارة الإلكترونية في الخليج العربي مع ربط المبيعات ببيانات الحملات الإعلانية لقياس العائد الحقيقي.',
    },
    {
      icon: <MousePointerClick size={28} />,
      title: 'تتبع الأحداث المخصصة',
      subtitle: 'Custom Event Tracking',
      desc: 'إنشاء وتتبع أحداث مخصصة لكل نشاط تجاري مثل إضافة إلى السلة، بدء الدفع، إتمام الشراء، والاتصال الهاتفي.',
    },
    {
      icon: <Database size={28} />,
      title: 'لوحات البيانات المرئية',
      subtitle: 'Data Visualization Dashboards',
      desc: 'بناء لوحات بيانات تفاعلية مخصصة تعرض مؤشرات الأداء الرئيسية في الوقت الحقيقي بتصميم واضح يسهّل اتخاذ القرارات.',
    },
  ];

  const coreValues = [
    {
      icon: <Heart size={32} />,
      title: 'الصدق',
      desc: 'نقول الحقيقة حتى لو كانت صعبة. لا نزيّن الأرقام ولا نعطي وعوداً لا نستطيع الوفاء بها. الثقة هي أساس كل شراكة ناجحة.',
    },
    {
      icon: <Star size={32} />,
      title: 'الإتقان',
      desc: 'نعامل كل مشروع وكأنه مشروعنا الخاص. نهتم بأدق التفاصيل من تصميم الإعلان إلى إعداد البكسل ونسعى للكمال في كل خطوة.',
    },
    {
      icon: <BookOpen size={32} />,
      title: 'التعلم المستمر',
      desc: 'نتابع كل جديد في عالم التسويق الرقمي وتحديثات المنصات الإعلانية. فريقنا يتدرب باستمرار لنبقى دائماً في طليعة التقنية.',
    },
    {
      icon: <Trophy size={32} />,
      title: 'النتائج أولاً',
      desc: 'لا نحتفل إلا بنتائج حقيقية. المبيعات والأرباح هي المعيار الوحيد الذي يُرضينا. كل شيء آخر مجرد أرقام على الورق.',
    },
  ];

  return (
    <div className="about-page" ref={pageRef}>
      {/* ================ SECTION 1: PAGE HERO ================ */}
      <section className="about-hero" ref={heroRef}>
        <div className="about-hero__content">
          <h1 className="about-hero__title">من نحن</h1>
          <p className="about-hero__subtitle">
            وكالة وجد للتسويق — شريكك الاستراتيجي في هندسة النمو
          </p>
          <div className="about-hero__line" />
          <p className="about-hero__intro">
            في عالم مليء بالوعود الفارغة والأرقام المُضلّلة، أسسنا وجد لنكون الوكالة التي تقيس النجاح
            بلغة واحدة فقط: <strong>المبيعات والعائد الحقيقي.</strong> نحن لا نبيع أحلاماً — نحن نبني
            مسارات نمو مُثبتة بالبيانات ومدعومة بأحدث التقنيات.
          </p>
        </div>
        <div className="about-hero__scroll-hint">
          <span className="about-hero__scroll-dot" />
        </div>
      </section>

      {/* ================ TRUST BANNER: CLIENT LOGOS ================ */}
      <section className="about-logos-banner" style={{
        padding: '30px 8%',
        background: 'rgba(255,255,255,0.01)',
        borderTop: '1px solid var(--border-glass)',
        borderBottom: '1px solid var(--border-glass)',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <span style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--gold)',
            textAlign: 'center',
            fontWeight: 700,
            opacity: 0.8
          }}>وجد في أرقام وتكاملات شركاء النجاح</span>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap',
            opacity: 0.7
          }}>
            {['العويد للعود', 'بارنر للأثاث', 'تطبيق تويو', 'مجوهرات جسار', 'براند فلاش', 'أغذية قناطير', 'براند كاملز', 'منابت الزراعية'].map((logo, i) => (
              <div 
                key={i} 
                className="logo-item-card"
                onMouseEnter={handleHover}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(0,0,0,0.2)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-light)',
                  cursor: 'default',
                  transition: 'all 0.3s'
                }}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================ SECTION 2: OUR STORY ================ */}
      <section className="about-story" ref={storyRef}>
        <h2 className="about-section__title">قصة وجد</h2>
        <div className="about-story-grid">
          <div className="story-text">
            <h3 className="about-story__heading">
              وُلِدنا من رحم المشكلة
            </h3>
            <p className="about-story__paragraph">
              <strong>وجد</strong> في اللغة العربية تحمل ثلاث معانٍ عميقة:
              <span className="about-story__meaning"> الشغف</span> الذي يدفعنا لتقديم الأفضل،
              <span className="about-story__meaning"> الوجود</span> الذي نمنحه لعلامتك التجارية في
              السوق الرقمي، و<span className="about-story__meaning">إيجاد الحلول</span> التي تحوّل
              التحديات إلى فرص نمو حقيقية.
            </p>
            <p className="about-story__paragraph">
              بدأت القصة عندما شاهدنا عشرات المشاريع الواعدة تهدر ميزانياتها على حملات تسويقية تركّز
              على مقاييس لا تُطعم خبزاً — إعجابات بالآلاف، متابعين بالملايين، ولكن صفر مبيعات
              حقيقية. أصحاب المشاريع يدفعون الأموال ويحصلون على تقارير مليئة بالألوان والرسوم
              البيانية الجميلة، لكن حساباتهم البنكية تحكي قصة مختلفة تماماً.
            </p>
            <p className="about-story__paragraph">
              قررنا أن نبني وكالة مختلفة من الأساس — وكالة تلتزم بمبدأ واحد لا تحيد عنه:
              <strong> كل ريال يُنفق على الإعلان يجب أن يعود مضاعفاً في المبيعات.</strong> هذا
              الالتزام بالعائد الحقيقي (ROI) هو ما يُعرّفنا، وهو ما يجعل شراكتنا مع عملائنا تدوم
              وتنمو.
            </p>
          </div>
          <div className="about-story__visual">
            <div className="about-story__visual-card">
              <div className="about-story__visual-word">وجد</div>
              <div className="about-story__visual-meanings">
                <span>الشغف</span>
                <span>الوجود</span>
                <span>إيجاد الحلول</span>
              </div>
            </div>
            <div className="about-story__visual-glow" />
          </div>
        </div>
      </section>

      {/* ================ SECTION 2.5: SOCIAL PROOF STATS ================ */}
      <section className="about-stats" style={{
        padding: '60px 8%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
          {[
            { value: '15+', label: 'عميل وشركة إقليمية تضع ثقتها فينا' },
            { value: '180+', label: 'حملة إعلانية ممولة تمت إدارتها بكفاءة' },
            { value: '$12M+', label: 'ميزانيات إعلانية مُدارة بمبيعات مضاعفة' },
            { value: '6.4x', label: 'أعلى عائد إعلاني (ROAS) محقق لعملائنا' }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="about-stat-card"
              onMouseEnter={handleHover}
              style={{
                padding: '30px 20px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.3s'
              }}
            >
              <span style={{ fontSize: '36px', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-en)' }}>{stat.value}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ================ SECTION 3: OUR PHILOSOPHY ================ */}
      <section className="about-philosophy" ref={philosophyRef}>
        <h2 className="about-section__title">فلسفتنا في ثلاث كلمات</h2>
        <p className="about-section__subtitle">
          ثلاث ركائز تُشكّل كل قرار نتخذه وكل حملة نُطلقها
        </p>
        <div className="philosophy-grid">
          {philosophyPillars.map((pillar, index) => (
            <div
              key={index}
              className="philosophy-card"
              onMouseEnter={handleHover}
            >
              <div className="about-philosophy__icon">{pillar.icon}</div>
              <h3 className="philosophy-word">{pillar.word}</h3>
              <span className="philosophy-word-en">{pillar.english}</span>
              <p className="philosophy-desc">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================ SECTION 4: WHAT MAKES US DIFFERENT ================ */}
      <section className="about-difference" ref={differenceRef}>
        <h2 className="about-section__title">ما يميزنا عن البقية</h2>
        <p className="about-section__subtitle">
          الفرق بين وكالة تقليدية ووكالة هندسة النمو
        </p>
        <div className="comparison-grid">
          {/* Traditional Side */}
          <div className="comparison-card">
            <h4 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '25px', fontWeight: '700' }}>
              <XCircle size={22} />
              <span>الوكالات التقليدية</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {comparisonData.map((row, index) => (
                <div key={index} className="comparison-item" onMouseEnter={handleHover}>
                  <XCircle size={16} className="comparison-icon" style={{ color: '#ef4444' }} />
                  <span>{row.traditional}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wajd Side */}
          <div className="comparison-card wajd-side">
            <h4 style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '25px', fontWeight: '700' }}>
              <CheckCircle size={22} />
              <span>وكالة وجد</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {comparisonData.map((row, index) => (
                <div key={index} className="comparison-item" onMouseEnter={handleHover}>
                  <Zap size={16} className="comparison-icon" style={{ color: 'var(--gold)' }} />
                  <span>{row.wajd}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================ SECTION 5: OUR SERVICES ================ */}
      <section className="about-services" ref={servicesRef}>
        <h2 className="about-section__title">حلول هندسة النمو</h2>
        <p className="about-section__subtitle">
          الخدمات التي نعتمد عليها لإيصال مبيعات عملائنا لأقصى الحدود
        </p>
        <div className="services-grid">
          {servicesData.map((service, index) => (
            <div
              key={index}
              className="service-card"
              onMouseEnter={handleHover}
            >
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <span className="service-platforms">{service.platforms}</span>
              <p className="service-desc">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================ SECTION 6: TECH STACK ================ */}
      <section className="about-tech" ref={techRef}>
        <h2 className="about-section__title">التكاملات التقنية وحماية البيانات</h2>
        <p className="about-section__subtitle">
          البنية التحتية التقنية التي تضمن دقة البيانات وجودة الاستهداف
        </p>
        <div className="about-tech__grid">
          {techCapabilities.map((tech, index) => (
            <div
              key={index}
              className="about-tech__item"
              onMouseEnter={handleHover}
            >
              <div className="about-tech__icon">{tech.icon}</div>
              <div className="about-tech__info">
                <h4 className="about-tech__title">{tech.title}</h4>
                <span className="about-tech__subtitle">{tech.subtitle}</span>
                <p className="about-tech__desc">{tech.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================ SECTION 7: TEAM VALUES ================ */}
      <section className="about-values" ref={valuesRef}>
        <h2 className="about-section__title">قيمنا الأساسية</h2>
        <p className="about-section__subtitle">
          المبادئ التي نعيشها يومياً وليس فقط نكتبها على الجدران
        </p>
        <div className="values-grid">
          {coreValues.map((value, index) => (
            <div
              key={index}
              className="value-card"
              onMouseEnter={handleHover}
            >
              <div className="value-icon">{value.icon}</div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-desc">{value.desc}</p>
              <div className="about-values__number">{String(index + 1).padStart(2, '0')}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================ SECTION 7.5: TEAM SECTION ================ */}
      <section className="about-team" style={{
        padding: '80px 8%',
        background: 'rgba(0,0,0,0.1)',
        borderTop: '1px solid var(--border-glass)'
      }}>
        <h2 className="about-section__title">فريق هندسة النمو</h2>
        <p className="about-section__subtitle">نخبة من خبراء شراء المساحات الإعلانية، هندسة العروض، وتحليل البيانات الملتزمين بنمو مبيعاتك.</p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '40px auto 0'
        }}>
          {[
            { name: 'علي عبد العظيم', role: 'Founder & Growth Architect', desc: 'مؤسس وجد للتسويق وخبير استراتيجيات النمو وهندسة عروض التجارة الإلكترونية بمعدلات تحويل قياسية.' },
            { name: 'أحمد رسلان', role: 'Media Buying Lead', desc: 'مسؤول إدارة وتوجيه الحملات الإعلانية الضخمة على ميتا، سناب وتيك توك بفعالية وكفاءة إنفاق عالية.' },
            { name: 'سارة المهدي', role: 'Web Integrations & Pixel Expert', desc: 'المتخصصة في التكاملات التقنية المعقدة وربط خوادم المتجر CAPI وتتبع البيانات من جانب السيرفر.' },
            { name: 'كريم الجوهري', role: 'Performance & Data Analyst', desc: 'مسؤول قراءة وتحليل سلوك الزوار وتحسين معدلات التحويل للعملاء لضمان استدامة الأرباح.' }
          ].map((member, i) => (
            <div 
              key={i} 
              className="team-member-card philosophy-card" 
              onMouseEnter={handleHover}
              style={{
                padding: '30px 25px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(197, 168, 98, 0.05)',
                border: '1px solid rgba(197, 168, 98, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                color: 'var(--gold)',
                fontSize: '20px',
                fontWeight: 700
              }}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-light)', margin: 0 }}>{member.name}</h3>
              <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }}>{member.role}</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================ SECTION 8: CTA ================ */}
      <section className="about-cta" ref={ctaRef}>
        <div className="about-cta__inner">
          <h2 className="about-cta__title">مستعد تبدأ رحلة النمو؟</h2>
          <p className="about-cta__desc">
            توقف عن هدر ميزانيتك على حملات بلا عائد. دعنا نفحص حساباتك الإعلانية ونضع لك خطة نمو
            مبنية على البيانات والأرقام — مجاناً.
          </p>
          <button
            type="button"
            className="action-btn filled about-cta__btn"
            onClick={() => {
              handleClick();
              navigate('/contact');
            }}
            onMouseEnter={handleHover}
          >
            <span>ابدأ فحص حسابك الآن</span>
            <ArrowLeft size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
