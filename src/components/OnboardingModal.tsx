import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StarryBackground from './StarryBackground';

const { width } = Dimensions.get('window');

export interface OnboardingData {
  // Section 1: Profil Fumeur
  smokingYears: number;
  cigsPerDay: number;
  firstCigaretteTime: 'less_5min' | '5_30min' | '30_60min' | 'more_60min';
  smokingPeakTime: 'morning' | 'after_meals' | 'work_breaks' | 'evening_alcohol' | 'all_day';
  
  // Section 2: Objectif
  mainGoal: 'complete_stop' | 'progressive_reduction';
  targetDate?: string; // Pour arrêt complet
  reductionFrequency?: number; // Pour réduction progressive (cigarettes par jour)
  mainMotivation: 'health' | 'finance' | 'family' | 'sport' | 'independence';
  
  // Section 3: Habitudes et Déclencheurs
  smokingTriggers: ('stress' | 'boredom' | 'after_meals' | 'evening_alcohol' | 'social' | 'phone_work' | 'routine')[];
  emotionHelp: 'stress_anxiety' | 'concentration' | 'boredom' | 'social_pressure' | 'habit';
  stressLevel: number; // 1-10
  
  // Section 4: Historique
  previousAttempts: 'first_time' | '1_2_times' | 'several_times' | 'relapse_quick';
  relapseCause?: ('stress_emotion' | 'social' | 'morning_habit' | 'no_motivation' | 'no_support')[]; // Si rechute
  
  // Section 5: Motivation & Soutien
  motivationLevel: number; // 1-10
  wantSupportMessages: boolean;
}

