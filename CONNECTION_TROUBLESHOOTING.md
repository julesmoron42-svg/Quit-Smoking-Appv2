# 🔧 Dépannage - "Connection string is missing"

## 🚨 Problème
Erreur : "Unable to run query: Connection string is missing"

## ✅ Solutions

### **Solution 1 : Utiliser le Dashboard Supabase (Recommandé)**

1. **Connectez-vous** à [supabase.com](https://supabase.com)
2. **Sélectionnez votre projet** (hdaqsjulitpzckaphujg)
3. **Allez dans** "SQL Editor" (pas l'éditeur de l'app)
4. **Copiez et exécutez** le script `simple_schema_fix.sql`

### **Solution 2 : Vérifier les Clés Supabase**

1. **Dashboard Supabase** → **Settings** → **API**
2. **Vérifiez** que :
   - **URL** : `https://hdaqsjulitpzckaphujg.supabase.co`
   - **Clé anonyme** : Commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Solution 3 : Test de Connexion**

1. **Rechargez** votre app Expo Go
2. **Connectez-vous** avec votre compte
3. **Appuyez sur** le bouton "🔍 Test Conn"
4. **Regardez** les logs dans la console

### **Logs Attendus**
```
🔍 Test de connexion...
🔍 Test de connexion Supabase...
📡 URL Supabase: https://hdaqsjulitpzckaphujg.supabase.co
🔑 Clé anonyme: ✅ Présente
👤 Utilisateur connecté: Oui (votre-user-id)
📊 Test des tables...
✅ Table user_profiles accessible
✅ Table user_settings accessible
✅ Table daily_entries accessible
✅ Table user_streaks accessible
✅ Test de connexion terminé
```

## 🚨 Si Ça Ne Marche Toujours Pas

### **Problèmes Possibles**

1. **Projet Supabase Inactif**
   - Vérifiez que votre projet Supabase est actif
   - Vérifiez que vous avez un plan valide

2. **Clés Incorrectes**
   - Les clés dans le code ne correspondent pas au dashboard
   - Mettez à jour les clés dans `src/lib/supabase.ts`

3. **Tables N'existent Pas**
   - Exécutez le script `supabase-schema.sql` complet
   - Créez les tables manuellement dans le dashboard

4. **Permissions RLS**
   - Vérifiez que les politiques RLS sont activées
   - Vérifiez que vous avez les bonnes permissions

### **Étapes de Diagnostic**

1. **Test de Connexion Basique**
   ```javascript
   // Dans la console de l'app
   console.log('Supabase URL:', supabase.supabaseUrl);
   console.log('Supabase Key:', supabase.supabaseKey ? 'Present' : 'Missing');
   ```

2. **Test de Table Simple**
   ```sql
   -- Dans le SQL Editor de Supabase
   SELECT 1 as test;
   ```

3. **Vérification des Tables**
   ```sql
   -- Dans le SQL Editor de Supabase
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

## 🎯 Actions Immédiates

1. **Exécutez** le script `simple_schema_fix.sql` dans le dashboard Supabase
2. **Testez** avec le bouton "🔍 Test Conn"
3. **Partagez** les logs de la console

## 📞 Support

Si le problème persiste, partagez :
- Les logs exacts de la console
- Le statut de votre projet Supabase
- Les erreurs du dashboard Supabase

---

**Note:** L'erreur "Connection string is missing" indique généralement un problème de configuration ou de permissions, pas un problème de code.

