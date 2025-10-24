export interface PlanDay {
  jour: number;
  nom: string;
  objectif: string;
  action: string;
  info_sante: string;
  motivation: string;
  stat: string;
  allegeance: string;
}

export interface PlanContent {
  plan_id: string;
  titre: string;
  jours: PlanDay[];
}

export const PLAN_CONTENT: Record<string, PlanContent> = {
  P1: {
    plan_id: 'P1',
    titre: 'Arrêt Doux — 7 jours pour redevenir libre',
    jours: [
      {
        jour: 0,
        nom: 'Le déclic',
        objectif: 'Ancrer ta décision et poser le cadre.',
        action: 'Choisis ta date d\'arrêt (aujourd\'hui/demain) et écris : « Je reprends le contrôle. »',
        info_sante: 'Se décider diminue l\'anxiété liée au changement : ton cerveau a besoin d\'un cap.',
        motivation: 'Tu ne perds rien. Tu récupères ta liberté.',
        stat: '0 cigarette évitée | 0 € | 0 jour de vie',
        allegeance: 'Je jure d\'honorer ma décision aujourd\'hui ✨'
      },
      {
        jour: 1,
        nom: 'Le vrai départ',
        objectif: 'Observer tes envies sans y céder.',
        action: 'À chaque craving : ouvre l\'app, clique « craving noté », respiration 4-7-8 (2 min).',
        info_sante: 'Un craving non suivi dure rarement plus de 3 minutes.',
        motivation: 'Chaque envie que tu ne suis pas est une chaîne qui se brise.',
        stat: '10 cigarettes évitées | 14 € | +0,2 jour',
        allegeance: 'Je jure de rester présent à chaque envie 🌌'
      },
      {
        jour: 2,
        nom: 'Reprendre le matin',
        objectif: 'Changer le rituel du réveil.',
        action: 'Verre d\'eau + respiration 4-7-8 avant téléphone/café.',
        info_sante: 'Dès 24–48h, le CO baisse et l\'oxygénation s\'améliore.',
        motivation: 'Tu ne retires rien à ta vie : tu lui redonnes son souffle.',
        stat: '20 | 28 € | +0,4',
        allegeance: 'Je jure de commencer ma journée en liberté'
      },
      {
        jour: 3,
        nom: 'Calmer sans compenser',
        objectif: 'Gérer l\'envie sans fuite.',
        action: 'Respiration carrée 4-4-4-4 (3 cycles) + marche 5 min après craving.',
        info_sante: 'La nicotine calmait un manque qu\'elle entretenait elle-même.',
        motivation: 'Le calme ne s\'achète pas, il se respire.',
        stat: '30 | 42 € | +0,6',
        allegeance: 'Je jure de choisir le souffle au réflexe'
      },
      {
        jour: 4,
        nom: 'L\'envie fantôme',
        objectif: 'Voir le craving comme une pensée, pas un besoin.',
        action: 'Note l\'heure/lieu/contexte de ton craving le plus fort.',
        info_sante: 'Après 72h, la dépendance est surtout cognitive/comportementale.',
        motivation: 'Observe la vague : elle passe toujours.',
        stat: '40 | 56 € | +0,8',
        allegeance: 'Je jure d\'observer sans suivre'
      },
      {
        jour: 5,
        nom: 'Redéfinir la détente',
        objectif: 'Associer le repos à autre chose que fumer.',
        action: 'Lance « pluie » 3 min + étirements épaules/nuque.',
        info_sante: 'Le goût et l\'odorat commencent à revenir après 48–72h.',
        motivation: 'La vraie détente ne brûle rien.',
        stat: '55 | 77 € | +1,1',
        allegeance: 'Je jure d\'offrir du vrai repos à mon corps'
      },
      {
        jour: 6,
        nom: 'Réparer l\'énergie',
        objectif: 'Sentir les bénéfices physiques.',
        action: 'Hydratation + 15 min de marche ou sport léger.',
        info_sante: 'Rythme cardiaque et tension diminuent quelques jours après l\'arrêt.',
        motivation: 'Tu n\'as pas besoin de fumer pour exister. Tu existes mieux sans.',
        stat: '65 | 91 € | +1,3',
        allegeance: 'Je jure d\'honorer mon énergie retrouvée'
      },
      {
        jour: 7,
        nom: 'Le nouveau toi',
        objectif: 'Clore la phase physique, ouvrir la stabilisation.',
        action: 'Écris à ton « ancien toi » puis active la prévention rechute.',
        info_sante: 'Après 1 semaine, l\'endurance s\'améliore déjà perceptiblement.',
        motivation: 'Tu n\'as pas arrêté : tu as changé d\'univers.',
        stat: '70 | 95 € | +1,5',
        allegeance: 'Je jure de protéger ma liberté chaque jour'
      }
    ]
  },
  P2: {
    plan_id: 'P2',
    titre: 'Arrêt Progressif — 21 jours pour reprogrammer',
    jours: [
      {
        jour: 1,
        nom: 'Cartographier l\'automatisme',
        objectif: 'Repérer les moments-clés où tu fumes.',
        action: 'Note 3 moments récurrents (matin, pause, après-repas).',
        info_sante: 'Identifier les déclencheurs augmente x2 la réussite.',
        motivation: 'Comprendre, c\'est déjà reprendre la main.',
        stat: '0 | 0 € | 0',
        allegeance: 'Je jure d\'observer sans me juger'
      },
      {
        jour: 2,
        nom: 'Repousser la première',
        objectif: 'Décaler la 1re cigarette de 60 min.',
        action: 'Verre d\'eau + respiration 4-7-8 dès réveil.',
        info_sante: 'Retarder la 1re cigarette baisse la dépendance physique.',
        motivation: 'Tu ne t\'interdis rien : tu décides quand.',
        stat: '2 | 3 € | +0,05',
        allegeance: 'Je jure d\'ouvrir ma journée sans nicotine'
      },
      {
        jour: 3,
        nom: '−1 aujourd\'hui',
        objectif: 'Réduire d\'1 cigarette.',
        action: 'Remplacer le moment le plus « facile » par 2 min de marche.',
        info_sante: 'De petites victoires soutenues > gros effort isolé.',
        motivation: 'Moins aujourd\'hui = libre demain.',
        stat: '5 | 7 € | +0,1',
        allegeance: 'Je jure d\'en gagner une, aujourd\'hui'
      },
      {
        jour: 4,
        nom: 'Respirer pour décider',
        objectif: 'Prendre 3 respirations avant chaque décision.',
        action: 'Respiration carrée (3 cycles) à chaque envie.',
        info_sante: 'La respiration active le nerf vague et baisse le stress.',
        motivation: 'Entre envie et geste, tu choisis.',
        stat: '8 | 11 € | +0,15',
        allegeance: 'Je jure de choisir en conscience'
      },
      {
        jour: 5,
        nom: 'Changer un rituel',
        objectif: 'Modifier le contexte d\'un craving (après-repas/café).',
        action: 'Changer de place, brosse-dents, eau fraîche.',
        info_sante: 'Changer le contexte affaiblit l\'association cigarette-moment.',
        motivation: 'Même décor, nouvelle vie.',
        stat: '11 | 15 € | +0,2',
        allegeance: 'Je jure de casser l\'ancien script'
      },
      {
        jour: 6,
        nom: '−2 aujourd\'hui',
        objectif: 'Réduire de 2 cigarettes.',
        action: 'Remplacer 2 moments par sons blancs (3 min) + marche.',
        info_sante: 'L\'envie culmine <3 minutes : traverse-la.',
        motivation: 'Tu traverses la vague, tu ne te noies plus.',
        stat: '15 | 21 € | +0,3',
        allegeance: 'Je jure de laisser passer la vague'
      },
      {
        jour: 7,
        nom: 'Checkpoint S1',
        objectif: 'Valider la réduction et ajuster.',
        action: 'Faire le point : quels moments sont encore durs ?',
        info_sante: 'Bilan = adaptation = succès durable.',
        motivation: 'Tu pilotes, tu ajustes, tu avances.',
        stat: '18 | 25 € | +0,35',
        allegeance: 'Je jure de continuer avec lucidité'
      },
      {
        jour: 8,
        nom: 'Neutraliser le matin',
        objectif: 'Réduire la 1re cigarette à 0.',
        action: 'Respiration 4-7-8 + eau + 10 squats.',
        info_sante: 'Le « craving du réveil » est surtout conditionné.',
        motivation: 'Tu reprogrammes l\'aube.',
        stat: '20 | 28 € | +0,4',
        allegeance: 'Je jure d\'ouvrir ma journée sans nicotine'
      },
      {
        jour: 9,
        nom: 'Pause consciente',
        objectif: 'Remplacer la pause clope par micro-pause focus.',
        action: '2 min respiration + regard au loin 20s (relâche yeux).',
        info_sante: 'Micro-pauses réduisent la charge mentale.',
        motivation: 'Ta pause t\'apaise vraiment.',
        stat: '23 | 32 € | +0,45',
        allegeance: 'Je jure d\'offrir de vraies pauses à mon corps'
      },
      {
        jour: 10,
        nom: 'Alimentation complice',
        objectif: 'Limiter caféine/alcool aujourd\'hui.',
        action: '1 café de moins + hydratation ++.',
        info_sante: 'Café/alcool = déclencheurs classiques de craving.',
        motivation: 'Tu facilites ta victoire.',
        stat: '26 | 36 € | +0,5',
        allegeance: 'Je jure de préparer mon corps à gagner'
      },
      {
        jour: 11,
        nom: '−3 aujourd\'hui',
        objectif: 'Réduire de 3 cigarettes.',
        action: 'Cibler 3 moments « moyens » à remplacer.',
        info_sante: 'Diminution progressive limite l\'irritabilité.',
        motivation: 'Chaque « non » construit le nouveau toi.',
        stat: '30 | 42 € | +0,6',
        allegeance: 'Je jure de construire ma liberté, brique par brique'
      },
      {
        jour: 12,
        nom: 'Gestion sociale',
        objectif: 'Préparer une réponse simple en soirée.',
        action: 'Script : « J\'arrête, je teste 21 jours — ça me fait du bien. »',
        info_sante: 'Préparer sa réponse diminue la pression sociale.',
        motivation: 'Tu ne dois rien à personne, sauf à toi.',
        stat: '33 | 46 € | +0,65',
        allegeance: 'Je jure de rester fidèle à ma décision'
      },
      {
        jour: 13,
        nom: 'Recharger l\'énergie',
        objectif: 'Bouger 20 minutes.',
        action: 'Marche rapide, vélo ou footing léger.',
        info_sante: 'L\'exercice réduit l\'intensité des cravings.',
        motivation: 'Ton corps aime cette nouvelle version.',
        stat: '36 | 50 € | +0,7',
        allegeance: 'Je jure d\'investir dans mon énergie'
      },
      {
        jour: 14,
        nom: 'Checkpoint S2',
        objectif: 'Valider réduction ~50–60%.',
        action: 'Comparer jour 1 vs jour 14.',
        info_sante: 'Le cerveau s\'habitue vite à la nouvelle norme.',
        motivation: 'Tu n\'es plus le même qu\'il y a 2 semaines.',
        stat: '40 | 56 € | +0,8',
        allegeance: 'Je jure de respecter le chemin parcouru'
      },
      {
        jour: 15,
        nom: 'Désamorcer l\'après-repas',
        objectif: 'Changer le décor après-repas.',
        action: 'Brosse-dents + marche 2 min.',
        info_sante: 'Changer le contexte casse l\'association.',
        motivation: 'Même repas, nouvelle suite.',
        stat: '44 | 62 € | +0,9',
        allegeance: 'Je jure de diriger mes routines'
      },
      {
        jour: 16,
        nom: 'Le non devient normal',
        objectif: 'Ancrer le refus sans tension.',
        action: 'Écrire : « Je suis non-fumeur qui se révèle. »',
        info_sante: 'Le discours interne influence le comportement.',
        motivation: 'Tu deviens ce que tu te racontes.',
        stat: '47 | 66 € | +0,95',
        allegeance: 'Je jure de parler comme le nouveau moi'
      },
      {
        jour: 17,
        nom: 'Craving = signal',
        objectif: 'Voir l\'envie comme alerte d\'auto-soin.',
        action: 'Au craving : eau + respiration + étirements.',
        info_sante: 'Recanaliser l\'impulsion = réapprendre ton corps.',
        motivation: 'Le craving t\'aide à te souvenir de toi.',
        stat: '50 | 70 € | +1,0',
        allegeance: 'Je jure d\'écouter et d\'honorer mon corps'
      },
      {
        jour: 18,
        nom: 'Quasi zéro',
        objectif: 'Rester à 0–2 cigarettes max.',
        action: 'Remplacer tous les moments restants.',
        info_sante: 'Au-delà de 2, le cerveau recrée l\'habitude.',
        motivation: 'Tu es à 1 pas de la liberté pleine.',
        stat: '55 | 77 € | +1,1',
        allegeance: 'Je jure d\'achever ce que j\'ai commencé'
      },
      {
        jour: 19,
        nom: 'Identité',
        objectif: 'Dire « je ne fume plus ».',
        action: 'L\'écrire et le dire à un proche.',
        info_sante: 'L\'affirmation identitaire renforce la tenue.',
        motivation: 'Tu ne t\'interdis rien : tu choisis qui tu es.',
        stat: '58 | 81 € | +1,2',
        allegeance: 'Je jure d\'être fidèle à ma nouvelle identité'
      },
      {
        jour: 20,
        nom: 'Consolider',
        objectif: 'Tester une situation jadis difficile (soft).',
        action: 'Simuler, respirer, observer, réussir.',
        info_sante: 'L\'exposition graduée améliore la tenue.',
        motivation: 'Tu n\'évites pas : tu maîtrises.',
        stat: '62 | 87 € | +1,3',
        allegeance: 'Je jure de transformer l\'ancien piège en terrain neutre'
      },
      {
        jour: 21,
        nom: 'Renaissance',
        objectif: 'Clore la réduction — basculer en zéro durable.',
        action: 'Activer prévention rechute + bouton panique favori.',
        info_sante: 'À 21 jours, la dépendance est surtout mémoire/apprentissage.',
        motivation: 'Tu as reprogrammé ton histoire.',
        stat: '65 | 91 € | +1,4',
        allegeance: 'Je jure de protéger ma liberté chaque jour'
      }
    ]
  },
  P4: {
    plan_id: 'P4',
    titre: 'Anti-Stress & Respiration — 21 jours pour apaiser et libérer',
    jours: [
      {
        jour: 1,
        nom: 'Mettre à zéro la pression',
        objectif: 'Installer 3 respirations programmées (matin/midi/soir).',
        action: 'Alarmes 9h/13h/19h — cohérence 5-5 (2 min).',
        info_sante: 'Le souffle active le nerf vague, baisse cortisol.',
        motivation: 'Tu reprends ton calme naturel.',
        stat: '0 | 0 € | 0',
        allegeance: 'Je jure d\'écouter mon souffle'
      },
      {
        jour: 2,
        nom: 'Craving = message',
        objectif: 'Voir l\'envie comme alerte de stress.',
        action: 'Au craving: 3 cycles 4-7-8 + eau.',
        info_sante: 'Craving émotionnel ≠ besoin nicotinique.',
        motivation: 'Tu t\'entends enfin.',
        stat: '3 | 4 € | +0,08',
        allegeance: 'Je jure de répondre par le soin'
      },
      {
        jour: 3,
        nom: 'Habitudes apaisantes',
        objectif: 'Créer une micro-routine anti-tension.',
        action: 'Étirements 2 min + son pluie 3 min.',
        info_sante: 'Multi-canal (mouvements/sons) = apaisement durable.',
        motivation: 'Tu as un refuge intérieur.',
        stat: '6 | 8 € | +0,15',
        allegeance: 'Je jure d\'ouvrir mon refuge'
      },
      {
        jour: 4,
        nom: 'Reprogrammer l\'après-repas',
        objectif: 'Détente sans cigarette.',
        action: 'Brosse-dents + marche 2 min + respiration 5-5 (1 min).',
        info_sante: 'Changer de contexte réduit le craving conditionné.',
        motivation: 'Tu associes repos et santé.',
        stat: '9 | 12 € | +0,2',
        allegeance: 'Je jure de protéger mes repas'
      },
      {
        jour: 5,
        nom: 'SOS stress',
        objectif: 'Avoir un protocole d\'urgence clair.',
        action: 'Craving fort: eau + 4-7-8 (3 cycles) + note émotion.',
        info_sante: 'Nommer l\'émotion baisse son intensité.',
        motivation: 'Nommer, c\'est dompter.',
        stat: '12 | 16 € | +0,25',
        allegeance: 'Je jure de nommer, pas fuir'
      },
      {
        jour: 6,
        nom: 'Énergie propre',
        objectif: 'Bouger 15 min pour évacuer.',
        action: 'Marche rapide ou corde 5×1 min.',
        info_sante: 'Exercice = régulation émotionnelle.',
        motivation: 'Tu transformes la tension en puissance.',
        stat: '15 | 20 € | +0,3',
        allegeance: 'Je jure de transmuter mon stress'
      },
      {
        jour: 7,
        nom: 'Checkpoint apaisement',
        objectif: 'Mesurer ton stress (1–10) vs jour 1.',
        action: 'Journal: 3 situations apaisées cette semaine.',
        info_sante: 'Le cerveau apprend la voie du calme.',
        motivation: 'Ton système nerveux te suit.',
        stat: '18 | 24 € | +0,35',
        allegeance: 'Je jure d\'entretenir mon calme'
      },
      {
        jour: 8,
        nom: 'Matin sans charge',
        objectif: 'Matin 100% sans nicotine',
        action: 'Eau + cohérence 5-5 + lumière du jour 2 min.',
        info_sante: 'Lumière = rythme circadien stable.',
        motivation: 'Tu offres un nouveau départ à chaque aube.',
        stat: '20 | 28 € | +0,4',
        allegeance: 'Je jure de protéger mes matins'
      },
      {
        jour: 9,
        nom: 'Tension au travail',
        objectif: 'Remplacer la pause clope par pause souffle.',
        action: 'Respiration 4-4-6 (2 min) + regard au loin.',
        info_sante: 'Allonger l\'expiration apaise plus vite.',
        motivation: 'Tu contrôles la pression.',
        stat: '23 | 32 € | +0,45',
        allegeance: 'Je jure de dompter mes pauses'
      },
      {
        jour: 10,
        nom: 'Sérénité sociale',
        objectif: 'Préparer réponse simple si on t\'en propose.',
        action: 'Script: « J\'ai un défi 21j, je me sens mieux. »',
        info_sante: 'Préparer la réponse réduit l\'anxiété sociale.',
        motivation: 'Tu dois te prouver à toi, pas aux autres.',
        stat: '26 | 36 € | +0,5',
        allegeance: 'Je jure de rester fidèle à moi'
      },
      {
        jour: 11,
        nom: 'Micro-sieste',
        objectif: 'Remplacer la clope fatigue par sieste 7–10 min.',
        action: 'Allonge-toi, respiration 4-7-8, réveil doux.',
        info_sante: 'Micro-siestes = performance ↑, stress ↓.',
        motivation: 'Tu récupères au lieu de brûler.',
        stat: '29 | 40 € | +0,55',
        allegeance: 'Je jure de me reposer vraiment'
      },
      {
        jour: 12,
        nom: 'Déclencheur café',
        objectif: 'Diminuer caféine aujourd\'hui.',
        action: '1 café de moins + eau/infusion.',
        info_sante: 'Café ↗ agitation → cravings.',
        motivation: 'Tu fais allié avec ton corps.',
        stat: '32 | 44 € | +0,6',
        allegeance: 'Je jure d\'alléger mon système'
      },
      {
        jour: 13,
        nom: 'Crise → rituel',
        objectif: 'Transformer 1 crise récente en protocole.',
        action: 'Écrire: déclencheur → geste → respiration → issue.',
        info_sante: 'Planifier = rassurer = tenir.',
        motivation: 'Tu deviens ton propre coach.',
        stat: '35 | 48 € | +0,65',
        allegeance: 'Je jure d\'être mon allié'
      },
      {
        jour: 14,
        nom: 'Checkpoint S2',
        objectif: 'Mesurer stress, sommeil, envies.',
        action: 'Comparatif semaine 1 vs 2.',
        info_sante: 'Le suivi rend visible l\'invisible.',
        motivation: 'Tu vois la paix revenir.',
        stat: '38 | 52 € | +0,7',
        allegeance: 'Je jure de respecter mes progrès'
      },
      {
        jour: 15,
        nom: 'Respiration maître',
        objectif: 'Protocole préféré 2×/jour.',
        action: 'Choisis 4-7-8 ou 5-5, et tiens.',
        info_sante: 'La répétition crée l\'autoroute du calme.',
        motivation: 'Tu as une télécommande interne.',
        stat: '41 | 56 € | +0,75',
        allegeance: 'Je jure d\'entretenir mon outil'
      },
      {
        jour: 16,
        nom: 'Soir apaisé',
        objectif: 'Dormir mieux.',
        action: 'Sons pluie 5 min + respiration 4-7-8.',
        info_sante: 'Sommeil = stabilité émotionnelle.',
        motivation: 'Tu te réveilles neuf.',
        stat: '44 | 60 € | +0,8',
        allegeance: 'Je jure d\'honorer mon sommeil'
      },
      {
        jour: 17,
        nom: 'Soutien',
        objectif: 'Partager 1 victoire.',
        action: 'Envoyer un message à un proche.',
        info_sante: 'Soutien social ↓ rechute.',
        motivation: 'La force se partage.',
        stat: '47 | 64 € | +0,85',
        allegeance: 'Je jure d\'accepter l\'aide'
      },
      {
        jour: 18,
        nom: 'Défi maîtrisé',
        objectif: 'Repasser dans un ancien piège (soft).',
        action: 'Traverser en respirant, sans s\'arrêter.',
        info_sante: 'Exposition = désensibilisation.',
        motivation: 'Tu n\'évites pas, tu domines.',
        stat: '50 | 68 € | +0,9',
        allegeance: 'Je jure de garder le cap'
      },
      {
        jour: 19,
        nom: 'Identité',
        objectif: 'Dire/écrire « je ne fume plus ».',
        action: 'Le dire à quelqu\'un / le noter.',
        info_sante: 'Self-affirmation = tenue ↑.',
        motivation: 'Tu n\'arrêtes pas — tu deviens.',
        stat: '53 | 72 € | +0,95',
        allegeance: 'Je jure d\'incarner le nouveau moi'
      },
      {
        jour: 20,
        nom: 'Zéro tranquille',
        objectif: 'Zéro cigarette sans tension.',
        action: 'Respiration + marche si pic.',
        info_sante: 'Cravings s\'espacent après 2–3 semaines.',
        motivation: 'La paix devient ta norme.',
        stat: '56 | 76 € | +1,0',
        allegeance: 'Je jure de garder ma paix'
      },
      {
        jour: 21,
        nom: 'Transmission',
        objectif: 'Écrire une note à ton « ancien toi ».',
        action: 'Bilan + activer prévention rechute.',
        info_sante: 'Le cerveau garde des traces → prévention nécessaire.',
        motivation: 'Tu honores le chemin.',
        stat: '60 | 82 € | +1,1',
        allegeance: 'Je jure de protéger ma liberté'
      }
    ]
  },
  P5: {
    plan_id: 'P5',
    titre: 'Social & Alcool — 14 jours pour garder la main',
    jours: [
      {
        jour: 1,
        nom: 'Script social',
        objectif: 'Préparer ta réponse simple.',
        action: '« J\'ai un défi 14j, je me sens mieux. »',
        info_sante: 'Préparer ↓ pression des pairs.',
        motivation: 'Tu n\'as rien à prouver, sauf à toi.',
        stat: '0 | 0 € | 0',
        allegeance: 'Je jure d\'honorer ma décision en public'
      },
      {
        jour: 2,
        nom: 'Boisson complice',
        objectif: 'Choisir 2 alternatives boisson.',
        action: 'Eau gazeuse/citron, mocktail.',
        info_sante: 'Alcool ↑ cravings.',
        motivation: 'Tu gardes la fête, pas la fumée.',
        stat: '2 | 3 € | +0,05',
        allegeance: 'Je jure de protéger ma soirée'
      },
      {
        jour: 3,
        nom: 'Allié de soirée',
        objectif: 'Prévenir un ami.',
        action: 'Trouver « complice » anti-clope.',
        info_sante: 'Soutien ↓ rechute.',
        motivation: 'À deux, c\'est plus simple.',
        stat: '4 | 6 € | +0,1',
        allegeance: 'Je jure de demander de l\'aide intelligente'
      },
      {
        jour: 4,
        nom: 'Entrée différente',
        objectif: 'Changer ton arrivée en soirée.',
        action: 'Dire bonjour loin du coin fumeurs.',
        info_sante: 'Contexte conditionne le geste.',
        motivation: 'Tu choisis le décor.',
        stat: '6 | 8 € | +0,15',
        allegeance: 'Je jure de choisir mon terrain'
      },
      {
        jour: 5,
        nom: 'Pause scène',
        objectif: 'Quitter la zone fumeurs 5 min.',
        action: 'Respirer dehors/ailleurs si pression.',
        info_sante: 'Sortir de la boucle ↓ compulsion.',
        motivation: 'Tu n\'es pas obligé de suivre.',
        stat: '8 | 11 € | +0,2',
        allegeance: 'Je jure de suivre ma voie'
      },
      {
        jour: 6,
        nom: 'Craving festif',
        objectif: 'Installer protocole rapide.',
        action: 'Eau + 3 souffles lents + mains occupées.',
        info_sante: 'Mains occupées ↓ geste réflexe.',
        motivation: 'Tu tiens la barre.',
        stat: '10 | 14 € | +0,25',
        allegeance: 'Je jure de tenir le cap'
      },
      {
        jour: 7,
        nom: 'Checkpoint S1',
        objectif: '1 soirée sans fumer.',
        action: 'Bilan: déclencheur principal ?',
        info_sante: 'Conscience = puissance.',
        motivation: 'Tu as passé le premier boss.',
        stat: '12 | 17 € | +0,3',
        allegeance: 'Je jure d\'apprendre de chaque soirée'
      },
      {
        jour: 8,
        nom: 'Rituel pré-soirée',
        objectif: 'Préparer ton entrée.',
        action: 'Manger un peu + boisson complice prête.',
        info_sante: 'Hypoglycémie ↑ impulsivité.',
        motivation: 'Tu entres armé.',
        stat: '14 | 20 € | +0,35',
        allegeance: 'Je jure de me préparer à gagner'
      },
      {
        jour: 9,
        nom: 'Redirection sociale',
        objectif: 'Proposer une activité sans fumer.',
        action: 'Danser, jeu, photo, discussions.',
        info_sante: 'Réorientation ↓ tentation.',
        motivation: 'Tu crées l\'ambiance.',
        stat: '16 | 23 € | +0,4',
        allegeance: 'Je jure d\'être le flow, pas le suiveur'
      },
      {
        jour: 10,
        nom: 'Dormir mieux',
        objectif: 'Limiter tard le soir.',
        action: 'Sortie plus courte/retour en paix.',
        info_sante: 'Sommeil = tenue ↑.',
        motivation: 'La fête continue demain.',
        stat: '18 | 26 € | +0,45',
        allegeance: 'Je jure de choisir ma santé'
      },
      {
        jour: 11,
        nom: 'Désamorcer l\'alcool',
        objectif: '2 verres max ce soir (si sortie).',
        action: 'Alterner avec eau.',
        info_sante: 'Dose-réponse cravings.',
        motivation: 'Tu restes capitaine.',
        stat: '20 | 28 € | +0,5',
        allegeance: 'Je jure de rester lucide'
      },
      {
        jour: 12,
        nom: 'Dire non facilement',
        objectif: 'Refus clair + sourire.',
        action: '« Non merci, je suis sur un défi, je me sens bien. »',
        info_sante: 'Formuler refuse l\'ambivalence.',
        motivation: 'Tu n\'as rien à te justifier.',
        stat: '22 | 31 € | +0,55',
        allegeance: 'Je jure de me respecter'
      },
      {
        jour: 13,
        nom: 'Célébrer autrement',
        objectif: 'Récompense non-tabac.',
        action: 'Cadeau/activité à la place.',
        info_sante: 'Dopamine peut venir d\'ailleurs.',
        motivation: 'Tu changes la définition du plaisir.',
        stat: '24 | 34 € | +0,6',
        allegeance: 'Je jure d\'honorer mes victoires'
      },
      {
        jour: 14,
        nom: 'Nouvel ADN social',
        objectif: 'Clore cycle social sans clope.',
        action: 'Bilan écrit + scenario anti-rechute.',
        info_sante: 'Scripts préparés = rechute ↓.',
        motivation: 'Tu gardes la vie, pas la fumée.',
        stat: '26 | 36 € | +0,65',
        allegeance: 'Je jure de rester moi en toutes situations'
      }
    ]
  },
  P3: {
    plan_id: 'P3',
    titre: 'Arrêt progressif intense — 45 jours pour te libérer sans choc',
    jours: [
      {
        jour: 1,
        nom: 'Le socle',
        objectif: 'Observer ta consommation sans jugement.',
        action: 'Note combien et quand tu fumes aujourd\'hui.',
        info_sante: 'Connaître ton rythme = premier pas vers le contrôle.',
        motivation: 'Tu poses les bases de ta victoire.',
        stat: '0 | 0 € | 0',
        allegeance: 'Je jure de reprendre le contrôle de mon rythme'
      },
      {
        jour: 2,
        nom: 'Le bouclier',
        objectif: 'Hydrater et ralentir le geste.',
        action: 'Bois un verre d\'eau avant chaque cigarette.',
        info_sante: 'L\'eau aide ton corps à éliminer la nicotine.',
        motivation: 'Tu reprends le pouvoir, un geste à la fois.',
        stat: '2 | 3 € | +0,05',
        allegeance: 'Je jure d\'observer avant d\'agir'
      },
      {
        jour: 3,
        nom: 'Décaler',
        objectif: 'Décaler la première cigarette du matin.',
        action: 'Respiration 4-7-8 + 10 squats avant de fumer.',
        info_sante: 'Décaler le matin = dépendance ↓.',
        motivation: 'Tu choisis ton premier geste.',
        stat: '4 | 6 € | +0,1',
        allegeance: 'Je jure de choisir le moment, pas l\'instinct'
      },
      {
        jour: 4,
        nom: 'Stress test',
        objectif: 'Identifier les moments où tu fumes par tension.',
        action: 'Note 3 situations stressantes où tu aurais fumé.',
        info_sante: 'Le craving lié au stress dure 2 à 3 minutes.',
        motivation: 'Tu apprends à surfer la vague.',
        stat: '6 | 8 € | +0,15',
        allegeance: 'Je jure d\'écouter mes signaux sans fuir'
      },
      {
        jour: 5,
        nom: 'Changer un rituel',
        objectif: 'Remplacer une cigarette par une respiration.',
        action: 'Choisis un moment simple (après repas, pause).',
        info_sante: 'Chaque geste remplacé crée une nouvelle habitude.',
        motivation: 'Tu réécris tes réflexes.',
        stat: '8 | 11 € | +0,2',
        allegeance: 'Je jure de créer de nouveaux gestes'
      },
      {
        jour: 6,
        nom: 'Nettoyage interne',
        objectif: 'Aider ton corps à éliminer la nicotine.',
        action: 'Bois 2L d\'eau + 20 min de marche + 8h de sommeil.',
        info_sante: 'Ton oxygène revient à la normale après 3 jours.',
        motivation: 'Ton corps se souvient de la liberté.',
        stat: '10 | 14 € | +0,25',
        allegeance: 'Je jure de prendre soin de mon corps'
      },
      {
        jour: 7,
        nom: 'Checkpoint S1',
        objectif: 'Faire le point sur ta première semaine.',
        action: 'Compare avec ton jour 1 (nombre, moments, émotions).',
        info_sante: 'Réduction douce = meilleure stabilité.',
        motivation: 'Tu avances, même sans t\'en rendre compte.',
        stat: '12 | 17 € | +0,3',
        allegeance: 'Je jure de continuer avec patience'
      },
      {
        jour: 8,
        nom: 'Matin neutre',
        objectif: 'Aucune cigarette avant midi.',
        action: 'Eau + respiration + marche dès le réveil.',
        info_sante: 'Éviter la nicotine matinale = dépendance ↓.',
        motivation: 'Tu gagnes l\'aube.',
        stat: '14 | 20 € | +0,35',
        allegeance: 'Je jure de protéger mes matins'
      },
      {
        jour: 9,
        nom: 'Pause consciente',
        objectif: 'Remplacer une clope par une pause respiration.',
        action: 'Pause 2 min avec souffle lent + musique calme.',
        info_sante: 'Une pause sans nicotine diminue la suivante.',
        motivation: 'Tu transformes ton repos.',
        stat: '16 | 23 € | +0,4',
        allegeance: 'Je jure d\'utiliser mes pauses pour moi'
      },
      {
        jour: 10,
        nom: 'Respiration maître',
        objectif: 'Faire du souffle ton réflexe.',
        action: '4-4-4-4 à chaque envie.',
        info_sante: 'Le nerf vague apaise le craving.',
        motivation: 'Ton souffle est ton armure.',
        stat: '18 | 26 € | +0,45',
        allegeance: 'Je jure de respirer avant de céder'
      },
      {
        jour: 11,
        nom: 'Pause alternative',
        objectif: 'Remplacer 2 cigarettes aujourd\'hui.',
        action: 'Thé, marche ou message à un ami à la place.',
        info_sante: 'Remplacer = ancrer la nouvelle voie.',
        motivation: 'Tu gagnes du terrain chaque jour.',
        stat: '20 | 28 € | +0,5',
        allegeance: 'Je jure de créer mes pauses libres'
      },
      {
        jour: 12,
        nom: 'Récompense réelle',
        objectif: 'Trouver un plaisir sans clope.',
        action: 'Musique, bain, série — ton vrai shoot de dopamine.',
        info_sante: 'Le plaisir sans nicotine devient naturel.',
        motivation: 'Tu redécouvres tes sources de joie.',
        stat: '22 | 31 € | +0,55',
        allegeance: 'Je jure de garder le vrai plaisir'
      },
      {
        jour: 13,
        nom: 'Ancrage corporel',
        objectif: 'Réassocier ton corps à la détente.',
        action: 'Étirements + respiration 4-7-8.',
        info_sante: 'La détente physique coupe le craving.',
        motivation: 'Tu transformes le besoin en énergie.',
        stat: '24 | 34 € | +0,6',
        allegeance: 'Je jure de ressentir au lieu de consommer'
      },
      {
        jour: 14,
        nom: 'Checkpoint S2',
        objectif: 'Mesurer les progrès.',
        action: 'Note tes cravings/jour + fiertés.',
        info_sante: 'Ton cerveau réapprend la paix.',
        motivation: 'Le calme devient ton nouveau normal.',
        stat: '26 | 37 € | +0,65',
        allegeance: 'Je jure de continuer à ancrer ma liberté'
      },
      {
        jour: 22,
        nom: 'Journée pilote',
        objectif: 'Décider à l\'avance quand tu fumes.',
        action: 'Planifie 2 cigarettes maximum aujourd\'hui.',
        info_sante: 'Anticiper = réduire le besoin impulsif.',
        motivation: 'Tu redeviens le pilote.',
        stat: '28 | 39 € | +0,7',
        allegeance: 'Je jure de prévoir mes choix'
      },
      {
        jour: 23,
        nom: 'Rituel du soir',
        objectif: 'Remplacer la clope du soir.',
        action: 'Tisane + respiration lente + son blanc.',
        info_sante: 'Le sommeil répare plus vite sans nicotine.',
        motivation: 'Tu t\'endors libre.',
        stat: '30 | 42 € | +0,75',
        allegeance: 'Je jure de fermer la journée sereinement'
      },
      {
        jour: 24,
        nom: 'Déconnexion courte',
        objectif: 'Pause sans téléphone ni clope.',
        action: '3 minutes d\'air frais ou de silence.',
        info_sante: 'Le mental respire sans stimulation.',
        motivation: 'Tu goûtes au vrai repos.',
        stat: '32 | 45 € | +0,8',
        allegeance: 'Je jure de respirer sans distraction'
      },
      {
        jour: 25,
        nom: 'Mains libres',
        objectif: 'Casser le geste.',
        action: 'Utilise une balle anti-stress ou stylo.',
        info_sante: 'Changer le geste = casser la boucle.',
        motivation: 'Tes mains ne commandent plus ton esprit.',
        stat: '34 | 48 € | +0,85',
        allegeance: 'Je jure de délier mes mains du réflexe'
      },
      {
        jour: 26,
        nom: 'Nouvelle identité',
        objectif: 'Te voir comme non-fumeur en construction.',
        action: 'Dis-le à voix haute : « Je suis en train d\'arrêter. »',
        info_sante: 'Changer de discours renforce la neuroplasticité.',
        motivation: 'Tu redeviens toi-même.',
        stat: '36 | 50 € | +0,9',
        allegeance: 'Je jure d\'assumer ma transformation'
      },
      {
        jour: 27,
        nom: 'Craving script',
        objectif: 'Appliquer ton protocole anti-envie.',
        action: 'Stop → Respire → Bois → Respire → Continue.',
        info_sante: 'Répétition = réflexe protecteur.',
        motivation: 'Tu transformes ton stress en calme.',
        stat: '38 | 53 € | +0,95',
        allegeance: 'Je jure d\'utiliser mon protocole'
      },
      {
        jour: 28,
        nom: 'Checkpoint S3',
        objectif: 'Comparer craving/semaine.',
        action: 'Regarde ton amélioration depuis jour 1.',
        info_sante: 'Ton corps est presque déshabitué.',
        motivation: 'Tu peux bientôt te libérer totalement.',
        stat: '40 | 56 € | +1,0',
        allegeance: 'Je jure de tenir jusqu\'au bout'
      },
      {
        jour: 29,
        nom: 'Derniers réflexes',
        objectif: 'Identifier les clopes restantes.',
        action: 'Note celles que tu gardes et pourquoi.',
        info_sante: 'Reconnaître = pouvoir retirer.',
        motivation: 'Tu es lucide, donc libre.',
        stat: '42 | 59 € | +1,1',
        allegeance: 'Je jure de finir le nettoyage'
      },
      {
        jour: 30,
        nom: 'Remplacement final',
        objectif: 'Substituer les dernières cigarettes.',
        action: '1 respiration ou marche à la place.',
        info_sante: 'Le sevrage complet commence ici.',
        motivation: 'Tu es à un souffle de la liberté.',
        stat: '44 | 62 € | +1,2',
        allegeance: 'Je jure de franchir le cap'
      },
      {
        jour: 31,
        nom: 'Zéro du matin',
        objectif: 'Aucune cigarette avant 14h.',
        action: 'Rituel : eau + souffle + musique.',
        info_sante: 'Matin sans nicotine = gain d\'énergie durable.',
        motivation: 'Tu gagnes tes matins à vie.',
        stat: '46 | 65 € | +1,3',
        allegeance: 'Je jure de garder mes matins libres'
      },
      {
        jour: 32,
        nom: 'Rituel de calme',
        objectif: 'Remplacer stress du soir par relaxation.',
        action: 'Son blanc 5 min avant le coucher.',
        info_sante: 'Système nerveux équilibré = sommeil ↑.',
        motivation: 'Tu dors du vrai repos.',
        stat: '48 | 68 € | +1,4',
        allegeance: 'Je jure de finir la journée apaisé'
      },
      {
        jour: 33,
        nom: 'Respiration totale',
        objectif: 'Maîtriser ton souffle.',
        action: '5x 4-7-8 réparties dans la journée.',
        info_sante: 'Respirer lentement = cravings ↓ 40%.',
        motivation: 'Tu domptes ton mental.',
        stat: '50 | 70 € | +1,5',
        allegeance: 'Je jure de respirer pour vivre'
      },
      {
        jour: 34,
        nom: 'Soutien fort',
        objectif: 'Partager ton progrès.',
        action: 'Informer un proche ou le coach IA.',
        info_sante: 'Le soutien social double les chances de réussite.',
        motivation: 'Tu n\'es plus seul.',
        stat: '52 | 73 € | +1,6',
        allegeance: 'Je jure de me faire accompagner'
      },
      {
        jour: 35,
        nom: 'Énergie stable',
        objectif: 'Éviter café, sucre et stress.',
        action: 'Hydratation + respiration au lieu de café.',
        info_sante: 'Caféine + manque = cravings ↑.',
        motivation: 'Tu restes stable.',
        stat: '54 | 76 € | +1,7',
        allegeance: 'Je jure d\'équilibrer mon énergie'
      },
      {
        jour: 36,
        nom: 'Zéro naturel',
        objectif: 'Observer ton corps sans manque.',
        action: 'Noter les moments où tu n\'y penses plus.',
        info_sante: 'Ton cerveau réapprend la paix.',
        motivation: 'Le calme devient ton état normal.',
        stat: '56 | 79 € | +1,8',
        allegeance: 'Je jure de respecter mon calme'
      },
      {
        jour: 37,
        nom: 'Rechute évitée',
        objectif: 'Créer un plan si l\'envie revient.',
        action: 'Écrire déclencheur + réponse + issue.',
        info_sante: 'Prévoir = se protéger.',
        motivation: 'Tu anticipes, tu gagnes.',
        stat: '58 | 81 € | +1,9',
        allegeance: 'Je jure d\'être prêt à toute envie'
      },
      {
        jour: 38,
        nom: 'Nouvelle base',
        objectif: 'Fixer ta nouvelle routine sans nicotine.',
        action: 'Choisir 3 rituels : souffle, marche, son.',
        info_sante: 'Répétition = stabilité.',
        motivation: 'Tu consolides ta liberté.',
        stat: '60 | 84 € | +2,0',
        allegeance: 'Je jure de protéger mes rituels'
      },
      {
        jour: 39,
        nom: 'Victoire physique',
        objectif: 'Constater les gains corporels.',
        action: 'Note respiration, goût, sommeil, peau.',
        info_sante: 'Ton corps a éliminé la nicotine.',
        motivation: 'Tu sens la différence.',
        stat: '62 | 87 € | +2,1',
        allegeance: 'Je jure de célébrer mon corps libre'
      },
      {
        jour: 40,
        nom: 'Victoire mentale',
        objectif: 'Reconnaître la clarté retrouvée.',
        action: 'Journal : 3 pensées claires récentes.',
        info_sante: 'Moins de nicotine = dopamine stable.',
        motivation: 'Tu penses libre.',
        stat: '64 | 90 € | +2,2',
        allegeance: 'Je jure d\'honorer mon esprit clair'
      },
      {
        jour: 41,
        nom: 'Identité libre',
        objectif: 'Affirmer ton statut de non-fumeur.',
        action: 'Dis-le à ton entourage : \'J\'ai arrêté.\'',
        info_sante: 'L\'identité maintient la motivation.',
        motivation: 'Tu incarnes ton choix.',
        stat: '66 | 93 € | +2,3',
        allegeance: 'Je jure d\'incarner mon nouveau moi'
      },
      {
        jour: 42,
        nom: 'Prévention',
        objectif: 'Lister tes déclencheurs restants.',
        action: 'Créer ton plan anti-rechute.',
        info_sante: 'Anticiper = rester libre.',
        motivation: 'Tu as les clés de ta stabilité.',
        stat: '68 | 95 € | +2,4',
        allegeance: 'Je jure de rester vigilant'
      },
      {
        jour: 43,
        nom: 'Transmission',
        objectif: 'Partager ton expérience.',
        action: 'Aider un proche ou écrire ton témoignage.',
        info_sante: 'Transmettre consolide ton succès.',
        motivation: 'Tu deviens un modèle.',
        stat: '70 | 98 € | +2,5',
        allegeance: 'Je jure de transmettre ma force'
      },
      {
        jour: 44,
        nom: 'Clôture',
        objectif: 'Revoir ton parcours.',
        action: 'Compare ton jour 1 et ton jour 44.',
        info_sante: 'Ton corps et ton esprit ont changé.',
        motivation: 'Tu es la preuve du changement.',
        stat: '72 | 101 € | +2,6',
        allegeance: 'Je jure d\'honorer mon parcours'
      },
      {
        jour: 45,
        nom: 'Renaissance',
        objectif: 'Devenir stable, libre, fier.',
        action: 'Choisis ta phrase-clé d\'avenir.',
        info_sante: 'Tu es libéré, ton cerveau est rééquilibré.',
        motivation: 'Tu as gagné ta liberté.',
        stat: '74 | 104 € | +2,7',
        allegeance: 'Je jure de rester libre pour de bon'
      }
    ]
  },
  P6: {
    plan_id: 'P6',
    titre: 'Focus & Concentration — 21 jours pour remplacer la pause clope',
    jours: [
      {
        jour: 1,
        nom: 'Nouvelle pause',
        objectif: 'Créer une micro-pause sans clope.',
        action: '2 min respiration 4-6 + regard au loin 20s.',
        info_sante: 'Relâcher le focus visuel ↓ tension mentale.',
        motivation: 'Tu gagnes une vraie pause.',
        stat: '0 | 0 € | 0',
        allegeance: 'Je jure d\'offrir de vraies pauses à mon cerveau'
      },
      {
        jour: 2,
        nom: 'Matin productif',
        objectif: 'Matin zéro nicotine.',
        action: 'Eau + lumière + respiration 5-5.',
        info_sante: 'Cortisol matinal stabilisé = clarté ↑.',
        motivation: 'Tu domptes l\'aube.',
        stat: '2 | 3 € | +0,05',
        allegeance: 'Je jure d\'ouvrir ma journée avec clarté'
      },
      {
        jour: 3,
        nom: 'Timer de focus',
        objectif: 'Bloc de travail 25 min + 2 min souffle.',
        action: 'Pomodoro + respiration carrée entre blocs.',
        info_sante: 'Récup brève = productivité ↑.',
        motivation: 'Tu deviens efficace sans fuite.',
        stat: '4 | 6 € | +0,1',
        allegeance: 'Je jure de rester avec ce que je fais'
      },
      {
        jour: 4,
        nom: 'Mains occupées',
        objectif: 'Éviter le geste réflexe.',
        action: 'Balle anti-stress / stylo / marche 1 min.',
        info_sante: 'Remplacer le geste ↓ compulsion.',
        motivation: 'Tes mains ne te contrôlent plus.',
        stat: '6 | 8 € | +0,15',
        allegeance: 'Je jure d\'occuper mes mains, pas ma bouche'
      },
      {
        jour: 5,
        nom: 'Pause visuelle',
        objectif: 'Soulager les yeux, calmer l\'esprit.',
        action: '20–20–20 (toutes 20 min, 20s à 20 pieds).',
        info_sante: 'Yeux reposés = mental apaisé.',
        motivation: 'Tu lisses la journée.',
        stat: '8 | 11 € | +0,2',
        allegeance: 'Je jure de protéger mon focus'
      },
      {
        jour: 6,
        nom: 'Respiration maître',
        objectif: 'Choisir ton protocole préféré.',
        action: '4-7-8 ou 5-5, 3×/jour.',
        info_sante: 'Répétition = automatisme vertueux.',
        motivation: 'Tu remplaces une boucle par une autre.',
        stat: '10 | 14 € | +0,25',
        allegeance: 'Je jure d\'automatiser ma nouvelle boucle'
      },
      {
        jour: 7,
        nom: 'Checkpoint S1',
        objectif: 'Mesurer productivité ressentie.',
        action: 'Journal : 3 moments où tu es resté présent.',
        info_sante: 'Conscience = ancrage.',
        motivation: 'Tu tiens la barre.',
        stat: '12 | 17 € | +0,3',
        allegeance: 'Je jure de poursuivre avec présence'
      },
      {
        jour: 8,
        nom: 'Script au travail',
        objectif: 'Préparer ton « non » simple.',
        action: '« Je fais une pause respiration, je reviens. »',
        info_sante: 'Script ↓ friction sociale.',
        motivation: 'Tu n\'as pas à te justifier.',
        stat: '14 | 20 € | +0,35',
        allegeance: 'Je jure d\'être clair et serein'
      },
      {
        jour: 9,
        nom: 'Récompense saine',
        objectif: 'Remplacer clope-récompense.',
        action: 'Thé, marche, musique 2 min.',
        info_sante: 'Dopamine alternative = habitude durable.',
        motivation: 'Tu gardes la récompense, pas le poison.',
        stat: '16 | 23 € | +0,4',
        allegeance: 'Je jure d\'apprendre à me récompenser'
      },
      {
        jour: 10,
        nom: 'Antidote à l\'ennui',
        objectif: 'Micro-objectif quand ça traîne.',
        action: 'Tâche 2 min → done → souffle.',
        info_sante: 'Action courte casse l\'inertie.',
        motivation: 'Tu préfères avancer que brûler.',
        stat: '18 | 26 € | +0,45',
        allegeance: 'Je jure de choisir l\'action'
      },
      {
        jour: 11,
        nom: 'Respirer sous pression',
        objectif: 'Crise = 4-7-8 x3.',
        action: 'Stop, souffle, reprends.',
        info_sante: 'Système parasympathique = calme.',
        motivation: 'Tu sais te réguler.',
        stat: '20 | 28 € | +0,5',
        allegeance: 'Je jure de rester pilote'
      },
      {
        jour: 12,
        nom: 'Déconnexion courte',
        objectif: 'Sortie 3 min sans téléphone.',
        action: 'Regard loin + marche lente.',
        info_sante: 'Pause sans écran = reset mental.',
        motivation: 'Tu te retrouves.',
        stat: '22 | 31 € | +0,55',
        allegeance: 'Je jure de m\'offrir de vraies pauses'
      },
      {
        jour: 13,
        nom: 'Énergie stable',
        objectif: 'Limiter caféine aujourd\'hui.',
        action: '1 café de moins + eau.',
        info_sante: 'Café ↗ agitation → cravings.',
        motivation: 'Tu gardes la main.',
        stat: '24 | 34 € | +0,6',
        allegeance: 'Je jure d\'équilibrer mon énergie'
      },
      {
        jour: 14,
        nom: 'Checkpoint S2',
        objectif: 'Comparer focus, pauses, cravings.',
        action: 'Journal + ajustement routine.',
        info_sante: 'Adaptation = réussite.',
        motivation: 'Tu maîtrises ton système.',
        stat: '26 | 36 € | +0,65',
        allegeance: 'Je jure de continuer à optimiser'
      },
      {
        jour: 15,
        nom: 'Matin maître',
        objectif: 'Rituel fixe gagnant.',
        action: 'Eau + lumière + souffle + 10 squats.',
        info_sante: 'Rituels = friction ↓.',
        motivation: 'Tu lances ta journée en champion.',
        stat: '28 | 39 € | +0,7',
        allegeance: 'Je jure de protéger mon décollage'
      },
      {
        jour: 16,
        nom: 'Non réflexe',
        objectif: 'Dire non sans tension.',
        action: 'Souffle 2 fois puis « non merci ».',
        info_sante: '2 respirations = impulsion ↓.',
        motivation: 'Tu restes aux commandes.',
        stat: '30 | 42 € | +0,75',
        allegeance: 'Je jure de répondre, pas réagir'
      },
      {
        jour: 17,
        nom: 'Bloc chef-d\'œuvre',
        objectif: '1 bloc profond 45–60 min.',
        action: 'Téléphone off, casque ON.',
        info_sante: 'Deep work = dopamine saine.',
        motivation: 'Tu te surprends toi-même.',
        stat: '32 | 45 € | +0,8',
        allegeance: 'Je jure d\'aimer mon travail'
      },
      {
        jour: 18,
        nom: 'Rechute évitée',
        objectif: 'Scénario piège → protocole.',
        action: 'Écrire déclencheur/geste/respiration/issue.',
        info_sante: 'Planifier = rassurer = tenir.',
        motivation: 'Tu anticipes, tu gagnes.',
        stat: '34 | 48 € | +0,85',
        allegeance: 'Je jure d\'anticiper pour gagner'
      },
      {
        jour: 19,
        nom: 'Zéro naturel',
        objectif: 'Constater la baisse des envies.',
        action: 'Compter cravings/j — célébrer.',
        info_sante: 'Cerveau apprend la paix.',
        motivation: 'Le calme devient normal.',
        stat: '36 | 50 € | +0,9',
        allegeance: 'Je jure de respecter ma paix'
      },
      {
        jour: 20,
        nom: 'Identité focus',
        objectif: 'Dire « Je ne fume plus ».',
        action: 'Le dire/écrire, l\'assumer.',
        info_sante: 'Identité = rétention ↑.',
        motivation: 'Tu te racontes vrai.',
        stat: '38 | 53 € | +0,95',
        allegeance: 'Je jure d\'incarner mon choix'
      },
      {
        jour: 21,
        nom: 'Ancrage long terme',
        objectif: 'Installer routine 2–3 rituels/j.',
        action: 'Choisir tes 3 piliers (souffle/marche/son).',
        info_sante: 'Routines = stabilité.',
        motivation: 'Tu as un système qui te porte.',
        stat: '40 | 56 € | +1,0',
        allegeance: 'Je jure de protéger mon nouveau système'
      }
    ]
  }
};

export function getPlanContent(planId: string): PlanContent | null {
  return PLAN_CONTENT[planId] || null;
}
