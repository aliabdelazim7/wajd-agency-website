import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Award, 
  Clock, 
  ArrowLeft,
  TrendingUp,
  Activity,
  Eye,
  Globe,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { audioManager } from '../../utils/audioManager';
import LeadsChart from '../../components/LeadsChart';
import TrafficChart from '../../components/TrafficChart';

const DashboardOverview = () => {
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'traffic'
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    newLeads: 0,
    portfolioCount: 0,
    testimonialsCount: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    closedLeads: 0,
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [trafficStats, setTrafficStats] = useState({
    activeOnline: 0,
    totalViews: 0,
    uniqueVisitors: 0,
    avgDurationSecs: 0,
    topPages: [],
    topReferrers: [],
    trend: []
  });

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  // 1. Process leads for Daily Trend (last 15 days)
  const getTrendData = (leads) => {
    const last15Days = Array.from({ length: 15 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const counts = last15Days.reduce((acc, date) => {
      acc[date] = 0;
      return acc;
    }, {});

    leads.forEach(lead => {
      const dateStr = new Date(lead.created_at).toISOString().split('T')[0];
      if (counts[dateStr] !== undefined) {
        counts[dateStr] += 1;
      }
    });

    return last15Days.map(date => ({
      rawDate: date,
      date: new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
      count: counts[date]
    }));
  };

  // 2. Process leads for Service breakdown
  const getServiceData = (leads) => {
    const serviceCounts = leads.reduce((acc, lead) => {
      const s = lead.service || 'غير محدد';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leads, portfolio, testimonials, trafficRaw] = await Promise.all([
          api.leads.getAll(),
          api.portfolio.getAll(),
          api.testimonials.getAll(),
          api.analytics.getOverview(30).catch((err) => {
            console.warn('Traffic analytics table error (might need SQL setup):', err);
            return [];
          })
        ]);

        const newLeads = leads.filter(l => l.status === 'New').length;
        const contactedLeads = leads.filter(l => l.status === 'Contacted').length;
        const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
        const closedLeads = leads.filter(l => l.status === 'Closed').length;

        setMetrics({
          totalLeads: leads.length,
          newLeads,
          portfolioCount: portfolio.length,
          testimonialsCount: testimonials.length,
          contactedLeads,
          qualifiedLeads,
          closedLeads,
        });

        setRecentLeads(leads.slice(0, 5));
        setTrendData(getTrendData(leads));
        setServiceData(getServiceData(leads));

        // Process Traffic Analytics data
        if (trafficRaw) {
          const totalViews = trafficRaw.length;
          
          // Unique visitors
          const uniqueSessions = new Set(trafficRaw.map(t => t.session_id));
          const uniqueVisitors = uniqueSessions.size;

          // Active online (within 3 minutes = 180000ms)
          const threeMinAgo = Date.now() - 3 * 60 * 1000;
          const activeSessions = new Set(
            trafficRaw
              .filter(t => new Date(t.updated_at).getTime() > threeMinAgo)
              .map(t => t.session_id)
          );
          const activeOnline = activeSessions.size;

          // Average session duration
          const totalDuration = trafficRaw.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
          const avgDurationSecs = uniqueVisitors > 0 ? Math.round(totalDuration / uniqueVisitors) : 0;

          // Top pages
          const pageCounts = trafficRaw.reduce((acc, curr) => {
            const path = curr.page_path || '/';
            acc[path] = (acc[path] || 0) + 1;
            return acc;
          }, {});
          const topPages = Object.entries(pageCounts)
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          // Top referrers
          const referrerCounts = trafficRaw.reduce((acc, curr) => {
            let ref = curr.referrer ? curr.referrer.trim() : '';
            if (!ref) {
              ref = 'زيارة مباشرة (Direct)';
            } else {
              try {
                const url = new URL(ref);
                ref = url.hostname;
                // Exclude internal layout routing domains
                if (ref.includes('laydnaoxzsqfjusqitjp') || ref.includes('localhost') || ref.includes('supabase') || ref.includes('127.0.0.1')) {
                  return acc;
                }
              } catch (e) {
                // Keep raw
              }
            }
            acc[ref] = (acc[ref] || 0) + 1;
            return acc;
          }, {});
          const topReferrers = Object.entries(referrerCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          // Traffic chart trend (last 15 days)
          const getTrafficTrend = () => {
            const last15Days = Array.from({ length: 15 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - i);
              return d.toISOString().split('T')[0];
            }).reverse();

            const counts = last15Days.reduce((acc, date) => {
              acc[date] = 0;
              return acc;
            }, {});

            trafficRaw.forEach(record => {
              const dateStr = new Date(record.created_at).toISOString().split('T')[0];
              if (counts[dateStr] !== undefined) {
                counts[dateStr] += 1;
              }
            });

            return last15Days.map(date => ({
              rawDate: date,
              date: new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
              count: counts[date]
            }));
          };

          setTrafficStats({
            activeOnline,
            totalViews,
            uniqueVisitors,
            avgDurationSecs,
            topPages,
            topReferrers,
            trend: getTrafficTrend(),
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--gold)' }}>
        <span>جاري تحميل بيانات لوحة التحكم...</span>
      </div>
    );
  }

  // Leads metrics box
  const statBoxes = [
    { label: 'إجمالي العملاء المحتملين', value: metrics.totalLeads, icon: Users, color: 'var(--gold)', link: '/admin/leads' },
    { label: 'طلبات جديدة غير مقروءة', value: metrics.newLeads, icon: Clock, color: '#ef4444', link: '/admin/leads?status=New' },
    { label: 'دراسات الحالة المكتملة', value: metrics.portfolioCount, icon: Briefcase, color: 'var(--gold-light)', link: '/admin/portfolio' },
    { label: 'شهادات آراء الشركاء', value: metrics.testimonialsCount, icon: Award, color: '#3b82f6', link: '/admin/testimonials' },
  ];

  // Calculations for traffic line chart are handled internally in TrafficChart component

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}د ${s}ث`;
  };

  // Calculate percentages
  const conversionRate = metrics.totalLeads > 0 
    ? Math.round((metrics.closedLeads / metrics.totalLeads) * 100) 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Switch Tab bar */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        borderBottom: '1px solid var(--border-glass)', 
        paddingBottom: '15px',
        marginBottom: '5px' 
      }}>
        <button
          onClick={() => { handleClick(); setActiveTab('leads'); }}
          className={`action-btn ${activeTab === 'leads' ? 'filled' : 'outline'}`}
          style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '14px', border: '1px solid var(--border-glass)' }}
          onMouseEnter={handleHover}
        >
          تحليلات العملاء والطلبات
        </button>
        <button
          onClick={() => { handleClick(); setActiveTab('traffic'); }}
          className={`action-btn ${activeTab === 'traffic' ? 'filled' : 'outline'}`}
          style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '14px', border: '1px solid var(--border-glass)' }}
          onMouseEnter={handleHover}
        >
          تحليلات زوار الموقع (Traffic)
        </button>
      </div>

      {activeTab === 'leads' ? (
        <>
          {/* Metrics Row */}
          <div className="admin-metrics-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {statBoxes.map((box, i) => {
              const Icon = box.icon;
              return (
                <div 
                  key={i} 
                  className="philosophy-card" 
                  onClick={() => { handleClick(); navigate(box.link); }}
                  onMouseEnter={handleHover}
                  style={{ 
                    padding: '28px 24px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{box.label}</span>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: box.color, fontFamily: 'var(--font-en)' }}>
                      {box.value}
                    </span>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: box.color
                  }}>
                    <Icon size={22} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analytics Dashboard Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            
            {/* Trend Line Chart (SVG) */}
            <LeadsChart trendData={trendData} />

            {/* Services & Conversion Summary */}
            <div className="contact-container" style={{ padding: '30px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color="var(--gold)" />
                <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: 0, fontWeight: 700 }}>
                  توزيع الطلبات ونسبة نجاح الإغلاق
                </h3>
              </div>

              {/* Mini Conversion Funnel */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                <div style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>معدل الإغلاق</span>
                  <strong style={{ fontSize: '20px', color: '#22c55e', fontFamily: 'var(--font-en)' }}>{conversionRate}%</strong>
                </div>
                <div style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>عملاء مؤهلين</span>
                  <strong style={{ fontSize: '20px', color: '#eab308', fontFamily: 'var(--font-en)' }}>{metrics.qualifiedLeads}</strong>
                </div>
                <div style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>تم التواصل</span>
                  <strong style={{ fontSize: '20px', color: '#3b82f6', fontFamily: 'var(--font-en)' }}>{metrics.contactedLeads}</strong>
                </div>
              </div>

              {/* Top Requested Services with progress bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '130px', paddingRight: '4px' }}>
                {serviceData.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    لا توجد خدمات مسجلة.
                  </div>
                ) : (
                  serviceData.slice(0, 3).map((item, idx) => {
                    const percent = metrics.totalLeads > 0 ? Math.round((item.count / metrics.totalLeads) * 100) : 0;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>{item.name}</span>
                          <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-en)' }}>{item.count} ({percent}%)</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            background: 'linear-gradient(90deg, var(--gold), var(--gold-light))', 
                            width: `${percent}%`,
                            borderRadius: '3px'
                          }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Recent Leads Section */}
          <div className="contact-container" style={{ padding: '35px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', color: 'var(--text-light)', margin: 0, fontWeight: 700 }}>
                آخر الطلبات الواردة (Leads)
              </h3>
              <button 
                type="button" 
                className="action-btn outline"
                onClick={() => { handleClick(); navigate('/admin/leads'); }}
                onMouseEnter={handleHover}
                style={{ fontSize: '13px', padding: '8px 16px', gap: '6px' }}
              >
                <span>عرض كل الطلبات</span>
                <ArrowLeft size={14} />
              </button>
            </div>

            {recentLeads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                لا يوجد طلبات واردة حالياً.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className="faq-item" 
                    style={{ 
                      padding: '18px 24px', 
                      borderRadius: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-light)' }}>{lead.name}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {lead.service} • {lead.phone}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(lead.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--border-glass)',
                        color: lead.status === 'New' ? '#ef4444' : 
                               lead.status === 'Contacted' ? '#3b82f6' : 
                               lead.status === 'Qualified' ? '#eab308' : 
                               lead.status === 'Closed' ? '#22c55e' : '#94a3b8',
                        background: lead.status === 'New' ? 'rgba(239, 68, 68, 0.05)' : 
                                   lead.status === 'Contacted' ? 'rgba(59, 130, 246, 0.05)' : 
                                   lead.status === 'Qualified' ? 'rgba(234, 179, 8, 0.05)' : 
                                   lead.status === 'Closed' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(148, 163, 184, 0.05)'
                      }}>
                        {lead.status === 'New' ? 'جديد' : 
                         lead.status === 'Contacted' ? 'تم التواصل' : 
                         lead.status === 'Qualified' ? 'مؤهل' : 
                         lead.status === 'Closed' ? 'ناجح' : 'مستبعد'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        
      </> ) : (
        <>
          {/* Traffic Metrics Row */}
          <div className="admin-metrics-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            <div className="philosophy-card" style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>النشطون الآن (Live)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="live-pulse-dot" style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    display: 'inline-block',
                    boxShadow: '0 0 10px #22c55e'
                  }} />
                  <span style={{ fontSize: '32px', fontWeight: 800, color: '#22c55e', fontFamily: 'var(--font-en)' }}>
                    {trafficStats.activeOnline}
                  </span>
                </div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', color: '#22c55e', justifyContent: 'center' }}>
                <Activity size={22} />
              </div>
            </div>

            <div className="philosophy-card" style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>إجمالي الزيارات (Page Views)</span>
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-en)' }}>
                  {trafficStats.totalViews}
                </span>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', color: 'var(--gold)', justifyContent: 'center' }}>
                <Eye size={22} />
              </div>
            </div>

            <div className="philosophy-card" style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>الزوار الفريدون (Unique)</span>
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gold-light)', fontFamily: 'var(--font-en)' }}>
                  {trafficStats.uniqueVisitors}
                </span>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', color: 'var(--gold-light)', justifyContent: 'center' }}>
                <Users size={22} />
              </div>
            </div>

            <div className="philosophy-card" style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>متوسط وقت البقاء</span>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6', fontFamily: 'var(--font-ar)' }}>
                  {formatDuration(trafficStats.avgDurationSecs)}
                </span>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', color: '#3b82f6', justifyContent: 'center' }}>
                <Clock size={22} />
              </div>
            </div>
          </div>

          {/* Traffic Daily chart */}
          <TrafficChart trendData={trafficStats.trend} />
          

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {/* Top Pages */}
            <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FileText size={20} color="var(--gold)" />
                <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: 0, fontWeight: 700 }}>
                  الصفحات الأكثر زيارة (Top Pages)
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {trafficStats.topPages.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    لا توجد بيانات تتبع بعد.
                  </div>
                ) : (
                  trafficStats.topPages.map((page, idx) => {
                    const percent = trafficStats.totalViews > 0 ? Math.round((page.count / trafficStats.totalViews) * 100) : 0;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: 'var(--text-light)', fontFamily: 'var(--font-en)', direction: 'ltr' }}>{page.path}</span>
                          <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-en)', fontWeight: 600 }}>{page.count} زيارة ({percent}%)</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            background: 'linear-gradient(90deg, var(--gold), var(--gold-light))', 
                            width: `${percent}%`,
                            borderRadius: '3px'
                          }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Top Traffic Sources */}
            <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Globe size={20} color="var(--gold)" />
                <h3 style={{ fontSize: '18px', color: 'var(--text-light)', margin: 0, fontWeight: 700 }}>
                  مصادر الزوار (Top Referrers)
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {trafficStats.topReferrers.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    لا توجد مصادر زيارات مسجلة.
                  </div>
                ) : (
                  trafficStats.topReferrers.map((ref, idx) => {
                    const percent = trafficStats.totalViews > 0 ? Math.round((ref.count / trafficStats.totalViews) * 100) : 0;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: 'var(--text-light)', fontFamily: 'var(--font-en)' }}>{ref.name}</span>
                          <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-en)', fontWeight: 600 }}>{ref.count} زائر ({percent}%)</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', 
                            width: `${percent}%`,
                            borderRadius: '3px'
                          }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardOverview;
