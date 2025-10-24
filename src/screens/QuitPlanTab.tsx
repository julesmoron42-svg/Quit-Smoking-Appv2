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
import { profileStorage } from '../lib/storage';
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

  useEffect(() => {
    loadProfile();
  }, []);

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

  const handleStartPlan = async () => {
    await HapticService.success();
    setHasStartedPlan(true);
    // Aller directement au jour actuel du plan
    if (planSelection) {
      const planContent = getPlanContent(planSelection.selectedPlan.id);
      if (planContent) {
        const currentDayContent = planContent.jours.find(day => day.jour === currentDay + 1) || planContent.jours[0];
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
        const currentDayContent = planContent.jours.find(day => day.jour === currentDay + 1) || planContent.jours[0];
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

  // Rendu conditionnel selon la vue actuelle
  if (currentView === 'calendar' && planSelection) {
    const planContent = getPlanContent(planSelection.selectedPlan.id);
    if (planContent) {
      return (
        <PlanCalendarView
          planContent={planContent}
          currentDay={currentDay}
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
            <Text style={styles.headerTitle}>🎯 Mon Plan de Sevrage</Text>
            <Text style={styles.headerSubtitle}>
              Votre parcours personnalisé pour arrêter de fumer
            </Text>
          </View>

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

          {/* Section profil utilisateur */}
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>👤 Votre Profil</Text>
            
            <View style={styles.profileGrid}>
              <View style={styles.profileCard}>
                <Text style={styles.profileIcon}>🚬</Text>
                <Text style={styles.profileNumber}>{profile.cigsPerDay}</Text>
                <Text style={styles.profileLabel}>Cigarettes/jour</Text>
              </View>
              
              <View style={styles.profileCard}>
                <Text style={styles.profileIcon}>📅</Text>
                <Text style={styles.profileNumber}>{profile.smokingYears || profile.startedSmokingYears}</Text>
                <Text style={styles.profileLabel}>Années de tabac</Text>
              </View>
              
              <View style={styles.profileCard}>
                <Text style={styles.profileIcon}>💪</Text>
                <Text style={styles.profileNumber}>{profile.motivationLevel || 5}/10</Text>
                <Text style={styles.profileLabel}>Motivation</Text>
              </View>
            </View>
            
            {/* Raison principale de l'arrêt */}
            <View style={styles.motivationBox}>
              <Text style={styles.motivationLabel}>
                Raison principale : <Text style={styles.motivationValue}>{profile.mainMotivation || 'Santé'}</Text>
              </Text>
            </View>
          </View>

          {/* Calendrier intégré */}
          {planSelection && (
            <View style={styles.calendarSection}>
              <Text style={styles.sectionTitle}>📅 Calendrier du Plan</Text>
              <View style={styles.calendarGrid}>
                {getPlanContent(planSelection.selectedPlan.id)?.jours.map((day) => (
                  <TouchableOpacity
                    key={day.jour}
                    style={[
                      styles.dayBox,
                      day.jour <= currentDay ? styles.completedDay : styles.futureDay
                    ]}
                    onPress={() => {
                      setSelectedDay(day);
                      setCurrentView('day');
                    }}
                    disabled={day.jour > currentDay}
                  >
                    <Text style={[
                      styles.dayNumber,
                      day.jour <= currentDay ? styles.completedDayNumber : styles.futureDayNumber
                    ]}>
                      {day.jour}
                    </Text>
                    <Text style={[
                      styles.dayName,
                      day.jour <= currentDay ? styles.completedDayText : styles.futureDayText
                    ]}>
                      {day.nom}
                    </Text>
                    {day.jour <= currentDay && (
                      <View style={styles.checkIcon}>
                        <Ionicons name="checkmark" size={12} color="#10B981" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
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
    marginBottom: 30,
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
  futureDayText: {
    color: '#64748B',
  },
  checkIcon: {
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
