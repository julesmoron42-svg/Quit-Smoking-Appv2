-- Script SQL pour ajouter la table des validations de plan de sevrage
-- Exécutez ces commandes dans l'éditeur SQL de votre projet Supabase

-- Table des validations de plan de sevrage
CREATE TABLE IF NOT EXISTS plan_validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Référence vers l'email
  plan_id TEXT NOT NULL, -- ID du plan (P1, P2, etc.)
  day_number INTEGER NOT NULL,
  validated_date DATE NOT NULL, -- Date de validation au format YYYY-MM-DD
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_id, day_number, validated_date)
);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_plan_validations_updated_at BEFORE UPDATE ON plan_validations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE plan_validations ENABLE ROW LEVEL SECURITY;

-- Politiques pour plan_validations
CREATE POLICY "Users can view their own plan validations" ON plan_validations FOR SELECT USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own plan validations" ON plan_validations FOR UPDATE USING (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can insert their own plan validations" ON plan_validations FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');
CREATE POLICY "Users can delete their own plan validations" ON plan_validations FOR DELETE USING (user_id = auth.jwt() ->> 'email');

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_plan_validations_user_plan ON plan_validations(user_id, plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_validations_date ON plan_validations(validated_date);
