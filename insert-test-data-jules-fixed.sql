-- Script corrigé pour insérer des données de test pour jules.moron@gmail.com
-- Problèmes corrigés : calculs des cigarettes évitées, streak, graine, frise

-- D'abord, créons le profil utilisateur s'il n'existe pas
INSERT INTO user_profiles (
  id,
  started_smoking_years,
  cigs_per_day,
  objective_type,
  reduction_frequency,
  smoking_years,
  smoking_peak_time,
  main_goal,
  main_motivation,
  previous_attempts,
  smoking_triggers,
  smoking_situations,
  onboarding_completed
) VALUES (
  'jules.moron@gmail.com',
  5, -- 5 ans de tabagisme
  20, -- 20 cigarettes par jour au début (IMPORTANT: c'est la référence pour les calculs)
  'progressive',
  1, -- Réduction d'1 cigarette par semaine
  5,
  'after_meals',
  'progressive_reduction',
  'health',
  'several_times',
  ARRAY['stress', 'after_meals', 'coffee_alcohol'],
  ARRAY['work', 'evenings', 'weekends'],
  true
) ON CONFLICT (id) DO NOTHING;

-- Créons les paramètres utilisateur
INSERT INTO user_settings (
  user_id,
  price_per_cig,
  currency,
  notifications_allowed,
  language,
  animations_enabled
) VALUES (
  'jules.moron@gmail.com',
  0.65,
  '€',
  true,
  'fr',
  true
) ON CONFLICT (user_id) DO NOTHING;

-- Créons la session du chrono avec des valeurs simplifiées
INSERT INTO user_timer_sessions (
  user_id,
  is_running,
  start_timestamp,
  elapsed_before_pause
) VALUES (
  'jules.moron@gmail.com',
  true,
  1609459200000, -- Timestamp fixe pour éviter les calculs complexes
  3456000000 -- 40 jours en millisecondes (40 * 24 * 60 * 60 * 1000)
) ON CONFLICT (user_id) DO NOTHING;

-- IMPORTANT: Les données doivent être insérées dans l'ordre chronologique
-- et commencer par une date récente pour que le streak fonctionne

-- Semaine 6 (jours 36-40): objectif 15, les plus récents
INSERT INTO daily_entries (user_id, date, real_cigs, goal_cigs, emotion, objective_met) VALUES
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '4 days', 14, 15, 'proud', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '3 days', 15, 15, 'happy', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '2 days', 13, 15, 'confident', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '1 day', 14, 15, 'relieved', true),
('jules.moron@gmail.com', CURRENT_DATE, 15, 15, 'proud', true)
ON CONFLICT (user_id, date) DO UPDATE SET
  real_cigs = EXCLUDED.real_cigs,
  goal_cigs = EXCLUDED.goal_cigs,
  emotion = EXCLUDED.emotion,
  objective_met = EXCLUDED.objective_met,
  updated_at = NOW();

-- Semaine 5 (jours 29-35): objectif 16
INSERT INTO daily_entries (user_id, date, real_cigs, goal_cigs, emotion, objective_met) VALUES
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '11 days', 15, 16, 'proud', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '10 days', 16, 16, 'happy', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '9 days', 14, 16, 'confident', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '8 days', 15, 16, 'relieved', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '7 days', 16, 16, 'proud', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '6 days', 14, 16, 'happy', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '5 days', 15, 16, 'confident', true)
ON CONFLICT (user_id, date) DO UPDATE SET
  real_cigs = EXCLUDED.real_cigs,
  goal_cigs = EXCLUDED.goal_cigs,
  emotion = EXCLUDED.emotion,
  objective_met = EXCLUDED.objective_met,
  updated_at = NOW();

-- Semaine 4 (jours 22-28): objectif 17
INSERT INTO daily_entries (user_id, date, real_cigs, goal_cigs, emotion, objective_met) VALUES
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '18 days', 16, 17, 'proud', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '17 days', 17, 17, 'happy', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '16 days', 15, 17, 'confident', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '15 days', 16, 17, 'relieved', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '14 days', 17, 17, 'proud', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '13 days', 15, 17, 'happy', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '12 days', 16, 17, 'confident', true)
ON CONFLICT (user_id, date) DO UPDATE SET
  real_cigs = EXCLUDED.real_cigs,
  goal_cigs = EXCLUDED.goal_cigs,
  emotion = EXCLUDED.emotion,
  objective_met = EXCLUDED.objective_met,
  updated_at = NOW();

