import { Droplets, UtensilsCrossed, Smartphone, ShoppingBag, Leaf, Wrench } from 'lucide-react';

// Import actual brand screenshots
import owaidImg from '../assets/portfolio/العويد/2.6.png';
import barnerImg from '../assets/portfolio/بارنر/2.1.png';
import toyoImg from '../assets/portfolio/تويو/Nov 24.png';
import jassarImg from '../assets/portfolio/جسار/Screenshot_1.png';
import flashImg from '../assets/portfolio/فلاش/Snap - Dec 24.png';
import qanateerImg from '../assets/portfolio/قناطير/salla Dec 24.png';
import camelsImg from '../assets/portfolio/كاملز/1.8.png';
import manabitImg from '../assets/portfolio/منابت/منابت زد/Screenshot_1.png';

export const PORTFOLIO_DATA = [
  {
    id: 'owaid',
    name: 'براند العويد للعود والعطور',
    categories: ['meta', 'salla'],
    metricNum: '2.6x ROAS',
    metricLabel: 'العائد على الإنفاق الإعلاني',
    image: owaidImg,
    desc: 'إطلاق حملات مخصصة لمتجر سلة مع استهداف دقيق لعشاق العود الفاخر، مما أدى لمضاعفة المبيعات مرتين ونصف.'
  },
  {
    id: 'barner',
    name: 'براند بارنر (Partner)',
    categories: ['meta'],
    metricNum: '2.1x ROAS',
    metricLabel: 'متوسط العائد الإعلاني على ميتا',
    image: barnerImg,
    desc: 'استراتيجية تفصيلية لتحسين مسار الشراء (Conversion Funnel) على فيسبوك وإنستغرام لتقليص هدر الميزانية.'
  },
  {
    id: 'toyo',
    name: 'تطبيق تويو (Toyo App)',
    categories: ['meta', 'salla'],
    metricNum: '2,500+',
    metricLabel: 'عملية تحويل ومبيعات مؤكدة',
    image: toyoImg,
    desc: 'استهداف فئات استهلاكية جغرافية نشطة لتحقيق أقصى عائد بأقل تكلفة للعميل في خدمات التوصيل.'
  },
  {
    id: 'jassar',
    name: 'مؤسسة جسار التجارية',
    categories: ['meta', 'salla'],
    metricNum: '+45%',
    metricLabel: 'نمو في معدل التحويل (Conversion Rate)',
    image: jassarImg,
    desc: 'تحسين تجربة المستخدم وربطها بنظام حملات التوزيع المباشر من ميتا لمتجر سلة.'
  },
  {
    id: 'flash',
    name: 'براند فلاش (Flash)',
    categories: ['meta', 'snap'],
    metricNum: '2.4x ROAS',
    metricLabel: 'معدل العائد الاستثماري العام',
    image: flashImg,
    desc: 'دمج إعلانات سناب شات التفاعلية مع إعلانات إنستغرام لتعزيز الشراء الفوري والسريع.'
  },
  {
    id: 'qanateer',
    name: 'براند قناطير للمنتجات الغذائية',
    categories: ['meta', 'snap', 'salla'],
    metricNum: '2.5x ROAS',
    metricLabel: 'العائد الفعلي على حملات سلة',
    image: qanateerImg,
    desc: 'تفعيل التتبع الدقيق عبر سناب شات وميتا لزيادة متوسط قيمة الطلب (AOV) ورفع أرباح المتجر.'
  },
  {
    id: 'camels',
    name: 'براند كاملز (Camels)',
    categories: ['meta', 'snap'],
    metricNum: '1.8x ROAS',
    metricLabel: 'عائد مبيعات متجر كاملز',
    image: camelsImg,
    desc: 'استراتيجية تركز على مقاطع الفيديو القصيرة (Reels & Snap Shows) الموجهة للشباب لزيادة انتشار العلامة.'
  },
  {
    id: 'manabit',
    name: 'براند منابت الزراعي',
    categories: ['zid'],
    metricNum: '2.0x Sales',
    metricLabel: 'مضاعفة المبيعات على متجر زد',
    image: manabitImg,
    desc: 'تحسين أداء المتجر على منصة زد الزراعية لربطه بحملات مخصصة للمهتمين بالبيئة وتخضير المنازل.'
  }
];

