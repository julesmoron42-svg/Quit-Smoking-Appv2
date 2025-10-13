-- Script de migration pour passer des UUID aux emails comme user ID
-- ATTENTION: Sauvegardez vos données avant d'exécuter ce script !

-- 1. Créer les nouvelles tables avec email comme ID
-- (Exécutez d'abord le contenu de supabase-schema-email-id.sql)

-- 2. Migrer les données existantes
-- Cette section migre les données de l'ancien schéma vers le nouveau

-- Migrer les profils utilisateurs
INSERT INTO user_profiles_new (
  id, -- L'email sera utilisé comme ID
  started_smoking_years,
  cigs_per_day,
  objective_type,
  reduction_frequency,
  smoking_years,
  smoking_peak_time,
  main_goal,
  target_date,
  main_motivation,
  previous_attempts,
  smoking_triggers,
  smoking_situations,
  onboarding_completed,
  created_at,
  updated_at
)
SELECT 
  au.email as id, -- Utiliser l'email comme nouvelle clé primaire
  up.started_smoking_years,
  up.cigs_per_day,
  up.objective_type,
  up.reduction_frequency,
  up.smoking_years,
  up.smoking_peak_time,
  up.main_goal,
  up.target_date,
  up.main_motivation,
  up.previous_attempts,
  up.smoking_triggers,
  up.smoking_situations,
  up.onboarding_completed,
  up.created_at,
  up.updated_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email IS NOT NULL;

-- Migrer les paramètres utilisateurs
INSERT INTO user_settings_new (
  user_id, -- Référence vers l'email
  price_per_cig,
  currency,
  notifications_allowed,
  language,
  animations_enabled,
  created_at,
  updated_at
)
SELECT 
  au.email as user_id, -- Utiliser l'email comme référence
  us.price_per_cig,
  us.currency,
  us.notifications_allowed,
  us.language,
  us.animations_enabled,
  us.created_at,
  us.updated_at
FROM user_settings us
JOIN auth.users au ON us.user_id = au.id
WHERE au.email IS NOT NULL;

-- Migrer les entrées quotidiennes
INSERT INTO daily_entries_new (
  user_id, -- Référence vers l'email
  date,
  real_cigs,
  goal_cigs,
  emotion,
  objective_met,
  created_at,
  updated_at
)
SELECT 
  au.email as user_id, -- Utiliser l'email comme référence
  de.date,
  de.real_cigs,
  de.goal_cigs,
  de.emotion,
  de.objective_met,
  de.created_at,
  de.updated_at
FROM daily_entries de
JOIN auth.users au ON de.user_id = au.id
WHERE au.email IS NOT NULL;

-- Migrer les objectifs financiers
INSERT INTO financial_goals_new (
  user_id, -- Référence vers l'email
  title,
  price,
  target_date,
  created_at,
  updated_at
)
SELECT 
  au.email as user_id, -- Utiliser l'email comme référence
  fg.title,
  fg.price,
  fg.target_date,
  fg.created_at,
  fg.updated_at
FROM financial_goals fg
JOIN auth.users au ON fg.user_id = au.id
WHERE au.email IS NOT NULL;

-- Migrer les réalisations
INSERT INTO achievements_new (
  user_id, -- Référence vers l'email
  title,
  description,
  icon,
  unlocked_at,
  created_at,
  updated_at
)
SELECT 
  au.email as user_id, -- Utiliser l'email comme référence
  a.title,
  a.description,
  a.icon,
  a.unlocked_at,
  a.created_at,
  a.updated_at
FROM achievements a
JOIN auth.users au ON a.user_id = au.id
WHERE au.email IS NOT NULL;

-- Migrer les séries (streaks)
INSERT INTO user_streaks_new (
  user_id, -- Référence vers l'email
  last_date_connected,
  current_streak,
  created_at,
  updated_at
)
SELECT 
  au.email as user_id, -- Utiliser l'email comme référence
  us.last_date_connected,
  us.current_streak,
  us.created_at,
  us.updated_at
FROM user_streaks us
JOIN auth.users au ON us.user_id = au.id
WHERE au.email IS NOT NULL;

-- Migrer les bienfaits santé
INSERT INTO health_benefits_new (
  id,
  user_id, -- Référence vers l'email
  title,
  description,
  time_required,
  unlocked,
  unlocked_at,
  created_at,
  updated_at
)
SELECT 
  hb.id,
  au.email as user_id, -- Utiliser l'email comme référence
  hb.title,
  hb.description,
  hb.time_required,
  hb.unlocked,
  hb.unlocked_at,
  hb.created_at,
  hb.updated_at
FROM health_benefits hb
JOIN auth.users au ON hb.user_id = au.id
WHERE au.email IS NOT NULL;

-- 3. Vérifier la migration
-- Vérifiez que toutes les données ont été migrées correctement

-- Compter les enregistrements dans les anciennes tables
SELECT 'user_profiles' as table_name, COUNT(*) as old_count FROM user_profiles
UNION ALL
SELECT 'user_settings', COUNT(*) FROM user_settings
UNION ALL
SELECT 'daily_entries', COUNT(*) FROM daily_entries
UNION ALL
SELECT 'financial_goals', COUNT(*) FROM financial_goals
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'user_streaks', COUNT(*) FROM user_streaks
UNION ALL
SELECT 'health_benefits', COUNT(*) FROM health_benefits;

-- Compter les enregistrements dans les nouvelles tables
SELECT 'user_profiles_new' as table_name, COUNT(*) as new_count FROM user_profiles_new
UNION ALL
SELECT 'user_settings_new', COUNT(*) FROM user_settings_new
UNION ALL
SELECT 'daily_entries_new', COUNT(*) FROM daily_entries_new
UNION ALL
SELECT 'financial_goals_new', COUNT(*) FROM financial_goals_new
UNION ALL
SELECT 'achievements_new', COUNT(*) FROM achievements_new
UNION ALL
SELECT 'user_streaks_new', COUNT(*) FROM user_streaks_new
UNION ALL
SELECT 'health_benefits_new', COUNT(*) FROM health_benefits_new;

-- 4. Une fois la migration vérifiée, remplacer les anciennes tables
-- ATTENTION: Cette étape supprime définitivement les anciennes données !

-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TABLE IF EXISTS user_settings CASCADE;
-- DROP TABLE IF EXISTS daily_entries CASCADE;
-- DROP TABLE IF EXISTS financial_goals CASCADE;
-- DROP TABLE IF EXISTS achievements CASCADE;
-- DROP TABLE IF EXISTS user_streaks CASCADE;
-- DROP TABLE IF EXISTS health_benefits CASCADE;

-- ALTER TABLE user_profiles_new RENAME TO user_profiles;
-- ALTER TABLE user_settings_new RENAME TO user_settings;
-- ALTER TABLE daily_entries_new RENAME TO daily_entries;
-- ALTER TABLE financial_goals_new RENAME TO financial_goals;
-- ALTER TABLE achievements_new RENAME TO achievements;
-- ALTER TABLE user_streaks_new RENAME TO user_streaks;
-- ALTER TABLE health_benefits_new RENAME TO health_benefits;
