import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../contexts/SubscriptionContextMock';
import { PREMIUM_FEATURES, SUBSCRIPTION_PLANS } from '../types/subscription';
import PremiumFeatureCard from '../components/PremiumFeatureCard';
import BreathingExerciseWithSound from '../components/BreathingExerciseWithSound';
import MeditationExerciseWithSound from '../components/MeditationExerciseWithSound';
import MeditationAntiSmokingExercises from '../components/MeditationAntiSmokingExercises';

const { width } = Dimensions.get('window');

export default function PremiumTab() {
  const { isPremium, purchaseSubscription, restorePurchases, isLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[2]); // Pack Complet par défaut
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [showMeditationExercise, setShowMeditationExercise] = useState(false);
  
  // Statistiques de panique (à récupérer depuis le contexte ou localStorage)
  const [panicStats, setPanicStats] = useState({
    panicCount: 0,
    successCount: 0,
  });

  // Charger les stats depuis le storage au montage
  useEffect(() => {
    const loadStats = async () => {
      try {
        const storedStats = await sessionStorage.getItem('panicStats');
        if (storedStats) {
          setPanicStats(JSON.parse(storedStats));
        }
      } catch (error) {
        console.log('Erreur lors du chargement des stats:', error);
      }
    };
    loadStats();
  }, []);


  const handlePurchase = async () => {
    try {
      const success = await purchaseSubscription(selectedPlan.productId);
      if (success) {
        console.log('Achat initié avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
    }
  };

  const handleRestore = async () => {
    await restorePurchases();
  };


  const handleFeaturePress = (feature: any) => {
    if (isPremium) {
      // Vérifier si c'est une fonctionnalité d'exercice
      if (feature.id === 'breathing_exercises') {
        setShowBreathingExercise(true);
      } else if (feature.id === 'meditation_library') {
        setShowMeditationExercise(true);
      } else {
        Alert.alert(
          'Fonctionnalité disponible',
          `La fonctionnalité "${feature.title}" sera bientôt disponible !`,
          [{ text: 'OK' }]
        );
      }
    } else {
      Alert.alert(
        'Fonctionnalité Premium',
        `Cette fonctionnalité est disponible avec l'abonnement Premium. Voulez-vous vous abonner ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'S\'abonner', onPress: handlePurchase }
        ]
      );
    }
  };

  // Fonction pour mettre à jour les stats
  const updatePanicStats = async (newStats: { panicCount: number; successCount: number }) => {
    setPanicStats(newStats);
    try {
      await sessionStorage.setItem('panicStats', JSON.stringify(newStats));
    } catch (error) {
      console.log('Erreur lors de la sauvegarde des stats:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#071033', '#1E293B']}
      style={styles.container}
    >
      {/* Fond étoilé */}
      <View style={styles.starryBackground}>
        {Array.from({ length: 50 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🚨 Zone de Panique</Text>
          <Text style={styles.subtitle}>
            Outils d'urgence pour gérer tes envies
          </Text>
        </View>

        {/* Section d'urgence */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>💪 Tu peux le faire !</Text>
          <Text style={styles.emergencyText}>
            Chaque envie passera. Utilise ces outils pour te calmer et reprendre le contrôle.
          </Text>
        </View>

        {/* Boutons ronds pour les features */}
        <View style={styles.featuresGrid}>
          <TouchableOpacity 
            style={[styles.featureButton, styles.breathingButton]}
            onPress={() => handleFeaturePress({ id: 'breathing_exercises', title: 'Respiration' })}
          >
            <Text style={styles.featureEmoji}>🫁</Text>
            <Text style={styles.featureText}>Respiration</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.featureButton, styles.meditationButton]}
            onPress={() => handleFeaturePress({ id: 'meditation_library', title: 'Méditation' })}
          >
            <Text style={styles.featureEmoji}>🧘</Text>
            <Text style={styles.featureText}>Méditation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.featureButton, styles.soundsButton]}
            onPress={() => Alert.alert('Bientôt disponible', 'Les sons apaisants arrivent bientôt !')}
          >
            <Text style={styles.featureEmoji}>🔊</Text>
            <Text style={styles.featureText}>Sons</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.featureButton, styles.coachButton]}
            onPress={() => Alert.alert('Bientôt disponible', 'Le coach IA arrive bientôt !')}
          >
            <Text style={styles.featureEmoji}>🤖</Text>
            <Text style={styles.featureText}>Coach IA</Text>
          </TouchableOpacity>
        </View>

        {/* Section motivation */}
        <View style={styles.motivationSection}>
          <Text style={styles.motivationTitle}>🎯 Rappel de tes objectifs</Text>
          <View style={styles.motivationCards}>
            <View style={styles.motivationCard}>
              <Text style={styles.motivationEmoji}>💪</Text>
              <Text style={styles.motivationText}>Tu es plus fort que cette envie</Text>
            </View>
            <View style={styles.motivationCard}>
              <Text style={styles.motivationEmoji}>⏰</Text>
              <Text style={styles.motivationText}>L'envie ne dure que 5 minutes</Text>
            </View>
            <View style={styles.motivationCard}>
              <Text style={styles.motivationEmoji}>🏆</Text>
              <Text style={styles.motivationText}>Chaque victoire te rapproche du but</Text>
            </View>
          </View>
        </View>

        {/* Statistiques de panique */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>📊 Tes Victoires</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🚨</Text>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>{panicStats.panicCount}</Text>
              <Text style={styles.statLabel}>Utilisations</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={[styles.statNumber, { color: '#22C55E' }]}>{panicStats.successCount}</Text>
              <Text style={styles.statLabel}>Succès</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>📈</Text>
              <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
                {panicStats.panicCount > 0 ? Math.round((panicStats.successCount / panicStats.panicCount) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Taux de réussite</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modales d'exercices */}
      {showBreathingExercise && (
        <View style={styles.modalContainer}>
          <BreathingExerciseWithSound 
            onClose={() => setShowBreathingExercise(false)} 
            onStatsUpdate={updatePanicStats}
            panicStats={panicStats}
          />
        </View>
      )}

      {showMeditationExercise && (
        <View style={styles.modalContainer}>
          <MeditationAntiSmokingExercises 
            onClose={() => setShowMeditationExercise(false)} 
            onStatsUpdate={updatePanicStats}
            panicStats={panicStats}
          />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  starryBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
  },
  premiumCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  freeCard: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: '#64748B',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  premiumText: {
    color: '#3B82F6',
  },
  freeText: {
    color: '#64748B',
  },
  statusDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  plansSection: {
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  selectedPlanCard: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  planDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 15,
    lineHeight: 20,
  },
  planFeatures: {
    marginTop: 10,
  },
  planFeature: {
    fontSize: 13,
    color: '#E2E8F0',
    marginBottom: 5,
    lineHeight: 18,
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  emergencySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emergencyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emergencyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  featureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  breathingButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: 'rgba(76, 175, 80, 0.7)',
  },
  meditationButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
    borderColor: 'rgba(255, 152, 0, 0.7)',
  },
  soundsButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.7)',
  },
  coachButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(59, 130, 246, 0.7)',
  },
  featureEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  motivationSection: {
    marginBottom: 30,
  },
  motivationTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  motivationCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  motivationCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  motivationEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  motivationText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  actionSection: {
    marginBottom: 30,
  },
  purchaseButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  purchaseButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  restoreButton: {
    padding: 15,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  infoSection: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
  },
});
