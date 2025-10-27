-- Script pour créer la table user_streaks si elle n'existe pas
-- Exécutez ce script dans votre console Supabase

-- Créer la table user_streaks si elle n'existe pas
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Utiliser l'email comme ID
  last_date_connected DATE NOT NULL DEFAULT CURRENT_DATE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- Activer RLS (Row Level Security)
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS (supprimer d'abord si elles existent)
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

-- Créer la fonction pour mettre à jour updated_at si elle n'existe pas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON user_streaks;
CREATE TRIGGER update_user_streaks_updated_at 
  BEFORE UPDATE ON user_streaks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaire pour la documentation
COMMENT ON TABLE user_streaks IS 'Stocke les données de série (streak) des utilisateurs';
COMMENT ON COLUMN user_streaks.user_id IS 'Email de l''utilisateur (utilisé comme ID)';
COMMENT ON COLUMN user_streaks.last_date_connected IS 'Dernière date de connexion de l''utilisateur';
COMMENT ON COLUMN user_streaks.current_streak IS 'Série actuelle en jours';

-- ✅ Table user_streaks créée avec succès !
-- Vous pouvez maintenant tester le coach IA.

