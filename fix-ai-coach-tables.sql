-- Script pour corriger les tables du Coach IA
-- Exécutez ce script dans votre console Supabase

-- 1. Supprimer les tables existantes du coach IA si elles existent
DROP TABLE IF EXISTS ai_coach_usage_stats CASCADE;
DROP TABLE IF EXISTS ai_coach_context CASCADE;
DROP TABLE IF EXISTS ai_coach_conversations CASCADE;

-- 2. Créer la table user_streaks si elle n'existe pas
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Utiliser l'email comme ID
  last_date_connected DATE NOT NULL DEFAULT CURRENT_DATE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Recréer les tables avec la bonne structure (email comme user_id)
-- Table pour stocker l'historique des conversations avec le coach IA
CREATE TABLE ai_coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Utiliser l'email comme ID
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour stocker le contexte utilisateur pour l'IA
CREATE TABLE ai_coach_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE, -- Utiliser l'email comme ID
  context_data JSONB NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les statistiques d'usage du coach IA
CREATE TABLE ai_coach_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Utiliser l'email comme ID
  date DATE NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 4. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_ai_coach_conversations_user_id ON ai_coach_conversations(user_id);
CREATE INDEX idx_ai_coach_conversations_created_at ON ai_coach_conversations(created_at);
CREATE INDEX idx_ai_coach_context_user_id ON ai_coach_context(user_id);
CREATE INDEX idx_ai_coach_usage_stats_user_id ON ai_coach_usage_stats(user_id);
CREATE INDEX idx_ai_coach_usage_stats_date ON ai_coach_usage_stats(date);

-- 5. Activer RLS (Row Level Security)
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_usage_stats ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS
-- Politiques pour user_streaks
CREATE POLICY "Users can view their own streak" ON user_streaks
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own streak" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own streak" ON user_streaks
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own streak" ON user_streaks
  FOR DELETE USING (auth.uid()::text = user_id);
-- 6. Créer les politiques RLS (supprimer d'abord si elles existent)
-- Politiques pour user_streaks
DROP POLICY IF EXISTS "Users can view their own streak" ON user_streaks;
DROP POLICY IF EXISTS "Users can insert their own streak" ON user_streaks;
DROP POLICY IF EXISTS "Users can update their own streak" ON user_streaks;
DROP POLICY IF EXISTS "Users can delete their own streak" ON user_streaks;

CREATE POLICY "Users can view their own streak" ON user_streaks
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own streak" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own streak" ON user_streaks
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own streak" ON user_streaks
  FOR DELETE USING (auth.uid()::text = user_id);

-- Politiques pour ai_coach_conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON ai_coach_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON ai_coach_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON ai_coach_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON ai_coach_conversations;

CREATE POLICY "Users can view their own conversations" ON ai_coach_conversations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own conversations" ON ai_coach_conversations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own conversations" ON ai_coach_conversations
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own conversations" ON ai_coach_conversations
  FOR DELETE USING (auth.uid()::text = user_id);

-- Politiques pour ai_coach_context
DROP POLICY IF EXISTS "Users can view their own context" ON ai_coach_context;
DROP POLICY IF EXISTS "Users can insert their own context" ON ai_coach_context;
DROP POLICY IF EXISTS "Users can update their own context" ON ai_coach_context;
DROP POLICY IF EXISTS "Users can delete their own context" ON ai_coach_context;

CREATE POLICY "Users can view their own context" ON ai_coach_context
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own context" ON ai_coach_context
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own context" ON ai_coach_context
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own context" ON ai_coach_context
  FOR DELETE USING (auth.uid()::text = user_id);

-- Politiques pour ai_coach_usage_stats
DROP POLICY IF EXISTS "Users can view their own usage stats" ON ai_coach_usage_stats;
DROP POLICY IF EXISTS "Users can insert their own usage stats" ON ai_coach_usage_stats;
DROP POLICY IF EXISTS "Users can update their own usage stats" ON ai_coach_usage_stats;
DROP POLICY IF EXISTS "Users can delete their own usage stats" ON ai_coach_usage_stats;

CREATE POLICY "Users can view their own usage stats" ON ai_coach_usage_stats
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own usage stats" ON ai_coach_usage_stats
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own usage stats" ON ai_coach_usage_stats
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own usage stats" ON ai_coach_usage_stats
  FOR DELETE USING (auth.uid()::text = user_id);
-- 7. Créer la fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Créer les triggers pour updated_at
CREATE TRIGGER update_user_streaks_updated_at 
  BEFORE UPDATE ON user_streaks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_coach_conversations_updated_at 
  BEFORE UPDATE ON ai_coach_conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Commentaires pour la documentation
COMMENT ON TABLE user_streaks IS 'Stocke les données de série (streak) des utilisateurs';
COMMENT ON TABLE ai_coach_conversations IS 'Stocke l''historique des conversations entre les utilisateurs et le coach IA';
COMMENT ON TABLE ai_coach_context IS 'Stocke le contexte utilisateur pour personnaliser les réponses du coach IA';
COMMENT ON TABLE ai_coach_usage_stats IS 'Statistiques d''usage du coach IA par utilisateur et par jour';

COMMENT ON COLUMN user_streaks.user_id IS 'Email de l''utilisateur (utilisé comme ID)';
COMMENT ON COLUMN ai_coach_conversations.user_id IS 'Email de l''utilisateur (utilisé comme ID)';
COMMENT ON COLUMN ai_coach_conversations.message IS 'Message envoyé par l''utilisateur';
COMMENT ON COLUMN ai_coach_conversations.response IS 'Réponse générée par le coach IA';
COMMENT ON COLUMN ai_coach_context.user_id IS 'Email de l''utilisateur (utilisé comme ID)';
COMMENT ON COLUMN ai_coach_context.context_data IS 'Données JSON contenant le profil et les statistiques utilisateur';
COMMENT ON COLUMN ai_coach_usage_stats.user_id IS 'Email de l''utilisateur (utilisé comme ID)';
COMMENT ON COLUMN ai_coach_usage_stats.messages_sent IS 'Nombre de messages envoyés par l''utilisateur ce jour';
COMMENT ON COLUMN ai_coach_usage_stats.tokens_used IS 'Nombre de tokens utilisés par l''API IA ce jour';

-- ✅ Tables du Coach IA créées avec succès !
-- Vous pouvez maintenant tester le coach IA dans votre application.
