// Types pour les abonnements et fonctionnalités premium

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly';
  features: string[];
  productId: string; // ID du produit in-app (sera utilisé plus tard)
}

export interface UserSubscription {
  id?: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate?: string;
  productId: string;
  transactionId?: string;
  receipt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'crisis' | 'meditation' | 'analytics' | 'social';
  isAvailable: boolean;
  requiresPremium: boolean;
}

export interface SubscriptionContextType {
  isPremium: boolean;
  subscription: UserSubscription | null;
  isLoading: boolean;
  purchaseSubscription: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  checkSubscriptionStatus: () => Promise<void>;
}

// Plans d'abonnement disponibles
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'panic_bundle',
    name: 'Pack Panique',
    description: 'Outils de crise et relaxation',
    price: 0, // Tarifs masqués pour l'instant
    currency: 'EUR',
    duration: 'monthly',
    productId: 'com.myquitzone.panic.bundle',
    features: [
      'Bouton panique avec exercices de respiration',
      'Bibliothèque de méditations guidées',
      'Sons de relaxation et bruits blancs'
    ]
  },
  {
    id: 'ai_therapist_bundle',
    name: 'Pack Coach IA',
    description: 'Assistant IA personnalisé',
    price: 0, // Tarifs masqués pour l'instant
    currency: 'EUR',
    duration: 'monthly',
    productId: 'com.myquitzone.ai.therapist',
    features: [
      'Coach IA disponible 24/7',
      'Conseils personnalisés',
      'Suivi émotionnel intelligent'
    ]
  },
  {
    id: 'premium_all',
    name: 'Pack Complet',
    description: 'Toutes les fonctionnalités premium',
    price: 0, // Tarifs masqués pour l'instant
    currency: 'EUR',
    duration: 'monthly',
    productId: 'com.myquitzone.premium.all',
    features: [
      'Toutes les fonctionnalités du Pack Panique',
      'Toutes les fonctionnalités du Pack Coach IA',
      'Support prioritaire',
      'Nouveautés en avant-première'
    ]
  }
];

// Fonctionnalités premium
export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'breathing_exercises',
    title: 'Exercices de Respiration',
    description: 'Techniques guidées pour gérer le stress et l\'anxiété',
    icon: '🫁',
    category: 'meditation',
    isAvailable: false,
    requiresPremium: true
  },
  {
    id: 'meditation_library',
    title: 'Bibliothèque de Méditations',
    description: 'Séances de méditation adaptées au sevrage tabagique',
    icon: '🧘',
    category: 'meditation',
    isAvailable: false,
    requiresPremium: true
  },
  {
    id: 'relaxation_sounds',
    title: 'Sons de Relaxation',
    description: 'Bruits blancs, nature et ambiances apaisantes',
    icon: '🎵',
    category: 'meditation',
    isAvailable: false,
    requiresPremium: true
  }
];
