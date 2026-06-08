-- Hardened security policies and triggers for Wajd Agency

-- 1. Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop any previous loose RLS policies to prevent duplicates
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_user_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_user_update_own" ON profiles;
DROP POLICY IF EXISTS "audit_logs_admin_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
DROP POLICY IF EXISTS "custom_scripts_admin_all" ON custom_scripts;
DROP POLICY IF EXISTS "custom_scripts_public_select" ON custom_scripts;
DROP POLICY IF EXISTS "site_settings_admin_all" ON site_settings;
DROP POLICY IF EXISTS "site_settings_public_select" ON site_settings;
DROP POLICY IF EXISTS "hero_content_admin_all" ON hero_content;
DROP POLICY IF EXISTS "hero_content_public_select" ON hero_content;
DROP POLICY IF EXISTS "statistics_admin_all" ON statistics;
DROP POLICY IF EXISTS "statistics_public_select" ON statistics;
DROP POLICY IF EXISTS "testimonials_admin_all" ON testimonials;
DROP POLICY IF EXISTS "testimonials_public_select" ON testimonials;
DROP POLICY IF EXISTS "portfolio_admin_all" ON portfolio;
DROP POLICY IF EXISTS "portfolio_public_select" ON portfolio;
DROP POLICY IF EXISTS "faqs_admin_all" ON faqs;
DROP POLICY IF EXISTS "faqs_public_select" ON faqs;
DROP POLICY IF EXISTS "seo_pages_admin_all" ON seo_pages;
DROP POLICY IF EXISTS "seo_pages_public_select" ON seo_pages;
DROP POLICY IF EXISTS "leads_admin_all" ON leads;
DROP POLICY IF EXISTS "leads_public_insert" ON leads;
DROP POLICY IF EXISTS "traffic_analytics_admin_all" ON traffic_analytics;
DROP POLICY IF EXISTS "traffic_analytics_public_insert" ON traffic_analytics;
DROP POLICY IF EXISTS "traffic_analytics_public_update" ON traffic_analytics;
DROP POLICY IF EXISTS "preauthorized_admins_admin_all" ON preauthorized_admins;
DROP POLICY IF EXISTS "whatsapp_templates_admin_all" ON whatsapp_templates;

-- 3. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE preauthorized_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- profiles policies (Critical: user cannot update role or profiles; only admins can modify profiles)
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (public.is_admin());
CREATE POLICY "profiles_user_select_own" ON profiles FOR SELECT USING (auth.uid() = id);

-- audit_logs policies
CREATE POLICY "audit_logs_admin_select" ON audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (true);

-- custom_scripts policies (Critical: only admin can edit script injections to prevent XSS)
CREATE POLICY "custom_scripts_admin_all" ON custom_scripts FOR ALL USING (public.is_admin());
CREATE POLICY "custom_scripts_public_select" ON custom_scripts FOR SELECT USING (active = true);

-- site_settings policies
CREATE POLICY "site_settings_admin_all" ON site_settings FOR ALL USING (public.is_admin());
CREATE POLICY "site_settings_public_select" ON site_settings FOR SELECT USING (true);

-- hero_content policies
CREATE POLICY "hero_content_admin_all" ON hero_content FOR ALL USING (public.is_admin());
CREATE POLICY "hero_content_public_select" ON hero_content FOR SELECT USING (true);

-- statistics policies
CREATE POLICY "statistics_admin_all" ON statistics FOR ALL USING (public.is_admin());
CREATE POLICY "statistics_public_select" ON statistics FOR SELECT USING (true);

-- testimonials policies
CREATE POLICY "testimonials_admin_all" ON testimonials FOR ALL USING (public.is_admin());
CREATE POLICY "testimonials_public_select" ON testimonials FOR SELECT USING (true);

-- portfolio policies
CREATE POLICY "portfolio_admin_all" ON portfolio FOR ALL USING (public.is_admin());
CREATE POLICY "portfolio_public_select" ON portfolio FOR SELECT USING (true);

-- faqs policies
CREATE POLICY "faqs_admin_all" ON faqs FOR ALL USING (public.is_admin());
CREATE POLICY "faqs_public_select" ON faqs FOR SELECT USING (true);

-- seo_pages policies
CREATE POLICY "seo_pages_admin_all" ON seo_pages FOR ALL USING (public.is_admin());
CREATE POLICY "seo_pages_public_select" ON seo_pages FOR SELECT USING (true);

-- leads policies (Critical: only admin can view/edit consumer data)
CREATE POLICY "leads_admin_all" ON leads FOR ALL USING (public.is_admin());
CREATE POLICY "leads_public_insert" ON leads FOR INSERT WITH CHECK (true);

-- traffic_analytics policies
CREATE POLICY "traffic_analytics_admin_all" ON traffic_analytics FOR ALL USING (public.is_admin());
CREATE POLICY "traffic_analytics_public_insert" ON traffic_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "traffic_analytics_public_update" ON traffic_analytics FOR UPDATE USING (true);

-- preauthorized_admins policies
CREATE POLICY "preauthorized_admins_admin_all" ON preauthorized_admins FOR ALL USING (public.is_admin());

-- whatsapp_templates policies
CREATE POLICY "whatsapp_templates_admin_all" ON whatsapp_templates FOR ALL USING (public.is_admin());


-- 4. Automatically handle new user registrations securely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  is_preauthorized boolean;
BEGIN
  -- Check if user's email exists in preauthorized_admins
  SELECT EXISTS (
    SELECT 1 FROM public.preauthorized_admins
    WHERE email = NEW.email
  ) INTO is_preauthorized;

  IF is_preauthorized THEN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'admin');
  ELSE
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 5. Automatically sync pre-authorizations additions
CREATE OR REPLACE FUNCTION public.handle_new_preauthorization()
RETURNS trigger AS $$
BEGIN
  -- Elevate user profile role to admin if they already registered
  UPDATE public.profiles
  SET role = 'admin'
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_preauthorization_added ON public.preauthorized_admins;
CREATE TRIGGER on_preauthorization_added
  AFTER INSERT ON public.preauthorized_admins
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_preauthorization();


-- 6. Automatically sync pre-authorizations removals (Demote revoked admins)
CREATE OR REPLACE FUNCTION public.handle_revoked_preauthorization()
RETURNS trigger AS $$
BEGIN
  -- Demote user profile role back to user
  UPDATE public.profiles
  SET role = 'user'
  WHERE email = OLD.email;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_preauthorization_removed ON public.preauthorized_admins;
CREATE TRIGGER on_preauthorization_removed
  AFTER DELETE ON public.preauthorized_admins
  FOR EACH ROW EXECUTE FUNCTION public.handle_revoked_preauthorization();
