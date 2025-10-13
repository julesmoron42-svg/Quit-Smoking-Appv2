-- Script simplifié pour corriger le schéma
-- Exécutez dans le SQL Editor de Supabase

-- Ajouter les colonnes manquantes
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS cigs_per_day INTEGER NOT NULL DEFAULT 20;

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS animations_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE daily_entries 
ADD COLUMN IF NOT EXISTS goal_cigs INTEGER NOT NULL DEFAULT 0;

ALTER TABLE user_streaks 
ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0;

-- Vérifier que les colonnes existent
SELECT 'user_profiles' as table_name, column_name 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('cigs_per_day', 'started_smoking_years', 'objective_type')
UNION ALL
SELECT 'user_settings' as table_name, column_name 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name IN ('animations_enabled', 'price_per_cig', 'currency')
UNION ALL
SELECT 'daily_entries' as table_name, column_name 
FROM information_schema.columns 
WHERE table_name = 'daily_entries' 
AND column_name IN ('goal_cigs', 'real_cigs', 'objective_met')
UNION ALL
SELECT 'user_streaks' as table_name, column_name 
FROM information_schema.columns 
WHERE table_name = 'user_streaks' 
AND column_name IN ('current_streak', 'last_date_connected');

