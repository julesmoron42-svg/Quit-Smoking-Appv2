-- Script pour diagnostiquer et corriger les problèmes de contraintes uniques
-- dans la table daily_entries

-- 1. Vérifier s'il y a des doublons dans la table daily_entries
SELECT user_id, date, COUNT(*) as count
FROM daily_entries 
GROUP BY user_id, date 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Afficher les entrées en doublon avec leurs détails
SELECT de1.*, 'DOUBLON' as status
FROM daily_entries de1
WHERE EXISTS (
    SELECT 1 
    FROM daily_entries de2 
    WHERE de2.user_id = de1.user_id 
    AND de2.date = de1.date 
    AND de2.id != de1.id
)
ORDER BY de1.user_id, de1.date, de1.created_at;

-- 3. Supprimer les doublons (garder seulement la plus récente)
WITH duplicates AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id, date 
               ORDER BY updated_at DESC, created_at DESC
           ) as rn
    FROM daily_entries
)
DELETE FROM daily_entries 
WHERE id IN (
    SELECT id 
    FROM duplicates 
    WHERE rn > 1
);

-- 4. Vérifier que la contrainte unique est bien en place
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'daily_entries'::regclass
AND contype = 'u';

-- 5. Recréer la contrainte unique si nécessaire
-- (À exécuter seulement si la contrainte n'existe pas)
-- ALTER TABLE daily_entries ADD CONSTRAINT daily_entries_user_id_date_key UNIQUE (user_id, date);

-- 6. Vérifier le résultat final
SELECT 
    COUNT(*) as total_entries,
    COUNT(DISTINCT (user_id, date)) as unique_user_date_combinations,
    COUNT(*) - COUNT(DISTINCT (user_id, date)) as potential_duplicates
FROM daily_entries;

-- 7. Afficher les statistiques par utilisateur
SELECT 
    user_id,
    COUNT(*) as total_entries,
    MIN(date) as first_entry,
    MAX(date) as last_entry
FROM daily_entries 
GROUP BY user_id
ORDER BY total_entries DESC;