-- Semaine 3 (jours 15-21): objectif 18
INSERT INTO daily_entries (user_id, date, real_cigs, goal_cigs, emotion, objective_met) VALUES
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '25 days', 19, 18, 'frustrated', false),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '24 days', 17, 18, 'proud', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '23 days', 18, 18, 'happy', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '22 days', 19, 18, 'anxious', false),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '21 days', 17, 18, 'confident', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '20 days', 18, 18, 'relieved', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '19 days', 16, 18, 'proud', true)
ON CONFLICT (user_id, date) DO UPDATE SET
  real_cigs = EXCLUDED.real_cigs,
  goal_cigs = EXCLUDED.goal_cigs,
  emotion = EXCLUDED.emotion,
  objective_met = EXCLUDED.objective_met,
  updated_at = NOW();

-- Semaine 2 (jours 8-14): objectif 19
INSERT INTO daily_entries (user_id, date, real_cigs, goal_cigs, emotion, objective_met) VALUES
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '32 days', 18, 19, 'proud', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '31 days', 19, 19, 'happy', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '30 days', 17, 19, 'confident', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '29 days', 18, 19, 'relieved', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '28 days', 19, 19, 'proud', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '27 days', 17, 19, 'happy', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '26 days', 18, 19, 'confident', true)
ON CONFLICT (user_id, date) DO UPDATE SET
  real_cigs = EXCLUDED.real_cigs,
  goal_cigs = EXCLUDED.goal_cigs,
  emotion = EXCLUDED.emotion,
  objective_met = EXCLUDED.objective_met,
  updated_at = NOW();

-- Semaine 1 (jours 1-7): objectif 20, les plus anciens
INSERT INTO daily_entries (user_id, date, real_cigs, goal_cigs, emotion, objective_met) VALUES
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '39 days', 22, 20, 'frustrated', false),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '38 days', 20, 20, 'happy', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '37 days', 23, 20, 'anxious', false),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '36 days', 19, 20, 'proud', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '35 days', 21, 20, 'stressed', false),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '34 days', 20, 20, 'confident', true),
('jules.moron@gmail.com', CURRENT_DATE - INTERVAL '33 days', 18, 20, 'relieved', true)
ON CONFLICT (user_id, date) DO UPDATE SET
  real_cigs = EXCLUDED.real_cigs,
  goal_cigs = EXCLUDED.goal_cigs,
  emotion = EXCLUDED.emotion,
  objective_met = EXCLUDED.objective_met,
  updated_at = NOW();

-- Mettre à jour le streak pour refléter les 40 jours de connexion
-- IMPORTANT: Le streak doit pointer vers la dernière entrée (aujourd'hui)
INSERT INTO user_streaks (
    user_id,
    last_date_connected,
    current_streak
) VALUES (
    'jules.moron@gmail.com',
    CURRENT_DATE, -- Dernière date = aujourd'hui
    40
) ON CONFLICT (user_id) DO UPDATE SET
    last_date_connected = CURRENT_DATE,
    current_streak = 40,
    updated_at = NOW();

-- Ajouter quelques réalisations débloquées
INSERT INTO achievements (
    user_id,
    title,
    description,
    icon,
    unlocked_at
) VALUES 
    ('jules.moron@gmail.com', 'Premier jour', 'Vous avez tenu votre premier jour sans fumer !', '🎉', CURRENT_DATE - INTERVAL '39 days'),
    ('jules.moron@gmail.com', 'Une semaine', '7 jours consécutifs sans fumer !', '🌟', CURRENT_DATE - INTERVAL '32 days'),
    ('jules.moron@gmail.com', 'Deux semaines', '14 jours consécutifs sans fumer !', '🏆', CURRENT_DATE - INTERVAL '25 days'),
    ('jules.moron@gmail.com', 'Un mois', '30 jours consécutifs sans fumer !', '🎊', CURRENT_DATE - INTERVAL '9 days')
ON CONFLICT DO NOTHING;

-- Message de confirmation avec calculs attendus
SELECT 
    'Données de test insérées avec succès pour jules.moron@gmail.com !' as message,
    '40 jours de données avec progression réaliste' as details,
    'Streak de 40 jours maintenu' as streak_info,
    'Cigarettes évitées attendues: ~109' as cigarettes_info,
    'Économies attendues: ~70.85€' as savings_info,
    'Graine attendue: 🌲 (petit arbre)' as seed_info;