interface OnboardingModalProps {
  visible: boolean;
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const steps = [
    // Section 1: Profil Fumeur
    { section: 'Profil Fumeur', questions: [
      { key: 'smokingYears', label: 'Depuis combien d\'années fumez-vous ?', type: 'number', placeholder: 'Ex: 5' },
      { key: 'cigsPerDay', label: 'Combien de cigarettes fumez-vous par jour ?', type: 'slider', min: 0, max: 30, step: 1 },
      { key: 'firstCigaretteTime', label: 'Après votre réveil, combien de temps avant votre première cigarette ?', type: 'select', options: [
        { value: 'less_5min', label: 'Moins de 5 minutes' },
        { value: '5_30min', label: '5 à 30 minutes' },
        { value: '30_60min', label: '30 à 60 minutes' },
        { value: 'more_60min', label: 'Plus de 60 minutes' }
      ]},
      { key: 'smokingPeakTime', label: 'Quand fumez-vous le plus dans la journée ?', type: 'select', options: [
        { value: 'morning', label: 'Le matin' },
        { value: 'after_meals', label: 'Après les repas' },
        { value: 'work_breaks', label: 'Au travail / en pause' },
        { value: 'evening_alcohol', label: 'En soirée / avec alcool' },
        { value: 'all_day', label: 'Tout au long de la journée' }
      ]}
    ]},
    // Section 2: Objectif
    { section: 'Objectif', questions: [
      { key: 'mainGoal', label: 'Quel est votre objectif principal ?', type: 'select', options: [
        { value: 'complete_stop', label: 'Arrêt complet' },
        { value: 'progressive_reduction', label: 'Réduction progressive' }
      ]},
      { key: 'targetDate', label: 'Quand souhaitez-vous arrêter ?', type: 'date', showIf: 'complete_stop' },
      { key: 'reductionFrequency', label: 'Fréquence de réduction (cigarettes par semaine)', type: 'slider', min: 1, max: 7, step: 1, showIf: 'progressive_reduction' },
      { key: 'mainMotivation', label: 'Pourquoi souhaitez-vous arrêter ?', type: 'select', options: [
        { value: 'health', label: 'Santé' },
        { value: 'finance', label: 'Argent' },
        { value: 'family', label: 'Famille / proches' },
        { value: 'sport', label: 'Performance sportive' },
        { value: 'independence', label: 'Autonomie personnelle / discipline' }
      ]}
    ]},
    // Section 3: Habitudes et Déclencheurs
    { section: 'Habitudes et Déclencheurs', questions: [
      { key: 'smokingTriggers', label: 'Dans quelles situations l\'envie est la plus forte ? (sélectionnez tout ce qui s\'applique)', type: 'multiselect', options: [
        { value: 'stress', label: 'Stress / tension' },
        { value: 'boredom', label: 'Ennui' },
        { value: 'after_meals', label: 'Après les repas' },
        { value: 'evening_alcohol', label: 'En soirée / alcool' },
        { value: 'social', label: 'Moments sociaux / entre amis' },
        { value: 'phone_work', label: 'Téléphone / travail' },
        { value: 'routine', label: 'Automatisme / routine' }
      ]},
      { key: 'emotionHelp', label: 'Quelle émotion la cigarette vous aide le plus à gérer ?', type: 'select', options: [
        { value: 'stress_anxiety', label: 'Stress / anxiété' },
        { value: 'concentration', label: 'Éparpillement / difficulté à se concentrer' },
        { value: 'boredom', label: 'Ennui / vide' },
        { value: 'social_pressure', label: 'Pression sociale / besoin d\'appartenance' },
        { value: 'habit', label: 'Aucun — c\'est juste l\'habitude' }
      ]},
      { key: 'stressLevel', label: 'Sur une échelle de 1 à 10, quel est votre niveau de stress général ?', type: 'slider', min: 1, max: 10, step: 1 }
    ]},
    // Section 4: Historique
    { section: 'Historique', questions: [
      { key: 'previousAttempts', label: 'Avez-vous déjà essayé d\'arrêter ?', type: 'select', options: [
        { value: 'first_time', label: 'Non, première fois' },
        { value: '1_2_times', label: 'Oui, 1-2 fois' },
        { value: 'several_times', label: 'Oui, plusieurs fois' },
        { value: 'relapse_quick', label: 'Oui, mais j\'ai rechuté rapidement' }
      ]},
      { key: 'relapseCause', label: 'Qu\'est-ce qui a causé la reprise ? (sélectionnez tout ce qui s\'applique)', type: 'multiselect', options: [
        { value: 'stress_emotion', label: 'Stress / émotion forte' },
        { value: 'social', label: 'Moments sociaux' },
        { value: 'morning_habit', label: 'Habitude au réveil' },
        { value: 'no_motivation', label: 'Manque de motivation' },
        { value: 'no_support', label: 'Pas d\'accompagnement / seul' }
      ], showIf: 'relapse_quick' }
    ]},
    // Section 5: Motivation & Soutien
    { section: 'Motivation & Soutien', questions: [
      { key: 'motivationLevel', label: 'Sur une échelle de 1 à 10, à quel point êtes-vous motivé(e) maintenant ?', type: 'slider', min: 1, max: 10, step: 1 },
      { key: 'wantSupportMessages', label: 'Voulez-vous recevoir des messages de soutien personnalisés ?', type: 'boolean', options: [
        { value: true, label: 'Oui' },
        { value: false, label: 'Non' }
      ]}
    ]}
  ];

  // Filtrer les questions selon les conditions et l'objectif sélectionné
  const getVisibleQuestions = (stepQuestions: any[]) => {
    return stepQuestions.filter(question => {
      if (!question.showIf) return true;
      
      // Conditions pour les questions conditionnelles
      if (question.showIf === 'complete_stop') {
        return data.mainGoal === 'complete_stop';
      }
      if (question.showIf === 'progressive_reduction') {
        return data.mainGoal === 'progressive_reduction';
      }
      if (question.showIf === 'relapse_quick') {
        return data.previousAttempts === 'relapse_quick';
      }
      
      return true;
    });
  };

  const currentStepData = steps[currentStep];
  const visibleQuestions = getVisibleQuestions(currentStepData.questions);
  const currentQuestion = visibleQuestions[currentQuestionIndex];

