# 🔧 Guide de résolution - Erreur de contrainte unique (23505)

## Problème
Erreur `23505` : `duplicates key value violates unique constraint 'daily_entries_user_id_date_key'`

Cette erreur se produit quand on essaie d'insérer une entrée quotidienne qui existe déjà pour la même date et le même utilisateur.

## Cause
La table `daily_entries` a une contrainte unique sur `(user_id, date)` pour éviter les doublons, mais le code utilisait `upsert` sans spécifier correctement les colonnes de conflit.

## Solution implémentée

### 1. Code corrigé
Le fichier `src/lib/dataSync.ts` a été mis à jour avec :
- Gestion correcte des conflits avec `onConflict: 'user_id,date'`
- Traitement individuel des entrées pour éviter les conflits
- Mécanisme de fallback : upsert → update → insert

### 2. Nettoyage de la base de données
Exécutez le script `fix-daily-entries-constraint.sql` dans l'éditeur SQL de Supabase :

```sql
-- Supprimer les doublons existants
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
```

## Vérification

### 1. Vérifier qu'il n'y a plus de doublons
```sql
SELECT user_id, date, COUNT(*) as count
FROM daily_entries 
GROUP BY user_id, date 
HAVING COUNT(*) > 1;
```

### 2. Tester la synchronisation
- Ajouter une nouvelle entrée quotidienne
- Modifier une entrée existante
- Vérifier les logs de la console

## Prévention

### 1. Code robuste
Le nouveau code utilise une approche en cascade :
1. **Upsert** avec gestion de conflit
2. **Update** si upsert échoue
3. **Insert** si update échoue

### 2. Logs détaillés
Chaque opération est loggée avec :
- ✅ Succès
- ⚠️ Avertissement
- ❌ Erreur

### 3. Gestion d'erreurs
- Les erreurs sont capturées et loggées
- L'application continue de fonctionner même en cas d'erreur
- Les données locales sont préservées

## Test de la correction

1. **Test d'insertion** : Ajouter une nouvelle entrée
2. **Test de mise à jour** : Modifier une entrée existante
3. **Test de synchronisation** : Forcer une synchronisation complète

## Surveillance

### Logs à surveiller
- `✅ Entrée synchronisée pour [date]`
- `⚠️ Erreur upsert pour [date]`
- `❌ Erreur de synchronisation pour [date]`

### Métriques importantes
- Taux de succès des synchronisations
- Nombre d'entrées synchronisées par jour
- Erreurs de contrainte restantes

## En cas de problème persistant

1. **Vérifier les permissions RLS** : L'utilisateur peut-il modifier ses propres entrées ?
2. **Vérifier la contrainte** : La contrainte unique est-elle bien définie ?
3. **Nettoyer la base** : Y a-t-il encore des doublons ?
4. **Tester avec un nouvel utilisateur** : Le problème persiste-t-il ?

## Commandes utiles

### Vérifier la structure de la table
```sql
\d daily_entries
```

### Voir les contraintes
```sql
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'daily_entries'::regclass;
```

### Statistiques des entrées
```sql
SELECT 
    user_id,
    COUNT(*) as entries,
    MIN(date) as first_date,
    MAX(date) as last_date
FROM daily_entries 
GROUP BY user_id;
```
