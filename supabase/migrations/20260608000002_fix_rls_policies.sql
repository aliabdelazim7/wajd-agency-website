-- Re-create clean RLS policies for all Wajd Agency tables

-- 1. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "admin_full_access" ON profiles;
DROP POLICY IF EXISTS "user_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_full_access" ON leads;
DROP POLICY IF EXISTS "user_create_own" ON leads;
DROP POLICY IF EXISTS "user_select_own" ON leads;
DROP POLICY IF EXISTS "admin_full_access" ON traffic_analytics;
DROP POLICY IF EXISTS "public_insert" ON traffic_analytics;
DROP POLICY IF EXISTS "admin_full_access" ON portfolio;
DROP POLICY IF EXISTS "public_select" ON portfolio;
DROP POLICY IF EXISTS "admin_full_access" ON faqs;
DROP POLICY IF EXISTS "editor_own_faq" ON faqs;

-- 2. Enable RLS on all remaining tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE preauthorized_admins ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS Policies

-- profiles
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (true);
-- (Admin role check or profile access rule)

-- audit_logs
CREATE POLICY "audit_logs_admin_select" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (true);

-- custom_scripts
CREATE POLICY "custom_scripts_admin_all" ON custom_scripts FOR ALL TO authenticated USING (true);
CREATE POLICY "custom_scripts_public_select" ON custom_scripts FOR SELECT TO public USING (active = true);

-- site_settings
CREATE POLICY "site_settings_admin_all" ON site_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "site_settings_public_select" ON site_settings FOR SELECT TO public USING (true);

-- hero_content
CREATE POLICY "hero_content_admin_all" ON hero_content FOR ALL TO authenticated USING (true);
CREATE POLICY "hero_content_public_select" ON hero_content FOR SELECT TO public USING (true);

-- statistics
CREATE POLICY "statistics_admin_all" ON statistics FOR ALL TO authenticated USING (true);
CREATE POLICY "statistics_public_select" ON statistics FOR SELECT TO public USING (true);

-- testimonials
CREATE POLICY "testimonials_admin_all" ON testimonials FOR ALL TO authenticated USING (true);
CREATE POLICY "testimonials_public_select" ON testimonials FOR SELECT TO public USING (true);

-- portfolio
CREATE POLICY "portfolio_admin_all" ON portfolio FOR ALL TO authenticated USING (true);
CREATE POLICY "portfolio_public_select" ON portfolio FOR SELECT TO public USING (true);

-- faqs
CREATE POLICY "faqs_admin_all" ON faqs FOR ALL TO authenticated USING (true);
CREATE POLICY "faqs_public_select" ON faqs FOR SELECT TO public USING (true);

-- seo_pages
CREATE POLICY "seo_pages_admin_all" ON seo_pages FOR ALL TO authenticated USING (true);
CREATE POLICY "seo_pages_public_select" ON seo_pages FOR SELECT TO public USING (true);

-- leads
CREATE POLICY "leads_admin_all" ON leads FOR ALL TO authenticated USING (true);
CREATE POLICY "leads_public_insert" ON leads FOR INSERT TO public WITH CHECK (true);

-- traffic_analytics
CREATE POLICY "traffic_analytics_admin_all" ON traffic_analytics FOR ALL TO authenticated USING (true);
CREATE POLICY "traffic_analytics_public_insert" ON traffic_analytics FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "traffic_analytics_public_update" ON traffic_analytics FOR UPDATE TO public USING (true);

-- preauthorized_admins
CREATE POLICY "preauthorized_admins_admin_all" ON preauthorized_admins FOR ALL TO authenticated USING (true);
