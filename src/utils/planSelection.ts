import { UserProfile } from '../types';

export interface QuitPlan {
  id: string;
  name: string;
  duration: number;
  description: string;
  explanation: string;
  color: string;
  icon: string;
}

export const QUIT_PLANS: Record<string, QuitPlan> = {
  P1: {
    id: 'P1',
    name: '🌱 Libération Douce',
    duration: 7,
    description: '7 jours pour redevenir libre',
    explanation: 'Tu fumes peu et tu es motivé : ton corps peut se libérer en douceur. Ce plan de 7 jours t\'accompagne vers un arrêt rapide et serein.',
    color: '#10B981', // Vert
    icon: '🌱'
  },
  P2: {
    id: 'P2',
    name: '📈 Transition Progressive',
    duration: 21,
    description: '21 jours pour réduire progressivement',
    explanation: 'Tu veux réduire sans pression et garder le contrôle. Ce plan de 21 jours t\'aide à diminuer étape par étape jusqu\'à l\'arrêt total.',
    color: '#F59E0B', // Orange
    icon: '📈'
  },
  P3: {
    id: 'P3',
    name: '💪 Accompagnement Renforcé',
    duration: 45,
    description: '45 jours pour se libérer durablement',
    explanation: 'Ton parcours nécessite un accompagnement plus long. Ce plan de 45 jours t\'aide à te libérer durablement avec patience et bienveillance.',
    color: '#EF4444', // Rouge
    icon: '💪'
  },
  P4: {
    id: 'P4',
    name: '🧘 Gestion du Stress',
    duration: 21,
    description: '21 jours pour gérer le stress naturellement',
    explanation: 'Tu fumes surtout pour évacuer le stress. Ce plan de 21 jours t\'apprend à te calmer naturellement, sans dépendance.',
    color: '#8B5CF6', // Bleu
    icon: '🧘'
  },
  P5: {
    id: 'P5',
    name: '🎉 Moments Festifs',
    duration: 14,
    description: '14 jours pour gérer les moments festifs',
    explanation: 'Tu fumes surtout en soirée ou avec les autres. Ce plan de 14 jours t\'aide à garder la main, même dans les moments festifs.',
    color: '#8B5CF6', // Violet
    icon: '🎉'
  },
  P6: {
    id: 'P6',
    name: '🎯 Focus & Concentration',
    duration: 21,
    description: '21 jours pour retrouver le focus sans cigarette',
    explanation: 'Tu fumes par habitude, pour faire une pause ou te concentrer. Ce plan de 21 jours t\'aide à retrouver ton focus sans cigarette.',
    color: '#F59E0B', // Jaune
    icon: '🎯'
  }
};

export interface PlanSelectionResult {
  selectedPlan: QuitPlan;
  reason: string;
  matchedCriteria: string[];
}

export function selectQuitPlan(profile: UserProfile): PlanSelectionResult {
  const matchedCriteria: string[] = [];
  
  // Étape 1: Évaluer les critères
  const cigsPerDay = profile.cigsPerDay || 0;
  const firstCigaretteTime = profile.firstCigaretteTime;
  const mainGoal = profile.mainGoal;
  const mainMotivation = profile.mainMotivation;
  const smokingTriggers = profile.smokingTriggers || [];
  const motivationLevel = profile.motivationLevel || 5;

  // Déterminer le niveau de dépendance
  const isStrongDependency = cigsPerDay > 20 || firstCigaretteTime === 'immediate';
  const isLightDependency = cigsPerDay < 10 && (firstCigaretteTime === 'after_1h' || firstCigaretteTime === 'after_30min');
  const isModerateDependency = cigsPerDay >= 10 && cigsPerDay <= 20 && (firstCigaretteTime === 'after_30min' || firstCigaretteTime === 'after_15min');

  // Déterminer le déclencheur principal
  const hasStressTrigger = smokingTriggers.includes('stress') || smokingTriggers.includes('emotion');
  const hasSocialTrigger = smokingTriggers.includes('social') || smokingTriggers.includes('evening_alcohol');
  const hasFocusTrigger = smokingTriggers.includes('phone_work') || smokingTriggers.includes('routine') || smokingTriggers.includes('boredom');

  // Déterminer l'objectif
  const wantsCompleteStop = mainGoal === 'complete_stop';
  const wantsProgressiveReduction = mainGoal === 'progressive_reduction';

  // Déterminer la motivation
  const isHighMotivation = motivationLevel >= 7;
  const isLowMotivation = motivationLevel <= 4;

  // Étape 2: Appliquer les règles de priorité

  // 1️⃣ Priorité 1: Dépendance forte
  if (isStrongDependency) {
    matchedCriteria.push(`Dépendance forte (${cigsPerDay} cigarettes/jour${firstCigaretteTime === 'immediate' ? ', première cigarette immédiate' : ''})`);
    return {
      selectedPlan: QUIT_PLANS.P3,
      reason: 'Dépendance forte détectée - accompagnement long nécessaire',
      matchedCriteria
    };
  }

  // 2️⃣ Priorité 2: Déclencheur stress/anxiété
  if (hasStressTrigger) {
    matchedCriteria.push('Déclencheur principal: stress/anxiété');
    return {
      selectedPlan: QUIT_PLANS.P4,
      reason: 'Fumeur anxieux - gestion du stress prioritaire',
      matchedCriteria
    };
  }

  // 3️⃣ Priorité 3: Déclencheur social/alcool
  if (hasSocialTrigger) {
    matchedCriteria.push('Déclencheur principal: social/alcool');
    return {
      selectedPlan: QUIT_PLANS.P5,
      reason: 'Fumeur social - gestion des moments festifs',
      matchedCriteria
    };
  }

  // 4️⃣ Priorité 4: Déclencheur focus/habitude/travail
  if (hasFocusTrigger) {
    matchedCriteria.push('Déclencheur principal: focus/habitude/travail');
    return {
      selectedPlan: QUIT_PLANS.P6,
      reason: 'Fumeur de routine - gestion des automatismes',
      matchedCriteria
    };
  }

  // 5️⃣ Priorité 5: Dépendance moyenne + réduction progressive
  if (isModerateDependency && (wantsProgressiveReduction || mainGoal === undefined)) {
    matchedCriteria.push(`Dépendance moyenne (${cigsPerDay} cigarettes/jour) et approche progressive`);
    return {
      selectedPlan: QUIT_PLANS.P2,
      reason: 'Dépendance modérée - approche progressive sécurisée',
      matchedCriteria
    };
  }

  // 6️⃣ Priorité 6: Fumeur léger + motivé + arrêt complet
  if (isLightDependency && isHighMotivation && wantsCompleteStop) {
    matchedCriteria.push(`Fumeur léger (${cigsPerDay} cigarettes/jour), motivé (${motivationLevel}/10), arrêt complet`);
    return {
      selectedPlan: QUIT_PLANS.P1,
      reason: 'Fumeur léger et motivé - arrêt rapide possible',
      matchedCriteria
    };
  }

  // 🔸 Fallback: Plan équilibré
  matchedCriteria.push('Profil équilibré - approche progressive recommandée');
  return {
    selectedPlan: QUIT_PLANS.P2,
    reason: 'Approche progressive équilibrée',
    matchedCriteria
  };
}

export function getPlanById(planId: string): QuitPlan | null {
  return QUIT_PLANS[planId] || null;
}
