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

const { width } = Dimensions.get('window');

export interface OnboardingData {
  // Section 1: Profil Fumeur de Base
  smokingYears: number;
  cigsPerDay: number;
  smokingPeakTime: 'morning' | 'after_meals' | 'evening' | 'all_day' | 'work_breaks';
  
  // Section 2: Objectifs et Motivation
  mainGoal: 'complete_stop' | 'progressive_reduction';
  targetDate?: string; // Pour arrêt complet
  reductionFrequency?: number; // Pour réduction progressive (cigarettes à réduire par semaine)
  mainMotivation: 'health' | 'finance' | 'family' | 'sport' | 'independence';
  previousAttempts: 'first_time' | '1_2_times' | 'several_times' | 'many_times';
  
  // Section 3: Habitudes et Déclencheurs
  smokingTriggers: ('stress' | 'boredom' | 'social' | 'after_meals' | 'coffee_alcohol' | 'phone')[];
  smokingSituations: ('work' | 'evenings' | 'weekends' | 'vacations' | 'constant')[];
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
    // Section 1: Profil Fumeur de Base
    { section: 'Profil Fumeur', questions: [
      { key: 'smokingYears', label: 'Depuis combien d\'années fumez-vous ?', type: 'number', placeholder: 'Ex: 5' },
      { key: 'cigsPerDay', label: 'Combien de cigarettes fumez-vous par jour en moyenne ?', type: 'number', placeholder: 'Ex: 20' },
      { key: 'smokingPeakTime', label: 'À quel moment de la journée fumez-vous le plus ?', type: 'select', options: [
        { value: 'morning', label: 'Le matin au réveil' },
        { value: 'after_meals', label: 'Après les repas' },
        { value: 'evening', label: 'En soirée' },
        { value: 'all_day', label: 'Tout au long de la journée' },
        { value: 'work_breaks', label: 'Pendant les pauses au travail' }
      ]}
    ]},
    // Section 2: Objectifs et Motivation
    { section: 'Objectifs et Motivation', questions: [
      { key: 'mainGoal', label: 'Quel est votre objectif principal ?', type: 'select', options: [
        { value: 'complete_stop', label: 'Arrêt complet' },
        { value: 'progressive_reduction', label: 'Arrêt progressif' }
      ]},
      { key: 'targetDate', label: 'Quand souhaitez-vous arrêter complètement ?', type: 'date', showIf: 'complete_stop' },
      { key: 'reductionFrequency', label: 'Combien de cigarettes voulez-vous réduire par semaine ?', type: 'slider', showIf: 'progressive_reduction' },
      { key: 'mainMotivation', label: 'Quelle est votre motivation principale pour arrêter ?', type: 'select', options: [
        { value: 'health', label: 'Santé (risques médicaux)' },
        { value: 'finance', label: 'Finances (coût)' },
        { value: 'family', label: 'Famille/proches' },
        { value: 'sport', label: 'Performance sportive' },
        { value: 'independence', label: 'Autonomie personnelle' }
      ]},
      { key: 'previousAttempts', label: 'Avez-vous déjà essayé d\'arrêter de fumer ?', type: 'select', options: [
        { value: 'first_time', label: 'Non, c\'est ma première fois' },
        { value: '1_2_times', label: 'Oui, 1-2 fois' },
        { value: 'several_times', label: 'Oui, plusieurs fois' },
        { value: 'many_times', label: 'Oui, de nombreuses fois' }
      ]}
    ]},
    // Section 3: Habitudes et Déclencheurs
    { section: 'Habitudes et Déclencheurs', questions: [
      { key: 'smokingTriggers', label: 'Dans quelles situations avez-vous le plus envie de fumer ? (sélectionnez tout ce qui s\'applique)', type: 'multiselect', options: [
        { value: 'stress', label: 'Stress/tension' },
        { value: 'boredom', label: 'Ennui' },
        { value: 'social', label: 'Moments sociaux' },
        { value: 'after_meals', label: 'Après les repas' },
        { value: 'coffee_alcohol', label: 'Au café/boissons alcoolisées' },
        { value: 'phone', label: 'Au téléphone' }
      ]},
      { key: 'smokingSituations', label: 'Fumez-vous plus dans certaines situations ? (sélectionnez tout ce qui s\'applique)', type: 'multiselect', options: [
        { value: 'work', label: 'Au travail' },
        { value: 'evenings', label: 'En soirée/événements' },
        { value: 'weekends', label: 'Weekends' },
        { value: 'vacations', label: 'Pendant les vacances' },
        { value: 'constant', label: 'Toujours de manière constante' }
      ]}
    ]}
  ];

  // Filtrer les questions selon les conditions et l'objectif sélectionné
  const getVisibleQuestions = (stepQuestions: any[]) => {
    return stepQuestions.filter(question => {
      if (!question.showIf) return true;
      return data.mainGoal === question.showIf;
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
    // Validation des champs obligatoires
    if (!data.smokingYears || data.smokingYears < 0) {
      Alert.alert('Erreur', 'Veuillez entrer un nombre d\'années valide');
      return false;
    }
    if (!data.cigsPerDay || data.cigsPerDay < 1) {
      Alert.alert('Erreur', 'Veuillez entrer un nombre de cigarettes valide');
      return false;
    }
    if (!data.smokingPeakTime || !data.mainGoal || !data.mainMotivation || 
        !data.previousAttempts || !data.smokingTriggers?.length || 
        !data.smokingSituations?.length) {
      Alert.alert('Erreur', 'Veuillez répondre à toutes les questions');
      return false;
    }
    
    // Validation conditionnelle selon l'objectif
    if (data.mainGoal === 'complete_stop' && !data.targetDate) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date d\'arrêt');
      return false;
    }
    if (data.mainGoal === 'progressive_reduction' && !data.reductionFrequency) {
      Alert.alert('Erreur', 'Veuillez définir la fréquence de réduction');
      return false;
    }
    
    return true;
  };

  const handleInputChange = (key: string, value: any) => {
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
        const cigsPerDay = data.cigsPerDay || 20;
        const cigsPerWeek = cigsPerDay * 7;
        const maxWeeklyReduction = Math.floor(cigsPerWeek * 0.2); // Maximum 20% de réduction hebdomadaire
        const minWeeklyReduction = 1; // Minimum 1 cigarette par semaine
        const currentValue = data[question.key as keyof OnboardingData] as number || minWeeklyReduction;
        
        return (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              Réduire {currentValue} cigarette{currentValue > 1 ? 's' : ''} par semaine
            </Text>
            <View style={styles.sliderButtons}>
              <TouchableOpacity
                style={[styles.sliderButton, currentValue <= minWeeklyReduction && styles.sliderButtonDisabled]}
                onPress={() => currentValue > minWeeklyReduction && handleInputChange(question.key, currentValue - 1)}
                disabled={currentValue <= minWeeklyReduction}
              >
                <Text style={styles.sliderButtonText}>-</Text>
              </TouchableOpacity>
              
              <Text style={styles.sliderValue}>{currentValue}</Text>
              
              <TouchableOpacity
                style={[styles.sliderButton, currentValue >= maxWeeklyReduction && styles.sliderButtonDisabled]}
                onPress={() => currentValue < maxWeeklyReduction && handleInputChange(question.key, currentValue + 1)}
                disabled={currentValue >= maxWeeklyReduction}
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
      
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['#071033', '#1a1a2e', '#16213e', '#071033']}
        style={styles.container}
      >
        {/* Fond étoilé */}
        <View style={styles.starryBackground}>
          {Array.from({ length: 50 }).map((_, i) => {
            const positions = [
              { left: 10, top: 15 }, { left: 25, top: 8 }, { left: 40, top: 20 }, { left: 60, top: 12 }, { left: 80, top: 18 },
              { left: 90, top: 25 }, { left: 15, top: 35 }, { left: 35, top: 40 }, { left: 55, top: 32 }, { left: 75, top: 38 },
              { left: 85, top: 45 }, { left: 20, top: 55 }, { left: 45, top: 60 }, { left: 65, top: 52 }, { left: 85, top: 58 },
              { left: 12, top: 70 }, { left: 30, top: 75 }, { left: 50, top: 68 }, { left: 70, top: 72 }, { left: 88, top: 78 },
              { left: 18, top: 85 }, { left: 38, top: 88 }, { left: 58, top: 82 }, { left: 78, top: 85 }, { left: 92, top: 90 }
            ];
            
            const pos = positions[i % positions.length];
            const size = Math.random() * 3 + 2;
            
            return (
              <View
                key={i}
                style={[
                  styles.star,
                  {
                    left: pos.left + '%' as any,
                    top: pos.top + '%' as any,
                    width: size,
                    height: size,
                  },
                ]}
              />
            );
          })}
        </View>

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
      </LinearGradient>
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
