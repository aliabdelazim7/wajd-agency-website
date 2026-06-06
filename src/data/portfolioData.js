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
