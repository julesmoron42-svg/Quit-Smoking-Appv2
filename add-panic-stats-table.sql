-- Ajouter la table pour les statistiques de panique
-- pour synchroniser les données entre les appareils

CREATE TABLE IF NOT EXISTS user_panic_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Référence vers l'email
  panic_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Commentaire pour expliquer la table
COMMENT ON TABLE user_panic_stats IS 'Statistiques du bouton panique - nombre d\'utilisations et de réussites';

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_user_panic_stats_updated_at 
BEFORE UPDATE ON user_panic_stats 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE user_panic_stats ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_panic_stats
CREATE POLICY "Users can view their own panic stats" ON user_panic_stats FOR SELECT USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own panic stats" ON user_panic_stats FOR UPDATE USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can insert their own panic stats" ON user_panic_stats FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can delete their own panic stats" ON user_panic_stats FOR DELETE USING (user_id = auth.jwt() ->> 'email');


