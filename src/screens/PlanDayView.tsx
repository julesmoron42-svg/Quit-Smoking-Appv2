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
import { PlanDay } from '../data/planContent';
import { HapticService } from '../lib/hapticService';
import { planValidationsStorage } from '../lib/storage';

const { width } = Dimensions.get('window');

interface PlanDayViewProps {
  day: PlanDay;
  planId: string;
  onBack: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onDayCompleted?: (dayNumber: number) => void;
}

export default function PlanDayView({
  day,
  planId,
  onBack,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  onDayCompleted,
}: PlanDayViewProps) {
  const [hasCompletedAction, setHasCompletedAction] = useState(false);
  const [hasPronouncedAllegiance, setHasPronouncedAllegiance] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    checkDayValidationStatus();
  }, [day.jour, planId]);

  const checkDayValidationStatus = async () => {
    try {
      const validatedDays = await planValidationsStorage.getValidatedDays(planId);
      const isDayValidated = validatedDays.includes(day.jour);
      setHasPronouncedAllegiance(isDayValidated);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de validation:', error);
    }
  };

  const handleCompleteAction = async () => {
    await HapticService.success();
    setHasCompletedAction(true);
    Alert.alert(
      '🎉 Bravo !',
      'Vous avez accompli votre action du jour. Continuez comme ça !',
      [{ text: 'Merci !', style: 'default' }]
    );
  };

  const handleAllegiance = async () => {
    if (hasPronouncedAllegiance || isValidating) {
      return; // Empêcher le re-clic
    }

    setIsValidating(true);
    await HapticService.success();
    
    // Vérifier si on peut valider ce jour
    const canValidate = await planValidationsStorage.canValidateDay(planId, day.jour);
    
    if (canValidate) {
      // Marquer le jour comme terminé
      if (onDayCompleted) {
        onDayCompleted(day.jour);
      }
      
      setHasPronouncedAllegiance(true);
      
      Alert.alert(
        '🎉 Bravo !',
        `Tu as accompli le jour ${day.jour} ! Reviens demain pour découvrir les actions à mener pour le jour ${day.jour + 1}.`,
        [{ text: 'Parfait !', style: 'default' }]
      );
    } else {
      Alert.alert(
        '⏰ Patience !',
        'Tu ne peux valider qu\'un jour par jour. Reviens demain pour continuer ton parcours.',
        [{ text: 'Compris !', style: 'default' }]
      );
    }
    
    setIsValidating(false);
  };

  return (
    <View style={styles.container}>
      {/* Ciel étoilé en arrière-plan */}
      <View style={styles.starryBackground}>
        {/* Étoiles statiques */}
        <View style={[styles.star, styles.star1]} />
        <View style={[styles.star, styles.star2]} />
        <View style={[styles.star, styles.star3]} />
        <View style={[styles.star, styles.star4]} />
        <View style={[styles.star, styles.star5]} />
        <View style={[styles.star, styles.star6]} />
        <View style={[styles.star, styles.star7]} />
        <View style={[styles.star, styles.star8]} />
        <View style={[styles.star, styles.star9]} />
        <View style={[styles.star, styles.star10]} />
        <View style={[styles.star, styles.star11]} />
        <View style={[styles.star, styles.star12]} />
        <View style={[styles.star, styles.star13]} />
        <View style={[styles.star, styles.star14]} />
        <View style={[styles.star, styles.star15]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header avec navigation */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Jour {day.jour}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* One-pager design */}
        <View style={styles.onePagerContainer}>
          {/* Titre principal */}
          <View style={styles.mainTitleSection}>
            <Text style={styles.dayNumber}>Jour {day.jour}</Text>
            <Text style={styles.dayName}>{day.nom}</Text>
            <Text style={styles.dayObjective}>{day.objectif}</Text>
          </View>

          {/* Contenu principal en grille */}
          <View style={styles.contentGrid}>
            {/* Action du jour - Section principale */}
            <View style={styles.mainActionSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.sectionTitle}>Action du jour</Text>
              </View>
              <Text style={styles.mainActionText}>{day.action}</Text>
              <View style={styles.actionDetails}>
                <Text style={styles.actionDetailsText}>
                  💡 Cette action t'aide à progresser vers ton objectif : {day.objectif}
                </Text>
              </View>
            </View>

            {/* Info santé et motivation côte à côte */}
            <View style={styles.sideBySideSection}>
              <View style={styles.halfSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="medical" size={18} color="#8B5CF6" />
                  <Text style={styles.sectionTitle}>Info santé</Text>
                </View>
                <Text style={styles.halfSectionText}>{day.info_sante}</Text>
              </View>
              
              <View style={styles.halfSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="heart" size={18} color="#EF4444" />
                  <Text style={styles.sectionTitle}>Motivation</Text>
                </View>
                <Text style={styles.halfSectionText}>{day.motivation}</Text>
              </View>
            </View>

            {/* Section Progrès - pleine largeur */}
            <View style={styles.fullWidthSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Progrès</Text>
              </View>
              <Text style={styles.statsText}>{day.stat}</Text>
            </View>

            {/* Section Engagement - pleine largeur */}
            <View style={styles.fullWidthSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="star" size={20} color="#8B5CF6" />
                <Text style={styles.sectionTitle}>Engagement</Text>
              </View>
              <Text style={styles.engagementText}>{day.allegeance}</Text>
              
              {/* Message conditionnel */}
              {!hasPronouncedAllegiance && (
                <Text style={styles.conditionalMessage}>
                  Si tu as bien accompli les actions du jour {day.jour}, tu peux passer au jour {day.jour + 1}.
                </Text>
              )}
              
                {!hasPronouncedAllegiance && (
                  <TouchableOpacity
                    style={[
                      styles.engagementButton,
                      isValidating && styles.engagementButtonDisabled
                    ]}
                    onPress={handleAllegiance}
                    disabled={isValidating}
                  >
                    <LinearGradient
                      colors={isValidating ? ['#6B7280', '#4B5563'] : ['#8B5CF6', '#7C3AED', '#6D28D9']}
                      style={styles.engagementButtonGradient}
                    >
                      <Text style={styles.engagementButtonText}>
                        {isValidating ? '⏳ Validation...' : '✨ Confirmer'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              
              {hasPronouncedAllegiance && (
                <View style={styles.completedIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.completedText}>Confirmé !</Text>
                </View>
              )}
            </View>
          </View>

          {/* Navigation */}
          <View style={styles.navigationContainer}>
            {canGoPrevious && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={onPrevious}
              >
                <Ionicons name="chevron-back" size={20} color="#8B5CF6" />
                <Text style={styles.navButtonText}>Jour précédent</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  starryBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0a',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  star1: { top: '10%', left: '10%', width: 2, height: 2 },
  star2: { top: '20%', left: '80%', width: 1, height: 1 },
  star3: { top: '30%', left: '20%', width: 2, height: 2 },
  star4: { top: '40%', left: '70%', width: 1, height: 1 },
  star5: { top: '50%', left: '15%', width: 2, height: 2 },
  star6: { top: '60%', left: '85%', width: 1, height: 1 },
  star7: { top: '70%', left: '25%', width: 2, height: 2 },
  star8: { top: '80%', left: '75%', width: 1, height: 1 },
  star9: { top: '15%', left: '50%', width: 1, height: 1 },
  star10: { top: '35%', left: '40%', width: 2, height: 2 },
  star11: { top: '55%', left: '60%', width: 1, height: 1 },
  star12: { top: '75%', left: '45%', width: 2, height: 2 },
  star13: { top: '25%', left: '30%', width: 1, height: 1 },
  star14: { top: '65%', left: '90%', width: 2, height: 2 },
  star15: { top: '85%', left: '5%', width: 1, height: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },
  onePagerContainer: {
    flex: 1,
  },
  mainTitleSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 5,
  },
  dayName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  dayObjective: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  contentGrid: {
    gap: 20,
  },
  mainActionSection: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  mainActionText: {
    fontSize: 18,
    color: '#E2E8F0',
    lineHeight: 26,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionDetails: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  actionDetailsText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  sideBySideSection: {
    flexDirection: 'row',
    gap: 15,
  },
  halfSection: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fullWidthSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 15,
  },
  halfSectionText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  statsText: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  engagementText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 10,
    textAlign: 'center',
  },
  conditionalMessage: {
    color: '#F59E0B',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  engagementButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  engagementButtonDisabled: {
    opacity: 0.6,
  },
  engagementButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  engagementButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  completedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  navButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
