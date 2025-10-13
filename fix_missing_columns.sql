-- Script pour ajouter les colonnes manquantes à votre base de données Supabase
-- Exécutez ces commandes dans l'éditeur SQL de votre projet Supabase

-- Vérifier et ajouter les colonnes manquantes dans user_profiles
DO $$ 
BEGIN
    -- Ajouter cigs_per_day si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'cigs_per_day') THEN
        ALTER TABLE user_profiles ADD COLUMN cigs_per_day INTEGER NOT NULL DEFAULT 20;
    END IF;
END $$;

-- Vérifier et ajouter les colonnes manquantes dans user_settings
DO $$ 
BEGIN
    -- Ajouter animations_enabled si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_settings' AND column_name = 'animations_enabled') THEN
        ALTER TABLE user_settings ADD COLUMN animations_enabled BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
END $$;

-- Vérifier et ajouter les colonnes manquantes dans daily_entries
DO $$ 
BEGIN
    -- Ajouter goal_cigs si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'daily_entries' AND column_name = 'goal_cigs') THEN
        ALTER TABLE daily_entries ADD COLUMN goal_cigs INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Vérifier et ajouter les colonnes manquantes dans user_streaks
DO $$ 
BEGIN
    -- Ajouter current_streak si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_streaks' AND column_name = 'current_streak') THEN
        ALTER TABLE user_streaks ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Vérifier que toutes les tables existent et ont les bonnes colonnes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('user_profiles', 'user_settings', 'daily_entries', 'user_streaks', 'financial_goals', 'achievements', 'health_benefits')
ORDER BY table_name, ordinal_position;

