-- Script pour corriger les politiques de sécurité des statistiques de panique
-- Ce script gère le cas où les politiques existent déjà

-- Supprimer les politiques existantes si elles existent (pour éviter les conflits)
DROP POLICY IF EXISTS "Users can view their own panic stats" ON user_panic_stats;
DROP POLICY IF EXISTS "Users can update their own panic stats" ON user_panic_stats;
DROP POLICY IF EXISTS "Users can insert their own panic stats" ON user_panic_stats;
DROP POLICY IF EXISTS "Users can delete their own panic stats" ON user_panic_stats;

-- Créer la table si elle n'existe pas
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
COMMENT ON TABLE user_panic_stats IS 'Statistiques du bouton panique - nombre d''utilisations et de réussites';

-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE user_panic_stats ENABLE ROW LEVEL SECURITY;

-- Créer les politiques de sécurité
CREATE POLICY "Users can view their own panic stats" ON user_panic_stats FOR SELECT USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own panic stats" ON user_panic_stats FOR UPDATE USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can insert their own panic stats" ON user_panic_stats FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can delete their own panic stats" ON user_panic_stats FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- Ajouter le trigger pour updated_at si la fonction existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_user_panic_stats_updated_at 
        BEFORE UPDATE ON user_panic_stats 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
