-- Script pour insérer des données de test pour jules.moron@gmail.com
-- 40 jours de données avec progression réaliste et streak maintenu

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
  20, -- 20 cigarettes par jour au début
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

-- Créons la session du chrono
INSERT INTO user_timer_sessions (
  user_id,
  is_running,
  start_timestamp,
  elapsed_before_pause
) VALUES (
  'jules.moron@gmail.com',
  true,
  EXTRACT(EPOCH FROM NOW() - INTERVAL '40 days')::BIGINT * 1000, -- Commencé il y a 40 jours
  (40 * 24 * 60 * 60 * 1000)::BIGINT - (12 * 60 * 60 * 1000)::BIGINT -- 40 jours moins 12h (temps écoulé actuel)
) ON CONFLICT (user_id) DO NOTHING;

-- Génération des entrées quotidiennes pour 40 jours
-- Simulation d'une progression réaliste avec quelques écarts

DO $$
DECLARE
    start_date DATE := CURRENT_DATE - INTERVAL '39 days';
    current_date DATE;
    day_index INTEGER;
    goal_cigs INTEGER;
    real_cigs INTEGER;
    emotion_choice TEXT;
    emotions TEXT[] := ARRAY['happy', 'proud', 'frustrated', 'anxious', 'confident', 'disappointed', 'relieved', 'stressed'];
    objective_met BOOLEAN;
BEGIN
    FOR day_index IN 0..39 LOOP
        current_date := start_date + (day_index * INTERVAL '1 day');
        
        -- Calcul de l'objectif progressif (réduction d'1 cigarette par semaine)
        goal_cigs := GREATEST(0, 20 - (day_index / 7));
        
        -- Simulation réaliste des cigarettes fumées
        -- Généralement proche de l'objectif, avec quelques écarts
        CASE 
            WHEN day_index < 7 THEN
                -- Première semaine : légèrement au-dessus de l'objectif
                real_cigs := goal_cigs + (RANDOM() * 3)::INTEGER;
            WHEN day_index BETWEEN 7 AND 14 THEN
                -- Deuxième semaine : proche de l'objectif
                real_cigs := goal_cigs + (RANDOM() * 2 - 1)::INTEGER;
            WHEN day_index BETWEEN 15 AND 21 THEN
                -- Troisième semaine : parfois en dessous de l'objectif
                real_cigs := GREATEST(0, goal_cigs + (RANDOM() * 3 - 1)::INTEGER);
            WHEN day_index BETWEEN 22 AND 28 THEN
                -- Quatrième semaine : souvent en dessous
                real_cigs := GREATEST(0, goal_cigs + (RANDOM() * 2 - 1)::INTEGER);
            ELSE
                -- Cinquième semaine et plus : très bon contrôle
                real_cigs := GREATEST(0, goal_cigs + (RANDOM() * 2 - 1)::INTEGER);
        END CASE;
        
        -- Assurer que real_cigs ne soit pas négatif
        real_cigs := GREATEST(0, real_cigs);
        
        -- Déterminer si l'objectif est atteint
        objective_met := real_cigs <= goal_cigs;
        
        -- Choix d'émotion basé sur la performance
        IF objective_met THEN
            emotion_choice := emotions[1 + (RANDOM() * 3)::INTEGER]; -- happy, proud, confident, relieved
        ELSE
            emotion_choice := emotions[4 + (RANDOM() * 4)::INTEGER]; -- frustrated, anxious, disappointed, stressed
        END IF;
        
        -- Insérer l'entrée quotidienne
        INSERT INTO daily_entries (
            user_id,
            date,
            real_cigs,
            goal_cigs,
            emotion,
            objective_met
        ) VALUES (
            'jules.moron@gmail.com',
            current_date,
            real_cigs,
            goal_cigs,
            emotion_choice,
            objective_met
        ) ON CONFLICT (user_id, date) DO UPDATE SET
            real_cigs = EXCLUDED.real_cigs,
            goal_cigs = EXCLUDED.goal_cigs,
            emotion = EXCLUDED.emotion,
            objective_met = EXCLUDED.objective_met,
            updated_at = NOW();
            
    END LOOP;
END $$;

-- Mettre à jour le streak pour refléter les 40 jours de connexion
INSERT INTO user_streaks (
    user_id,
    last_date_connected,
    current_streak
) VALUES (
    'jules.moron@gmail.com',
    CURRENT_DATE,
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

-- Message de confirmation
SELECT 'Données de test insérées avec succès pour jules.moron@gmail.com !' as message,
       '40 jours de données avec progression réaliste' as details,
       'Streak de 40 jours maintenu' as streak_info;