export const INDUSTRIES = [
  { icon: Droplets, name: 'عطور', desc: 'العود والعطور الفاخرة' },
  { icon: UtensilsCrossed, name: 'أغذية', desc: 'المنتجات الغذائية والمشروبات' },
  { icon: Smartphone, name: 'تطبيقات', desc: 'التطبيقات والخدمات الرقمية' },
  { icon: ShoppingBag, name: 'أزياء', desc: 'الملابس والأزياء والإكسسوارات' },
  { icon: Leaf, name: 'زراعة', desc: 'المنتجات الزراعية والبيئية' },
  { icon: Wrench, name: 'خدمات', desc: 'الخدمات المتنوعة والاستشارات' },
];

export const DEFAULT_DB_PROJECTS = [
  {
    name: 'براند العويد للعود والعطور',
    slug: 'owaid-perfume',
    category: 'ميتا',
    challenge: 'كان البراند يعاني من هدر في الميزانية الإعلانية وعدم دقة في استهداف محبي العطور الفاخرة على منصة سلة، مما أدى لانخفاض العائد الإعلاني.',
    strategy: 'إطلاق حملات مخصصة لمتجر سلة مع استهداف دقيق لعشاق العود الفاخر، وهندسة عروض حصرية ومميزة ترفع متوسط قيمة الطلب (AOV).',
    results_json: { 'العائد على الإنفاق الإعلاني (ROAS)': '2.6x' },
    image_url: '/src/assets/portfolio/العويد/2.6.png',
    thumbnail_url: '/src/assets/portfolio/العويد/2.6.png',
    alt_text: 'براند العويد للعود والعطور'
  },
  {
    name: 'براند بارنر (Partner)',
    slug: 'barner-brand',
    category: 'ميتا',
    challenge: 'صعوبة تتبع حركة الزوار وتشتت الحملات الإعلانية على فيسبوك وإنستغرام مما تسبب في ارتفاع تكلفة العميل المحتمل.',
    strategy: 'بناء استراتيجية تفصيلية لتحسين مسار الشراء (Conversion Funnel) وإعادة استهداف الزوار المهتمين بسلة مشتريات متروكة.',
    results_json: { 'متوسط العائد الإعلاني على ميتا': '2.1x' },
    image_url: '/src/assets/portfolio/بارنر/2.1.png',
    thumbnail_url: '/src/assets/portfolio/بارنر/2.1.png',
    alt_text: 'براند بارنر'
  },
  {
    name: 'تطبيق تويو (Toyo App)',
    slug: 'toyo-app',
    category: 'سناب',
    challenge: 'الحاجة لمضاعفة عدد تحميلات التطبيق وعمليات التوصيل الفعلية بتكلفة اكتساب عميل (CAC) منخفضة.',
    strategy: 'استهداف فئات استهلاكية جغرافية نشطة بناءً على سلوكيات الطلب اليومي وتفعيل إعلانات الفيديو القصيرة ذات التأثير الفوري.',
    results_json: { 'عملية تحويل ومبيعات مؤكدة': '2,500+' },
    image_url: '/src/assets/portfolio/تويو/Nov 24.png',
    thumbnail_url: '/src/assets/portfolio/تويو/Nov 24.png',
    alt_text: 'تطبيق تويو'
  },
  {
    name: 'مؤسسة جسار التجارية',
    slug: 'jassar-trading',
    category: 'ميتا',
    challenge: 'معدل تحويل متدني على متجر سلة مع تشتت في قنوات التسويق وغياب التقارير الشفافة.',
    strategy: 'تحسين تجربة مستخدم المتجر وربطها بنظام حملات التوزيع المباشر من ميتا وإطلاق إعلانات كتالوج المنتجات الديناميكية.',
    results_json: { 'نمو في معدل التحويل (Conversion Rate)': '+45%' },
    image_url: '/src/assets/portfolio/جسار/Screenshot_1.png',
    thumbnail_url: '/src/assets/portfolio/جسار/Screenshot_1.png',
    alt_text: 'مؤسسة جسار التجارية'
  },
  {
    name: 'براند فلاش (Flash)',
    slug: 'flash-brand',
    category: 'سناب',
    challenge: 'عدم القدرة على الوصول لجمهور الشباب بفعالية وتدني المبيعات المباشرة من إعلانات سناب شات.',
    strategy: 'دمج إعلانات سناب شات التفاعلية (Lenses & Story Ads) مع إعلانات إنستغرام لتعزيز الشراء الفوري والسريع لمجموعات المنتجات الجديدة.',
    results_json: { 'معدل العائد الاستثماري العام (ROAS)': '2.4x' },
    image_url: '/src/assets/portfolio/فلاش/Snap - Dec 24.png',
    thumbnail_url: '/src/assets/portfolio/فلاش/Snap - Dec 24.png',
    alt_text: 'براند فلاش'
  },
  {
    name: 'براند قناطير للمنتجات الغذائية',
    slug: 'qanateer-food',
    category: 'سلة',
    challenge: 'صعوبة بيع المنتجات الغذائية عبر الإنترنت والحاجة لبناء ثقة سريعة مع المستهلكين ورفع قيمة متوسط الطلب.',
    strategy: 'تفعيل التتبع الدقيق عبر سناب شات وميتا وتقديم باقات تسويقية مبتكرة (Bundle Offers) تناسب احتياجات العائلات.',
    results_json: { 'العائد الفعلي على حملات سلة (ROAS)': '2.5x' },
    image_url: '/src/assets/portfolio/قناطير/salla Dec 24.png',
    thumbnail_url: '/src/assets/portfolio/قناطير/salla Dec 24.png',
    alt_text: 'براند قناطير للمنتجات الغذائية'
  },
  {
    name: 'براند كاملز (Camels)',
    slug: 'camels-brand',
    category: 'سناب',
    challenge: 'انخفاض الوعي بالعلامة التجارية وضعف التفاعل مع المحتوى الإعلاني المروج.',
    strategy: 'استراتيجية تركز بالكامل على مقاطع الفيديو القصيرة والشهادات الحية (UGC) الموجهة للشباب لزيادة الانتشار والمبيعات المباشرة.',
    results_json: { 'عائد مبيعات متجر كاملز (ROAS)': '1.8x' },
    image_url: '/src/assets/portfolio/كاملز/1.8.png',
    thumbnail_url: '/src/assets/portfolio/كاملز/1.8.png',
    alt_text: 'براند كاملز'
  },
  {
    name: 'براند منابت الزراعي',
    slug: 'manabit-agricultural',
    category: 'زد',
    challenge: 'ضعف المبيعات لمتجر زد الزراعي وصعوبة تحديد واستهداف المهتمين بالنباتات المنزلية.',
    strategy: 'تحسين تهيئة المتجر على منصة زد الزراعية لربطه بحملات مخصصة ترويجية للمهتمين بالبيئة وتخضير المنازل مع تقديم كوبونات خصم تفاعلية.',
    results_json: { 'مضاعفة المبيعات على متجر زد': '2.0x' },
    image_url: '/src/assets/portfolio/منابت/منابت زد/Screenshot_1.png',
    thumbnail_url: '/src/assets/portfolio/منابت/منابت زد/Screenshot_1.png',
    alt_text: 'براند منابت الزراعي'
  }
];
