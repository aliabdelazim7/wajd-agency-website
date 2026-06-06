import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { audioManager } from '../utils/audioManager';

const Privacy = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    audioManager.playClick();
    navigate('/');
  };

  return (
    <div className="privacy-page-container">
      <button 
        type="button" 
        className="action-btn back-home-nav-btn"
        onClick={handleBackClick}
      >
        <ArrowRight size={16} />
        <span>العودة للرئيسية</span>
      </button>

      <div className="privacy-card-full">
        <h1>سياسة الخصوصية وسرية البيانات (Privacy Policy)</h1>
        <p className="privacy-intro">
          في وكالة وجد للتسويق، نلتزم بأقصى درجات السرية والأمان لبيانات عملائنا وحساباتهم الإعلانية ومتاجرهم الإلكترونية. توضح هذه السياسة كيفية تعاملنا مع البيانات وسرية التقارير.
        </p>

        <div className="privacy-section-block">
          <h3>1. حماية حسابات الإعلانات والوصول</h3>
          <p>
            نحن لا نشارك كلمات المرور أو صلاحيات الوصول الخاصة بحسابات إعلانات ميتا (Meta Ads) أو سناب شات أو جوجل اناليتكس مع أي أطراف خارجية. يتم الدخول وإدارة العمليات حصراً عبر مدراء الأعمال (Business Managers) الرسميين وبصلاحيات محددة.
          </p>
        </div>

        <div className="privacy-section-block">
          <h3>2. سرية بيانات المبيعات والأرباح</h3>
          <p>
            جميع لقطات الشاشة والتقارير ومعدلات الأداء المعروضة في معرض أعمالنا تتم بعد أخذ الموافقة الصريحة والكاملة من شركائنا، مع الالتزام التام بإخفاء البيانات الحساسة أو الشخصية للعملاء لضمان الحفاظ التام على أسرارهم التجارية.
          </p>
        </div>

        <div className="privacy-section-block">
          <h3>3. أدوات التحليل والتتبع</h3>
          <p>
            نستخدم أدوات التتبع المعتمدة مثل (Meta Pixel, Snap Pixel, Google Analytics) بهدف قياس العائد على الإنفاق الإعلاني وتصحيح مسار الاستهداف لجمهور الخليج والمملكة العربية السعودية لزيادة أرباح المتاجر.
          </p>
        </div>

        <div className="privacy-section-block">
          <h3>4. التواصل والدعم</h3>
          <p>
            إذا كان لديك أي استفسار حول سرية حساباتك أو سياسة أمان البيانات لدينا، يرجى التواصل معنا مباشرة عبر قنوات الاتصال الرسمية.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
