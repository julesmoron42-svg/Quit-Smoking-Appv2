-- Script de vérification des données de test pour jules.moron@gmail.com
-- Ce script vérifie que toutes les données ont été correctement insérées

-- 1. Vérifier le profil utilisateur
SELECT 'PROFIL UTILISATEUR' as section, * FROM user_profiles WHERE id = 'jules.moron@gmail.com';

-- 2. Vérifier les paramètres utilisateur
SELECT 'PARAMÈTRES UTILISATEUR' as section, * FROM user_settings WHERE user_id = 'jules.moron@gmail.com';

-- 3. Vérifier la session du chrono
SELECT 'SESSION CHRONO' as section, * FROM user_timer_sessions WHERE user_id = 'jules.moron@gmail.com';

-- 4. Vérifier les entrées quotidiennes (compter et voir quelques exemples)
SELECT 'ENTRÉES QUOTIDIENNES - COUNT' as section, COUNT(*) as total_entries FROM daily_entries WHERE user_id = 'jules.moron@gmail.com';

SELECT 'ENTRÉES QUOTIDIENNES - EXEMPLES' as section, date, real_cigs, goal_cigs, emotion, objective_met 
FROM daily_entries 
WHERE user_id = 'jules.moron@gmail.com' 
ORDER BY date 
LIMIT 10;

-- 5. Vérifier les dernières entrées
SELECT 'DERNIÈRES ENTRÉES' as section, date, real_cigs, goal_cigs, emotion, objective_met 
FROM daily_entries 
WHERE user_id = 'jules.moron@gmail.com' 
ORDER BY date DESC 
LIMIT 5;

-- 6. Vérifier le streak
SELECT 'STREAK' as section, * FROM user_streaks WHERE user_id = 'jules.moron@gmail.com';

-- 7. Vérifier les objectifs financiers
SELECT 'OBJECTIFS FINANCIERS' as section, * FROM financial_goals WHERE user_id = 'jules.moron@gmail.com';

-- 8. Vérifier les réalisations
SELECT 'RÉALISATIONS' as section, * FROM achievements WHERE user_id = 'jules.moron@gmail.com';

-- 9. Statistiques de progression
SELECT 'STATISTIQUES DE PROGRESSION' as section,
    COUNT(*) as total_days,
    AVG(real_cigs) as avg_real_cigs,
    AVG(goal_cigs) as avg_goal_cigs,
    COUNT(CASE WHEN objective_met = true THEN 1 END) as days_objective_met,
    ROUND((COUNT(CASE WHEN objective_met = true THEN 1 END) * 100.0 / COUNT(*)), 2) as success_rate_percent
FROM daily_entries 
WHERE user_id = 'jules.moron@gmail.com';

-- 10. Évolution des objectifs sur les 40 jours
SELECT 'ÉVOLUTION DES OBJECTIFS' as section,
    CASE 
        WHEN date < CURRENT_DATE - INTERVAL '35 days' THEN 'Semaine 1 (jours 1-7)'
        WHEN date < CURRENT_DATE - INTERVAL '28 days' THEN 'Semaine 2 (jours 8-14)'
        WHEN date < CURRENT_DATE - INTERVAL '21 days' THEN 'Semaine 3 (jours 15-21)'
        WHEN date < CURRENT_DATE - INTERVAL '14 days' THEN 'Semaine 4 (jours 22-28)'
        WHEN date < CURRENT_DATE - INTERVAL '7 days' THEN 'Semaine 5 (jours 29-35)'
        ELSE 'Semaine 6+ (jours 36-40)'
    END as period,
    COUNT(*) as days_count,
    AVG(goal_cigs) as avg_goal_cigs,
    AVG(real_cigs) as avg_real_cigs,
    COUNT(CASE WHEN objective_met = true THEN 1 END) as successful_days
FROM daily_entries 
WHERE user_id = 'jules.moron@gmail.com'
GROUP BY 
    CASE 
        WHEN date < CURRENT_DATE - INTERVAL '35 days' THEN 'Semaine 1 (jours 1-7)'
        WHEN date < CURRENT_DATE - INTERVAL '28 days' THEN 'Semaine 2 (jours 8-14)'
        WHEN date < CURRENT_DATE - INTERVAL '21 days' THEN 'Semaine 3 (jours 15-21)'
        WHEN date < CURRENT_DATE - INTERVAL '14 days' THEN 'Semaine 4 (jours 22-28)'
        WHEN date < CURRENT_DATE - INTERVAL '7 days' THEN 'Semaine 5 (jours 29-35)'
        ELSE 'Semaine 6+ (jours 36-40)'
    END
ORDER BY 
    CASE 
        WHEN date < CURRENT_DATE - INTERVAL '35 days' THEN 1
        WHEN date < CURRENT_DATE - INTERVAL '28 days' THEN 2
        WHEN date < CURRENT_DATE - INTERVAL '21 days' THEN 3
        WHEN date < CURRENT_DATE - INTERVAL '14 days' THEN 4
        WHEN date < CURRENT_DATE - INTERVAL '7 days' THEN 5
        ELSE 6
    END;

-- 11. Calcul des économies potentielles
SELECT 'ÉCONOMIES POTENTIELLES' as section,
    COUNT(*) as total_days,
    SUM(20 - real_cigs) as total_cigarettes_avoided,
    ROUND(SUM(20 - real_cigs) * 0.65, 2) as total_money_saved_euros
FROM daily_entries 
WHERE user_id = 'jules.moron@gmail.com' AND real_cigs < 20;

-- 12. Vérifier la cohérence des données
SELECT 'VÉRIFICATION COHÉRENCE' as section,
    'Dates manquantes' as check_type,
    COUNT(*) as issues_count
FROM (
    SELECT generate_series(
        CURRENT_DATE - INTERVAL '39 days',
        CURRENT_DATE,
        INTERVAL '1 day'
    )::date as expected_date
) dates
LEFT JOIN daily_entries de ON de.date = dates.expected_date AND de.user_id = 'jules.moron@gmail.com'
WHERE de.date IS NULL

UNION ALL

SELECT 'VÉRIFICATION COHÉRENCE' as section,
    'Objectifs incohérents' as check_type,
    COUNT(*) as issues_count
FROM daily_entries 
WHERE user_id = 'jules.moron@gmail.com' 
AND (goal_cigs < 0 OR real_cigs < 0 OR goal_cigs > 25 OR real_cigs > 25);
