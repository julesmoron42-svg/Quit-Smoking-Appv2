-- Script de diagnostic pour identifier les problèmes avec les cigarettes évitées et économies

-- 1. Vérifier le profil utilisateur
SELECT '=== PROFIL UTILISATEUR ===' as section;
SELECT 
    id,
    cigs_per_day,
    objective_type,
    reduction_frequency,
    onboarding_completed
FROM user_profiles 
WHERE id = 'jules.moron@gmail.com';

-- 2. Vérifier les paramètres utilisateur
SELECT '=== PARAMÈTRES UTILISATEUR ===' as section;
SELECT 
    user_id,
    price_per_cig,
    currency
FROM user_settings 
WHERE user_id = 'jules.moron@gmail.com';

-- 3. Vérifier quelques entrées quotidiennes
SELECT '=== ECHANTILLON D ENTREES QUOTIDIENNES ===' as section;
SELECT 
    date,
    real_cigs,
    goal_cigs,
    emotion,
    objective_met,
    -- Calcul des cigarettes évitées pour cette entrée
    (20 - real_cigs) as cigarettes_evitees_ce_jour,
    -- Calcul des économies pour cette entrée
    ((20 - real_cigs) * 0.65) as economies_ce_jour
FROM daily_entries 
WHERE user_id = 'jules.moron@gmail.com' 
ORDER BY date DESC 
LIMIT 10;

-- 4. Calculer le total des cigarettes évitées
SELECT '=== CALCUL TOTAL CIGARETTES EVITEES ===' as section;
SELECT 
    COUNT(*) as total_entrees,
    SUM(real_cigs) as total_cigarettes_fumees,
    SUM(20 - real_cigs) as total_cigarettes_evitees,
    SUM((20 - real_cigs) * 0.65) as total_economies_euros
FROM daily_entries 
WHERE user_id = 'jules.moron@gmail.com' 
AND real_cigs < 20;

-- 5. Vérifier les jours où l'utilisateur a fumé plus que sa consommation initiale
SELECT '=== JOURS AVEC DEPASSEMENT ===' as section;
SELECT 
    date,
    real_cigs,
    goal_cigs,
    (real_cigs - 20) as cigarettes_en_plus
FROM daily_entries 
WHERE user_id = 'jules.moron@gmail.com' 
AND real_cigs >= 20
ORDER BY date DESC;

-- 6. Statistiques par semaine
SELECT '=== STATISTIQUES PAR SEMAINE ===' as section;
SELECT 
    CASE 
        WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN 'Semaine actuelle'
        WHEN date >= CURRENT_DATE - INTERVAL '14 days' THEN 'Semaine -1'
        WHEN date >= CURRENT_DATE - INTERVAL '21 days' THEN 'Semaine -2'
        WHEN date >= CURRENT_DATE - INTERVAL '28 days' THEN 'Semaine -3'
        WHEN date >= CURRENT_DATE - INTERVAL '35 days' THEN 'Semaine -4'
        ELSE 'Semaine -5+'
    END as semaine,
    COUNT(*) as jours,
    AVG(real_cigs) as moyenne_cigarettes_jour,
    SUM(20 - real_cigs) as cigarettes_evitees,
    SUM((20 - real_cigs) * 0.65) as economies_euros
FROM daily_entries 
WHERE user_id = 'jules.moron@gmail.com'
GROUP BY 
    CASE 
        WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN 'Semaine actuelle'
        WHEN date >= CURRENT_DATE - INTERVAL '14 days' THEN 'Semaine -1'
        WHEN date >= CURRENT_DATE - INTERVAL '21 days' THEN 'Semaine -2'
        WHEN date >= CURRENT_DATE - INTERVAL '28 days' THEN 'Semaine -3'
        WHEN date >= CURRENT_DATE - INTERVAL '35 days' THEN 'Semaine -4'
        ELSE 'Semaine -5+'
    END
ORDER BY semaine;

-- 7. Vérifier la cohérence des dates
SELECT '=== VÉRIFICATION COHÉRENCE DATES ===' as section;
SELECT 
    MIN(date) as premiere_date,
    MAX(date) as derniere_date,
    COUNT(DISTINCT date) as nombre_jours_uniques,
    COUNT(*) as nombre_entrees_total
FROM daily_entries 
WHERE user_id = 'jules.moron@gmail.com';

-- 8. Calculer le streak
SELECT '=== CALCUL DU STREAK ===' as section;
SELECT 
    last_date_connected,
    current_streak
FROM user_streaks 
WHERE user_id = 'jules.moron@gmail.com';

-- 9. Vérifier les jours manqués dans la série
SELECT '=== JOURS MANQUES DANS LA SERIE ===' as section;
WITH date_series AS (
    SELECT generate_series(
        CURRENT_DATE - INTERVAL '39 days',
        CURRENT_DATE,
        INTERVAL '1 day'
    )::date as expected_date
)
SELECT 
    ds.expected_date,
    CASE WHEN de.date IS NOT NULL THEN '✓' ELSE '✗' END as present,
    de.real_cigs,
    de.goal_cigs
FROM date_series ds
LEFT JOIN daily_entries de ON de.date = ds.expected_date AND de.user_id = 'jules.moron@gmail.com'
WHERE de.date IS NULL
ORDER BY ds.expected_date;
