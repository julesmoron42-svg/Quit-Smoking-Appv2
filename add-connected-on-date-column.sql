-- Ajouter la colonne connected_on_date à la table daily_entries
-- pour distinguer les connexions réelles des saisies rétroactives

ALTER TABLE daily_entries 
ADD COLUMN IF NOT EXISTS connected_on_date DATE;

-- Commentaire pour expliquer le champ
COMMENT ON COLUMN daily_entries.connected_on_date IS 'Date de connexion réelle (YYYY-MM-DD) - pour distinguer les saisies rétroactives des connexions quotidiennes réelles';

-- Mettre à jour les entrées existantes pour qu'elles aient la même date de connexion que leur date d'entrée
-- (on assume que les entrées existantes étaient des connexions réelles)
UPDATE daily_entries 
SET connected_on_date = date 
WHERE connected_on_date IS NULL;
