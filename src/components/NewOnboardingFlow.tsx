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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StarryBackground from './StarryBackground';
import { OnboardingStepData, OnboardingQuestionnaireData } from '../types';
import { HapticService } from '../lib/hapticService';
import { TypewriterText } from './TypewriterText';
import CalendarPicker from './CalendarPicker';

const { width, height } = Dimensions.get('window');

interface NewOnboardingFlowProps {
  visible: boolean;
  onComplete: (data: OnboardingQuestionnaireData) => void;
}

export default function NewOnboardingFlow({ visible, onComplete }: NewOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [data, setData] = useState<Partial<OnboardingQuestionnaireData>>({});
  const [showCalendar, setShowCalendar] = useState(false);

  // Étapes 0-3 : Messages d'accroche
  const introSteps: OnboardingStepData[] = [
    {
      step: 0,
      title: "Reprends le contrôle",
      message: "Ta vie sans tabac commence ici.",
      cta: "Commencer"
    },
    {
      step: 1,
      title: "Tu ne fumes pas parce que tu le veux",
      message: "Tu fumes parce que ton cerveau a été programmé. Tu peux reprendre le contrôle.",
      cta: "Je suis prêt"
    },
    {
      step: 2,
      title: "Arrêter n'est pas une question de volonté",
      message: "La nicotine est l'une des substances les plus addictives. Tu n'es pas seul. Tu vas y arriver.",
      cta: "Continuer"
    },
    {
      step: 3,
      title: "Ce n'est pas une question de volonté, mais de méthode",
      message: "Prêt à relever le défi ?",
      cta: "Donne-moi la méthode"
    }
  ];

  // Questionnaire complet (Étape 4)
  const questionnaireSteps = [
    // Section 1: Profil Fumeur
    { section: 'Profil Fumeur', questions: [
      { key: 'age', label: 'Quel est votre âge ?', type: 'number', placeholder: 'Ex: 28' },
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
    // Section 2: Objectifs
    { section: 'Objectifs', questions: [
      { key: 'mainGoal', label: 'Quel est votre objectif principal ?', type: 'select', options: [
        { value: 'complete_stop', label: 'Arrêt complet' },
        { value: 'progressive_reduction', label: 'Réduction progressive' },
        { value: 'not_sure', label: 'Je ne sais pas encore' }
      ]},
      { key: 'targetDate', label: 'Quand souhaitez-vous arrêter ?', type: 'date', showIf: 'complete_stop' },
      { key: 'reductionFrequency', label: 'Combien de cigarettes voulez-vous réduire par semaine ?', type: 'slider', min: 1, max: 7, step: 1, showIf: 'progressive_reduction' },
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
        { value: 'routine', label: 'Automatisme / routine' },
        { value: 'driving', label: 'En conduisant' },
        { value: 'coffee_break', label: 'Pause café' }
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
      { key: 'previousMethods', label: 'Quelles méthodes avez-vous déjà essayées ? (sélectionnez tout ce qui s\'applique)', type: 'multiselect', options: [
        { value: 'cold_turkey', label: 'Arrêt brutal' },
        { value: 'patches', label: 'Patchs' },
        { value: 'gum', label: 'Gommes à mâcher' },
        { value: 'vape', label: 'Cigarette électronique' },
        { value: 'medication', label: 'Médicaments' },
        { value: 'other', label: 'Autre' }
      ], showIf: 'not_first_time' },
      { key: 'relapseCause', label: 'Qu\'est-ce qui a causé la reprise ? (sélectionnez tout ce qui s\'applique)', type: 'multiselect', options: [
        { value: 'stress_emotion', label: 'Stress / émotion forte' },
        { value: 'social', label: 'Moments sociaux' },
        { value: 'morning_habit', label: 'Habitude au réveil' },
        { value: 'no_motivation', label: 'Manque de motivation' },
        { value: 'no_support', label: 'Pas d\'accompagnement / seul' },
        { value: 'no_method', label: 'Mauvaise méthode' }
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

  // Vérifier si la question actuelle est répondue
  const isCurrentQuestionAnswered = () => {
    if (currentStep < 4) return true; // Étapes d'introduction
    
    const currentSection = questionnaireSteps[currentStep - 4];
    const visibleQuestions = getVisibleQuestions(currentSection.questions);
    const currentQuestion = visibleQuestions[currentQuestionIndex];
    
    if (!currentQuestion) return true;
    
    const value = data[currentQuestion.key as keyof OnboardingQuestionnaireData];
    
    // Vérifications selon le type de question
    if (currentQuestion.type === 'number') {
      return value !== undefined && value !== null && value !== '';
    }
    if (currentQuestion.type === 'date') {
      return value !== undefined && value !== null && value !== '';
    }
    if (currentQuestion.type === 'slider') {
      return value !== undefined && value !== null;
    }
    if (currentQuestion.type === 'select') {
      return value !== undefined && value !== null && value !== '';
    }
    if (currentQuestion.type === 'multiselect') {
      return Array.isArray(value) && value.length > 0;
    }
    if (currentQuestion.type === 'boolean') {
      return value !== undefined && value !== null;
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep < 3) {
      // Étapes d'introduction
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // Passer au questionnaire
      setCurrentStep(4);
      setCurrentQuestionIndex(0);
    } else {
      // Dans le questionnaire - vérifier si la question est répondue
      if (!isCurrentQuestionAnswered()) {
        Alert.alert('Question obligatoire', 'Veuillez répondre à cette question avant de continuer.');
        return;
      }
      
      const currentSection = questionnaireSteps[currentStep - 4];
      const visibleQuestions = getVisibleQuestions(currentSection.questions);
      
      if (currentQuestionIndex < visibleQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentStep < questionnaireSteps.length + 3) {
        // Passer à la section suivante
        setCurrentStep(currentStep + 1);
        setCurrentQuestionIndex(0);
      } else {
        // Validation finale
        if (validateData()) {
          onComplete(data as OnboardingQuestionnaireData);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep <= 3) {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    } else {
      // Dans le questionnaire
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else if (currentStep > 4) {
        // Retourner à la section précédente
        setCurrentStep(currentStep - 1);
        const prevSection = questionnaireSteps[currentStep - 5];
        const prevVisibleQuestions = getVisibleQuestions(prevSection.questions);
        setCurrentQuestionIndex(prevVisibleQuestions.length - 1);
      } else {
        // Retourner aux étapes d'introduction
        setCurrentStep(3);
      }
    }
  };

  const getVisibleQuestions = (questions: any[]) => {
    return questions.filter(question => {
      if (!question.showIf) return true;
      
      if (question.showIf === 'complete_stop') {
        return data.mainGoal === 'complete_stop';
      }
      if (question.showIf === 'progressive_reduction') {
        return data.mainGoal === 'progressive_reduction';
      }
      if (question.showIf === 'relapse_quick') {
        return data.previousAttempts === 'relapse_quick';
      }
      if (question.showIf === 'not_first_time') {
        return data.previousAttempts !== 'first_time';
      }
      
      return true;
    });
  };

  const validateData = (): boolean => {
    console.log('Validation des données onboarding:', data);
    
    // Validation des champs obligatoires de base
    if (!data.age || data.age < 0) {
      Alert.alert('Erreur', 'Veuillez entrer un âge valide');
      return false;
    }
    if (!data.smokingYears || data.smokingYears < 0) {
      Alert.alert('Erreur', 'Veuillez entrer un nombre d\'années valide');
      return false;
    }
    if (data.cigsPerDay === undefined || data.cigsPerDay < 0) {
      Alert.alert('Erreur', 'Veuillez entrer un nombre de cigarettes valide');
      return false;
    }
    if (!data.firstCigaretteTime || !data.smokingPeakTime || !data.mainGoal || 
        !data.mainMotivation || !data.smokingTriggers?.length || 
        !data.emotionHelp || data.stressLevel === undefined || 
        !data.previousAttempts || data.motivationLevel === undefined || 
        data.wantSupportMessages === undefined) {
      Alert.alert('Erreur', 'Veuillez répondre à toutes les questions');
      return false;
    }
    
    // Validation conditionnelle selon l'objectif
    if (data.mainGoal === 'complete_stop' && !data.targetDate) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date d\'arrêt');
      return false;
    }
    if (data.mainGoal === 'progressive_reduction' && (data.reductionFrequency === undefined || data.reductionFrequency < 1)) {
      Alert.alert('Erreur', 'Veuillez définir une fréquence de réduction valide (au moins 1 cigarette par semaine)');
      return false;
    }
    
    // Validation conditionnelle pour les causes de rechute
    if (data.previousAttempts === 'relapse_quick' && (!data.relapseCause || data.relapseCause.length === 0)) {
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
      const currentValues = (prev[key as keyof OnboardingQuestionnaireData] as string[]) || [];
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
            value={data[question.key as keyof OnboardingQuestionnaireData]?.toString() || ''}
            onChangeText={(text) => handleInputChange(question.key, parseInt(text) || 0)}
          />
        );
      
      case 'date':
        const selectedDate = data[question.key as keyof OnboardingQuestionnaireData]?.toString() || '';
        const formatDisplayDate = (dateStr: string) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        };
        
        return (
          <View>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                console.log('📅 Opening calendar...');
                setShowCalendar(true);
              }}
            >
              <Text style={styles.dateButtonText}>
                {selectedDate ? formatDisplayDate(selectedDate) : 'Sélectionner une date'}
              </Text>
              <Text style={styles.dateButtonIcon}>📅</Text>
            </TouchableOpacity>
            
            {showCalendar && (
              <CalendarPicker
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  handleInputChange(question.key, date);
                  setShowCalendar(false);
                }}
                onClose={() => setShowCalendar(false)}
              />
            )}
          </View>
        );
      
      case 'slider':
        const min = question.min || 0;
        const max = question.max || 10;
        const step = question.step || 1;
        const currentValue = data[question.key as keyof OnboardingQuestionnaireData] as number || min;
        
        if (data[question.key as keyof OnboardingQuestionnaireData] === undefined) {
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
                  data[question.key as keyof OnboardingQuestionnaireData] === option.value && styles.optionButtonSelected
                ]}
                onPress={() => handleInputChange(question.key, option.value)}
              >
                <Text style={[
                  styles.optionText,
                  data[question.key as keyof OnboardingQuestionnaireData] === option.value && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'multiselect':
        const currentValues = (data[question.key as keyof OnboardingQuestionnaireData] as string[]) || [];
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
                  data[question.key as keyof OnboardingQuestionnaireData] === option.value && styles.optionButtonSelected
                ]}
                onPress={() => handleInputChange(question.key, option.value)}
              >
                <Text style={[
                  styles.optionText,
                  data[question.key as keyof OnboardingQuestionnaireData] === option.value && styles.optionTextSelected
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
            {currentStep <= 3 ? (
              // Étapes d'introduction
              <View style={styles.introContainer}>
                <View style={styles.logoContainer}>
                  <Image 
                    source={require('../../assets/cigarette-logo.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.introTitle}>{introSteps[currentStep].title}</Text>
                
                {/* Effet machine à écrire pour les messages de motivation des étapes 0-4 */}
                {currentStep <= 4 ? (
                  <TypewriterText
                    text={introSteps[currentStep].message}
                    speed={30}
                    hapticEnabled={false}
                    style={styles.introMessage}
                    onComplete={() => {
                      // Pas de vibration à la fin
                    }}
                  />
                ) : (
                  <Text style={styles.introMessage}>{introSteps[currentStep].message}</Text>
                )}
                
                <TouchableOpacity 
                  style={styles.ctaButton} 
                  onPress={async () => {
                    await HapticService.subtle();
                    handleNext();
                  }}
                >
                  <Text style={styles.ctaButtonText}>{introSteps[currentStep].cta}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Questionnaire
              <>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>Créons votre profil personnalisé</Text>
                  <Text style={styles.subtitle}>
                    Ces informations nous permettront de vous proposer le plan de sevrage le plus adapté
                  </Text>
                </View>

                {/* Progress indicator */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((currentStep - 3) / questionnaireSteps.length) * 100}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    Section {currentStep - 3} sur {questionnaireSteps.length} - {questionnaireSteps[currentStep - 4]?.section}
                  </Text>
                </View>

                {/* Question */}
                {(() => {
                  const currentSection = questionnaireSteps[currentStep - 4];
                  const visibleQuestions = getVisibleQuestions(currentSection.questions);
                  const currentQuestion = visibleQuestions[currentQuestionIndex];
                  
                  return currentQuestion && (
                    <View style={styles.questionContainer}>
                      <Text style={styles.questionTitle}>{currentQuestion.label}</Text>
                      <View style={styles.questionContent}>
                        {renderQuestion(currentQuestion)}
                      </View>
                    </View>
                  );
                })()}

                {/* Navigation buttons */}
                <View style={styles.navigationContainer}>
                  {(currentStep > 0 || currentQuestionIndex > 0) && (
                    <TouchableOpacity 
                      style={styles.backButton} 
                      onPress={async () => {
                        await HapticService.subtle();
                        handleBack();
                      }}
                    >
                      <Text style={styles.backButtonText}>← Précédent</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={[
                      styles.nextButton,
                      !isCurrentQuestionAnswered() && styles.nextButtonDisabled
                    ]} 
                    onPress={async () => {
                      await HapticService.subtle();
                      handleNext();
                    }}
                    disabled={!isCurrentQuestionAnswered()}
                  >
                    <Text style={[
                      styles.nextButtonText,
                      !isCurrentQuestionAnswered() && styles.nextButtonTextDisabled
                    ]}>
                      {currentStep === questionnaireSteps.length + 3 ? 'Terminer' : 'Suivant →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    minHeight: height,
  },
  // Styles pour les étapes d'introduction
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  introMessage: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButton: {
    backgroundColor: 'rgba(139, 69, 255, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.5)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Styles pour le questionnaire
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
    textShadowColor: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
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
    color: '#8B5CF6',
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
    shadowColor: '#8B5CF6',
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
  nextButtonDisabled: {
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderColor: 'rgba(139, 69, 255, 0.2)',
  },
  nextButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
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
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  dateButtonIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
});
