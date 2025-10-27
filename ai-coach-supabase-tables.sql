-- Tables pour le Coach IA
-- Ce fichier contient les tables nécessaires pour stocker les conversations avec le coach IA

-- Table pour stocker l'historique des conversations avec le coach IA
CREATE TABLE IF NOT EXISTS ai_coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES auth.users(email) ON DELETE CASCADE, -- Utiliser l'email comme ID
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_user_id ON ai_coach_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_created_at ON ai_coach_conversations(created_at);

-- Table pour stocker le contexte utilisateur pour l'IA
CREATE TABLE IF NOT EXISTS ai_coach_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES auth.users(email) ON DELETE CASCADE UNIQUE, -- Utiliser l'email comme ID
  context_data JSONB NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour le contexte utilisateur
CREATE INDEX IF NOT EXISTS idx_ai_coach_context_user_id ON ai_coach_context(user_id);

-- Table pour les statistiques d'usage du coach IA
CREATE TABLE IF NOT EXISTS ai_coach_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES auth.users(email) ON DELETE CASCADE, -- Utiliser l'email comme ID
  date DATE NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index pour les statistiques d'usage
CREATE INDEX IF NOT EXISTS idx_ai_coach_usage_stats_user_id ON ai_coach_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_usage_stats_date ON ai_coach_usage_stats(date);

-- Politiques RLS (Row Level Security) pour la sécurité

-- Politiques pour ai_coach_conversations
ALTER TABLE ai_coach_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON ai_coach_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON ai_coach_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON ai_coach_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON ai_coach_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour ai_coach_context
ALTER TABLE ai_coach_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own context" ON ai_coach_context
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own context" ON ai_coach_context
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own context" ON ai_coach_context
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own context" ON ai_coach_context
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour ai_coach_usage_stats
ALTER TABLE ai_coach_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage stats" ON ai_coach_usage_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage stats" ON ai_coach_usage_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage stats" ON ai_coach_usage_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own usage stats" ON ai_coach_usage_stats
  FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_ai_coach_conversations_updated_at 
  BEFORE UPDATE ON ai_coach_conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour nettoyer les anciennes conversations (plus de 90 jours)
CREATE OR REPLACE FUNCTION cleanup_old_conversations()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_coach_conversations 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ language 'plpgsql';

-- Fonction pour obtenir les statistiques d'usage d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_ai_coach_stats(p_user_id UUID)
RETURNS TABLE (
  total_messages INTEGER,
  total_tokens INTEGER,
  days_active INTEGER,
  last_conversation TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(acs.messages_sent), 0)::INTEGER as total_messages,
    COALESCE(SUM(acs.tokens_used), 0)::INTEGER as total_tokens,
    COUNT(DISTINCT acs.date)::INTEGER as days_active,
    MAX(acc.created_at) as last_conversation
  FROM ai_coach_usage_stats acs
  LEFT JOIN ai_coach_conversations acc ON acc.user_id = acs.user_id
  WHERE acs.user_id = p_user_id;
END;
$$ language 'plpgsql';

-- Commentaires pour la documentation
COMMENT ON TABLE ai_coach_conversations IS 'Stocke l''historique des conversations entre les utilisateurs et le coach IA';
COMMENT ON TABLE ai_coach_context IS 'Stocke le contexte utilisateur pour personnaliser les réponses du coach IA';
COMMENT ON TABLE ai_coach_usage_stats IS 'Statistiques d''usage du coach IA par utilisateur et par jour';

COMMENT ON COLUMN ai_coach_conversations.message IS 'Message envoyé par l''utilisateur';
COMMENT ON COLUMN ai_coach_conversations.response IS 'Réponse générée par le coach IA';
COMMENT ON COLUMN ai_coach_context.context_data IS 'Données JSON contenant le profil et les statistiques utilisateur';
COMMENT ON COLUMN ai_coach_usage_stats.messages_sent IS 'Nombre de messages envoyés par l''utilisateur ce jour';
COMMENT ON COLUMN ai_coach_usage_stats.tokens_used IS 'Nombre de tokens utilisés par l''API IA ce jour';
