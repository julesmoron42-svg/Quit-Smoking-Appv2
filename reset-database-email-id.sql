-- Script pour repartir de zéro avec l'email comme user ID
-- ATTENTION: Ce script supprime TOUTES les données existantes !

-- 1. Supprimer toutes les tables existantes
DROP TABLE IF EXISTS health_benefits CASCADE;
DROP TABLE IF EXISTS user_streaks CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS financial_goals CASCADE;
DROP TABLE IF EXISTS daily_entries CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. Supprimer la fonction de trigger si elle existe
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 3. Créer les nouvelles tables avec email comme user ID
-- Table des profils utilisateurs (utilise email comme clé primaire)
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY, -- L'email sera utilisé comme ID
  started_smoking_years INTEGER NOT NULL DEFAULT 0,
  cigs_per_day INTEGER NOT NULL DEFAULT 20,
  objective_type TEXT CHECK (objective_type IN ('complete', 'progressive')) NOT NULL DEFAULT 'complete',
  reduction_frequency INTEGER,
  smoking_years INTEGER,
  smoking_peak_time TEXT CHECK (smoking_peak_time IN ('morning', 'after_meals', 'evening', 'all_day', 'work_breaks')),
  main_goal TEXT CHECK (main_goal IN ('complete_stop', 'progressive_reduction')),
  target_date DATE,
  main_motivation TEXT CHECK (main_motivation IN ('health', 'finance', 'family', 'sport', 'independence')),
  previous_attempts TEXT CHECK (previous_attempts IN ('first_time', '1_2_times', 'several_times', 'many_times')),
  smoking_triggers TEXT[], -- Array de strings
  smoking_situations TEXT[], -- Array de strings
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paramètres utilisateurs
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Référence vers l'email
  price_per_cig DECIMAL(10,2) NOT NULL DEFAULT 0.6,
  currency TEXT NOT NULL DEFAULT '€',
  notifications_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  language TEXT NOT NULL DEFAULT 'fr',
  animations_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table des entrées quotidiennes
CREATE TABLE daily_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Référence vers l'email
  date DATE NOT NULL,
  real_cigs INTEGER NOT NULL DEFAULT 0,
  goal_cigs INTEGER NOT NULL DEFAULT 0,
  emotion TEXT CHECK (emotion IN ('happy', 'proud', 'frustrated', 'anxious', 'confident', 'disappointed', 'relieved', 'stressed')),
  objective_met BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Table des objectifs financiers
CREATE TABLE financial_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Référence vers l'email
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réalisations
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Référence vers l'email
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des séries (streaks)
CREATE TABLE user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Référence vers l'email
  last_date_connected DATE NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table des bienfaits santé
CREATE TABLE health_benefits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL, -- Référence vers l'email
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  time_required INTEGER NOT NULL, -- en minutes
  unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer la fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Créer les triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON daily_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_benefits_updated_at BEFORE UPDATE ON health_benefits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_benefits ENABLE ROW LEVEL SECURITY;

-- 7. Créer les politiques de sécurité RLS (utilise l'email de l'utilisateur connecté)
-- Politiques pour user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (id = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (id = auth.jwt() ->> 'email');
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (id = auth.jwt() ->> 'email');

-- Politiques pour user_settings
CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');

-- Politiques pour daily_entries
CREATE POLICY "Users can view their own entries" ON daily_entries FOR SELECT USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own entries" ON daily_entries FOR UPDATE USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can insert their own entries" ON daily_entries FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can delete their own entries" ON daily_entries FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- Politiques pour financial_goals
CREATE POLICY "Users can view their own goals" ON financial_goals FOR SELECT USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own goals" ON financial_goals FOR UPDATE USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can insert their own goals" ON financial_goals FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can delete their own goals" ON financial_goals FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- Politiques pour achievements
CREATE POLICY "Users can view their own achievements" ON achievements FOR SELECT USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own achievements" ON achievements FOR UPDATE USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can insert their own achievements" ON achievements FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can delete their own achievements" ON achievements FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- Politiques pour user_streaks
CREATE POLICY "Users can view their own streak" ON user_streaks FOR SELECT USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own streak" ON user_streaks FOR UPDATE USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can insert their own streak" ON user_streaks FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');

-- Politiques pour health_benefits
CREATE POLICY "Users can view their own health benefits" ON health_benefits FOR SELECT USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own health benefits" ON health_benefits FOR UPDATE USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can insert their own health benefits" ON health_benefits FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can delete their own health benefits" ON health_benefits FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- 8. Message de confirmation
SELECT 'Base de données réinitialisée avec succès ! L''email est maintenant utilisé comme user ID.' as message;
