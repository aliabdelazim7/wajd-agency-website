-- Row Level Security policies for admin dashboard

-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "admin_full_access" ON profiles FOR ALL TO authenticated USING (auth.role() = 'admin');
CREATE POLICY "user_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Policies for leads
CREATE POLICY "admin_full_access" ON leads FOR ALL TO authenticated USING (auth.role() = 'admin');
CREATE POLICY "user_create_own" ON leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "user_select_own" ON leads FOR SELECT USING (auth.uid() = created_by);

-- Policies for traffic_analytics
CREATE POLICY "admin_full_access" ON traffic_analytics FOR ALL TO authenticated USING (auth.role() = 'admin');
CREATE POLICY "public_insert" ON traffic_analytics FOR INSERT TO authenticated WITH CHECK (true);

-- Policies for portfolio
CREATE POLICY "admin_full_access" ON portfolio FOR ALL TO authenticated USING (auth.role() = 'admin');
CREATE POLICY "public_select" ON portfolio FOR SELECT TO public USING (true);

-- Policies for faqs
CREATE POLICY "admin_full_access" ON faqs FOR ALL TO authenticated USING (auth.role() = 'admin');
CREATE POLICY "editor_own_faq" ON faqs FOR UPDATE USING (auth.role() = 'editor' AND auth.uid() = updated_by);
