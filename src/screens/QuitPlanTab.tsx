import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StarryBackground from '../components/StarryBackground';
import { Ionicons } from '@expo/vector-icons';
import { profileStorage, planValidationsStorage } from '../lib/storage';
import { UserProfile } from '../types';
import { HapticService } from '../lib/hapticService';
import { selectQuitPlan, QUIT_PLANS, QuitPlan, PlanSelectionResult } from '../utils/planSelection';
import { getPlanContent, PlanContent, PlanDay } from '../data/planContent';
import PlanDayView from './PlanDayView';
import PlanCalendarView from './PlanCalendarView';

const { width } = Dimensions.get('window');

export default function QuitPlanTab() {
  const [profile, setProfile] = useState<UserProfile>({
    startedSmokingYears: 0,
    cigsPerDay: 20,
    objectiveType: 'complete',
    reductionFrequency: 1,
  });
  const [planSelection, setPlanSelection] = useState<PlanSelectionResult | null>(null);
  const [hasStartedPlan, setHasStartedPlan] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'day'>('main');
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [validatedDays, setValidatedDays] = useState<number[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (planSelection) {
      loadAvailableDays();
    }
  }, [planSelection]);

  const loadProfile = async () => {
    try {
      const profileData = await profileStorage.get();
      if (profileData) {
        setProfile(profileData);
        // Sélectionner le plan basé sur le profil
        const selection = selectQuitPlan(profileData);
        setPlanSelection(selection);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const translateMotivation = (motivation: string | undefined): string => {
    const translations: Record<string, string> = {
      'health': 'Santé',
      'money': 'Économies',
      'family': 'Famille',
      'appearance': 'Apparence',
      'social': 'Social',
      'performance': 'Performance',
      'freedom': 'Liberté',
      'stress': 'Stress',
      'habit': 'Habitude',
      'other': 'Autre'
    };
    
    return motivation ? translations[motivation.toLowerCase()] || motivation : 'Santé';
  };

  const loadAvailableDays = async () => {
    if (planSelection) {
      try {
        // Forcer le rechargement depuis Supabase pour avoir les données les plus récentes
        const refreshedValidations = await planValidationsStorage.refresh();
        
        const available = await planValidationsStorage.getAvailableDays(planSelection.selectedPlan.id);
        setAvailableDays(available);
        
        // Charger les jours validés
        const validatedDaysList = await planValidationsStorage.getValidatedDays(planSelection.selectedPlan.id);
        setValidatedDays(validatedDaysList);
        
        // Le jour actuel est le premier jour disponible (celui qu'on peut valider aujourd'hui)
        // Si aucun jour n'est validé, le jour actuel est 1
        const currentDayNumber = available.length > 0 ? Math.max(...available) : 1;
        setCurrentDay(currentDayNumber);
        
        console.log('📅 Jours disponibles:', available, 'Jour actuel:', currentDayNumber, 'Jours validés:', validatedDaysList);
      } catch (error) {
        console.error('Erreur lors du chargement des jours disponibles:', error);
        setAvailableDays([1]); // Fallback au jour 1
        setCurrentDay(1);
        setValidatedDays([]);
      }
    }
  };

  const handleStartPlan = async () => {
    await HapticService.success();
    setHasStartedPlan(true);
    // Aller directement au jour actuel du plan
    if (planSelection) {
      const planContent = getPlanContent(planSelection.selectedPlan.id);
      if (planContent) {
        const currentDayContent = planContent.jours.find(day => day.jour === currentDay) || planContent.jours[0];
        setSelectedDay(currentDayContent);
        setCurrentView('day');
      }
    }
  };

  const handleViewPlan = async () => {
    await HapticService.subtle();
    // Aller directement au jour actuel du plan
    if (planSelection) {
      const planContent = getPlanContent(planSelection.selectedPlan.id);
      if (planContent) {
        const currentDayContent = planContent.jours.find(day => day.jour === currentDay) || planContent.jours[0];
        setSelectedDay(currentDayContent);
        setCurrentView('day');
      }
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedDay(null);
  };

  const handleDaySelect = (day: PlanDay) => {
    setSelectedDay(day);
    setCurrentView('day');
  };

  const handleNextDay = () => {
    if (planSelection && selectedDay) {
      const planContent = getPlanContent(planSelection.selectedPlan.id);
      if (planContent) {
        const nextDay = planContent.jours.find(d => d.jour === selectedDay.jour + 1);
        if (nextDay) {
          setSelectedDay(nextDay);
          setCurrentDay(selectedDay.jour); // Mettre à jour le jour actuel
        }
      }
    }
  };

  const handlePreviousDay = () => {
    if (planSelection && selectedDay) {
      const planContent = getPlanContent(planSelection.selectedPlan.id);
      if (planContent) {
        const previousDay = planContent.jours.find(d => d.jour === selectedDay.jour - 1);
        if (previousDay) {
          setSelectedDay(previousDay);
        }
      }
    }
  };

  const handleDayCompleted = async (dayNumber: number) => {
    if (planSelection) {
      try {
        // Sauvegarder la validation du jour
        await planValidationsStorage.addValidation(planSelection.selectedPlan.id, dayNumber);
        
        // Recharger les jours disponibles
        await loadAvailableDays();
        
        console.log(`✅ Jour ${dayNumber} validé avec succès`);
      } catch (error) {
        console.error('Erreur lors de la validation du jour:', error);
      }
    }
  };

  // Rendu conditionnel selon la vue actuelle
  if (currentView === 'calendar' && planSelection) {
    const planContent = getPlanContent(planSelection.selectedPlan.id);
    if (planContent) {
      return (
        <PlanCalendarView
          planContent={planContent}
          currentDay={currentDay}
          validatedDays={validatedDays}
          availableDays={availableDays}
          onBack={handleBackToMain}
          onDaySelect={handleDaySelect}
        />
      );
    }
  }

  if (currentView === 'day' && selectedDay && planSelection) {
    const planContent = getPlanContent(planSelection.selectedPlan.id);
    if (planContent) {
      return (
        <PlanDayView
          day={selectedDay}
          planId={planSelection.selectedPlan.id}
          onBack={handleBackToMain}
          onNext={handleNextDay}
          onPrevious={handlePreviousDay}
          canGoNext={selectedDay.jour < planContent.jours.length}
          canGoPrevious={selectedDay.jour > 1}
          onDayCompleted={handleDayCompleted}
        />
      );
    }
  }

  return (
    <StarryBackground>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.headerSubtitle}>
              Votre parcours personnalisé pour arrêter de fumer
            </Text>
          </View>

          {/* Plan sélectionné - simple */}
          {planSelection && (
            <View style={styles.selectedPlanSection}>
              <Text style={styles.planName}>{planSelection.selectedPlan.name}</Text>
            </View>
          )}

          {/* Bouton d'accès au plan */}
          <View style={styles.actionButtons}>
            {!hasStartedPlan ? (
              <TouchableOpacity 
                style={styles.accessButton}
                onPress={handleStartPlan}
              >
                <Text style={styles.accessButtonText}>🎯 J'accède à mon plan personnalisé</Text>
                <Text style={styles.accessButtonSubtext}>
                  Chaque jour, connectez-vous pour suivre votre progression et confirmer votre engagement
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.accessButton}
                onPress={handleViewPlan}
              >
                <Text style={styles.accessButtonText}>📋 J'accède à mon plan personnalisé</Text>
                <Text style={styles.accessButtonSubtext}>
                  Chaque jour, connectez-vous pour suivre votre progression et confirmer votre engagement
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Calendrier intégré */}
          {planSelection && (
            <View style={styles.calendarSection}>
              <Text style={styles.sectionTitle}>📅 Calendrier du Plan</Text>
              <View style={styles.calendarGrid}>
                {getPlanContent(planSelection.selectedPlan.id)?.jours.map((day) => {
                  const isCompleted = validatedDays.includes(day.jour);
                  const isCurrent = day.jour === currentDay;
                  const isAvailable = availableDays.includes(day.jour);
                  
                  return (
                    <TouchableOpacity
                      key={day.jour}
                      style={[
                        styles.dayBox,
                        isCompleted ? styles.completedDay : 
                        isCurrent ? styles.availableDay : styles.futureDay
                      ]}
                      onPress={() => {
                        if (isAvailable) {
                          setSelectedDay(day);
                          setCurrentView('day');
                        }
                      }}
                      disabled={!isAvailable}
                    >
                      <Text style={[
                        styles.dayNumber,
                        isCompleted ? styles.completedDayNumber : 
                        isCurrent ? styles.availableDayNumber : styles.futureDayNumber
                      ]}>
                        {day.jour}
                      </Text>
                      <Text style={[
                        styles.dayName,
                        isCompleted ? styles.completedDayText : 
                        isCurrent ? styles.availableDayText : styles.futureDayText
                      ]}>
                        {day.nom}
                      </Text>
                      {isCompleted && (
                        <View style={styles.checkIcon}>
                          <Ionicons name="checkmark" size={12} color="#10B981" />
                        </View>
                      )}
                      {isCurrent && (
                        <View style={styles.currentIcon}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}



        </View>
      </ScrollView>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071033',
  },
  starryBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  goldenStar: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    borderRadius: 1,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 15,
  },
  premiumBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  selectedPlanSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mainPlanCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  planIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  planDescription: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    textAlign: 'center',
  },
  explanationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  explanationText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  planDetails: {
    marginTop: 15,
  },
  planDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  planDetailLabel: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '500',
  },
  planDetailValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  profileNumber: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    textAlign: 'center',
  },
  motivationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  motivationLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '500',
  },
  motivationValue: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  calendarSection: {
    marginBottom: 30,
  },
  calendarButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  calendarButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  dayBox: {
    width: (width - 60) / 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  completedDay: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  availableDay: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
  },
  futureDay: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.6,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  completedDayNumber: {
    color: '#10B981',
  },
  availableDayNumber: {
    color: '#FFD700',
  },
  futureDayNumber: {
    color: '#64748B',
  },
  dayName: {
    fontSize: 10,
    lineHeight: 12,
  },
  completedDayText: {
    color: '#E2E8F0',
  },
  availableDayText: {
    color: '#FFD700',
  },
  futureDayText: {
    color: '#64748B',
  },
  checkIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  currentIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 10,
  },
  viewMoreText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  stepsSection: {
    marginBottom: 30,
  },
  stepsContainer: {
    marginTop: 15,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stepDescription: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    marginBottom: 30,
  },
  accessButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 15,
  },
  accessButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  accessButtonSubtext: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  secondaryButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextStepsSection: {
    marginBottom: 20,
  },
  nextStepsList: {
    marginTop: 15,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  nextStepIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  nextStepText: {
    color: '#E2E8F0',
    fontSize: 14,
    flex: 1,
  },
  whiteStar: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
});
