-- Script pour ajouter la table de session du chrono à Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- Table pour stocker la session du chrono
CREATE TABLE IF NOT EXISTS user_timer_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Référence vers l'email
  is_running BOOLEAN NOT NULL DEFAULT FALSE,
  start_timestamp BIGINT, -- Timestamp en millisecondes
  elapsed_before_pause BIGINT NOT NULL DEFAULT 0, -- Temps en millisecondes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_user_timer_sessions_updated_at 
BEFORE UPDATE ON user_timer_sessions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE user_timer_sessions ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_timer_sessions
CREATE POLICY "Users can view their own timer session" 
ON user_timer_sessions FOR SELECT 
USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own timer session" 
ON user_timer_sessions FOR UPDATE 
USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert their own timer session" 
ON user_timer_sessions FOR INSERT 
WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete their own timer session" 
ON user_timer_sessions FOR DELETE 
USING (user_id = auth.jwt() ->> 'email');

-- Message de confirmation
SELECT 'Table user_timer_sessions créée avec succès !' as message;