  const handleNext = () => {
    // Vérifier si on peut passer à la question suivante
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentStep < steps.length - 1) {
      // Passer à la section suivante
      setCurrentStep(currentStep + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Validation finale
      if (validateData()) {
        onComplete(data as OnboardingData);
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentStep > 0) {
      // Retourner à la section précédente
      const prevStep = currentStep - 1;
      const prevVisibleQuestions = getVisibleQuestions(steps[prevStep].questions);
      setCurrentStep(prevStep);
      setCurrentQuestionIndex(prevVisibleQuestions.length - 1);
    }
  };

  const validateData = (): boolean => {
    console.log('Validation des données onboarding:', data);
    
    // Validation des champs obligatoires de base
    if (!data.smokingYears || data.smokingYears < 0) {
      console.log('Erreur: smokingYears invalide');
      Alert.alert('Erreur', 'Veuillez entrer un nombre d\'années valide');
      return false;
    }
    if (data.cigsPerDay === undefined || data.cigsPerDay < 0) {
      console.log('Erreur: cigsPerDay invalide');
      Alert.alert('Erreur', 'Veuillez entrer un nombre de cigarettes valide');
      return false;
    }
    if (!data.firstCigaretteTime || !data.smokingPeakTime || !data.mainGoal || 
        !data.mainMotivation || !data.smokingTriggers?.length || 
        !data.emotionHelp || data.stressLevel === undefined || 
        !data.previousAttempts || data.motivationLevel === undefined || 
        data.wantSupportMessages === undefined) {
      console.log('Erreur: champs obligatoires manquants');
      Alert.alert('Erreur', 'Veuillez répondre à toutes les questions');
      return false;
    }
    
    // Validation conditionnelle selon l'objectif
    if (data.mainGoal === 'complete_stop' && !data.targetDate) {
      console.log('Erreur: targetDate manquante pour arrêt complet');
      Alert.alert('Erreur', 'Veuillez sélectionner une date d\'arrêt');
      return false;
    }
    if (data.mainGoal === 'progressive_reduction' && (data.reductionFrequency === undefined || data.reductionFrequency < 1)) {
      console.log('Erreur: reductionFrequency invalide');
      Alert.alert('Erreur', 'Veuillez définir une fréquence de réduction valide (au moins 1 cigarette par semaine)');
      return false;
    }
    
    // Validation conditionnelle pour les causes de rechute
    if (data.previousAttempts === 'relapse_quick' && (!data.relapseCause || data.relapseCause.length === 0)) {
      console.log('Erreur: relapseCause manquante');
      Alert.alert('Erreur', 'Veuillez indiquer les causes de votre rechute');
      return false;
    }
    
    console.log('Validation réussie');
    return true;
  };

  const handleInputChange = (key: string, value: any) => {
    console.log(`Onboarding: ${key} = ${value}`);
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiSelect = (key: string, value: string) => {
    setData(prev => {
      const currentValues = (prev[key as keyof OnboardingData] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [key]: newValues };
    });
  };

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'number':
        return (
          <TextInput
            style={styles.input}
            placeholder={question.placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            keyboardType="numeric"
            value={data[question.key as keyof OnboardingData]?.toString() || ''}
            onChangeText={(text) => handleInputChange(question.key, parseInt(text) || 0)}
          />
        );
      
      case 'date':
        return (
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={data[question.key as keyof OnboardingData]?.toString() || ''}
            onChangeText={(text) => handleInputChange(question.key, text)}
          />
        );
      
      case 'slider':
        const min = question.min || 0;
        const max = question.max || 10;
        const step = question.step || 1;
        const currentValue = data[question.key as keyof OnboardingData] as number || min;
        
        // Initialiser la valeur par défaut si elle n'existe pas
        if (data[question.key as keyof OnboardingData] === undefined) {
          handleInputChange(question.key, min);
        }
        
        const getSliderLabel = () => {
          if (question.key === 'cigsPerDay') {
            return `${currentValue} cigarette${currentValue > 1 ? 's' : ''} par jour`;
          } else if (question.key === 'reductionFrequency') {
            return `${currentValue} cigarette${currentValue > 1 ? 's' : ''} par semaine`;
          } else if (question.key === 'stressLevel') {
            return `Niveau de stress: ${currentValue}/10`;
          } else if (question.key === 'motivationLevel') {
            return `Motivation: ${currentValue}/10`;
          }
          return currentValue.toString();
        };
        
        return (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              {getSliderLabel()}
            </Text>
            <View style={styles.sliderButtons}>
              <TouchableOpacity
                style={[styles.sliderButton, currentValue <= min && styles.sliderButtonDisabled]}
                onPress={() => currentValue > min && handleInputChange(question.key, currentValue - step)}
                disabled={currentValue <= min}
              >
                <Text style={styles.sliderButtonText}>-</Text>
              </TouchableOpacity>
              
              <Text style={styles.sliderValue}>{currentValue}</Text>
              
              <TouchableOpacity
                style={[styles.sliderButton, currentValue >= max && styles.sliderButtonDisabled]}
                onPress={() => currentValue < max && handleInputChange(question.key, currentValue + step)}
                disabled={currentValue >= max}
              >
                <Text style={styles.sliderButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 'select':
        return (
          <View style={styles.optionsContainer}>
            {question.options.map((option: any) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  data[question.key as keyof OnboardingData] === option.value && styles.optionButtonSelected
                ]}
                onPress={() => handleInputChange(question.key, option.value)}
              >
                <Text style={[
                  styles.optionText,
                  data[question.key as keyof OnboardingData] === option.value && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'multiselect':
        const currentValues = (data[question.key as keyof OnboardingData] as string[]) || [];
        return (
          <View style={styles.optionsContainer}>
            {question.options.map((option: any) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  currentValues.includes(option.value) && styles.optionButtonSelected
                ]}
                onPress={() => handleMultiSelect(question.key, option.value)}
              >
                <Text style={[
                  styles.optionText,
                  currentValues.includes(option.value) && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
                {currentValues.includes(option.value) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'boolean':
        return (
          <View style={styles.optionsContainer}>
            {question.options.map((option: any) => (
              <TouchableOpacity
                key={option.value.toString()}
                style={[
                  styles.optionButton,
                  data[question.key as keyof OnboardingData] === option.value && styles.optionButtonSelected
                ]}
                onPress={() => handleInputChange(question.key, option.value)}
              >
                <Text style={[
                  styles.optionText,
                  data[question.key as keyof OnboardingData] === option.value && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <StarryBackground>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Bienvenue dans MyQuitZone 🌱</Text>
              <Text style={styles.subtitle}>
                Créons votre profil personnalisé pour vous accompagner dans votre parcours
              </Text>
            </View>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((currentStep + 1) / steps.length) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>
                Étape {currentStep + 1} sur {steps.length} - {currentStepData.section}
              </Text>
              <Text style={styles.progressSubText}>
                Question {currentQuestionIndex + 1} sur {visibleQuestions.length}
              </Text>
            </View>

            {/* Question */}
            {currentQuestion && (
              <View style={styles.questionContainer}>
                <Text style={styles.questionTitle}>{currentQuestion.label}</Text>
                <View style={styles.questionContent}>
                  {renderQuestion(currentQuestion)}
                </View>
              </View>
            )}

            {/* Navigation buttons */}
            <View style={styles.navigationContainer}>
              {currentStep > 0 && (
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <Text style={styles.backButtonText}>← Précédent</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </StarryBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  container: {
    flex: 1,
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
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#8B45FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B45FF',
    borderRadius: 4,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  progressSubText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 24,
  },
  questionContent: {
    minHeight: 100,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.3)',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderColor: 'rgba(139, 69, 255, 0.7)',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#8B45FF',
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: 'rgba(139, 69, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.5)',
    shadowColor: '#8B45FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  sliderLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  sliderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderButton: {
    backgroundColor: 'rgba(139, 69, 255, 0.8)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  sliderButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.5,
  },
  sliderButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sliderValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
});
