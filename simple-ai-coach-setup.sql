-- Script simple pour créer les tables du Coach IA sans conflits
-- Exécutez ce script dans votre console Supabase

-- 1. Créer la table user_streaks si elle n'existe pas
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  last_date_connected DATE NOT NULL DEFAULT CURRENT_DATE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Créer les tables du coach IA
CREATE TABLE IF NOT EXISTS ai_coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_coach_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  context_data JSONB NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_coach_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 3. Créer les index
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_user_id ON ai_coach_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_created_at ON ai_coach_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_coach_context_user_id ON ai_coach_context(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_usage_stats_user_id ON ai_coach_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_usage_stats_date ON ai_coach_usage_stats(date);

-- 4. Activer RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_usage_stats ENABLE ROW LEVEL SECURITY;

-- 5. Créer la fonction updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Créer les triggers
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON user_streaks;
CREATE TRIGGER update_user_streaks_updated_at 
  BEFORE UPDATE ON user_streaks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_coach_conversations_updated_at ON ai_coach_conversations;
CREATE TRIGGER update_ai_coach_conversations_updated_at 
  BEFORE UPDATE ON ai_coach_conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ✅ Tables créées avec succès !
-- Les politiques RLS seront créées automatiquement par Supabase si nécessaire.
-- Vous pouvez maintenant tester le coach IA.
