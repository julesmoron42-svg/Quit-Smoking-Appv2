import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DailyEntry, EmotionType, EmotionOption } from '../types';
import { HapticService } from '../lib/hapticService';
import { SuccessButton, ErrorButton } from './HapticButton';

const { width } = Dimensions.get('window');

interface DailyEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: DailyEntry) => void;
  date: string;
  goalCigs: number;
  initialEntry?: DailyEntry;
}

const EMOTIONS: EmotionOption[] = [
  { type: 'happy', emoji: '😊', label: 'Heureux', color: '#10B981' },
  { type: 'proud', emoji: '🥳', label: 'Fier', color: '#8B45FF' },
  { type: 'frustrated', emoji: '😤', label: 'Frustré', color: '#EF4444' },
  { type: 'anxious', emoji: '😰', label: 'Anxieux', color: '#F59E0B' },
  { type: 'confident', emoji: '💪', label: 'Confiant', color: '#8B5CF6' },
  { type: 'disappointed', emoji: '😞', label: 'Déçu', color: '#6B7280' },
  { type: 'relieved', emoji: '😌', label: 'Soulagé', color: '#059669' },
  { type: 'stressed', emoji: '😵', label: 'Stressé', color: '#DC2626' },
];

export default function DailyEntryModal({
  visible,
  onClose,
  onSave,
  date,
  goalCigs,
  initialEntry,
}: DailyEntryModalProps) {
  const [realCigs, setRealCigs] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);

  useEffect(() => {
    if (initialEntry) {
      setRealCigs(initialEntry.realCigs.toString());
      setSelectedEmotion(initialEntry.emotion || null);
    } else {
      setRealCigs('');
      setSelectedEmotion(null);
    }
  }, [initialEntry, visible]);

  const handleSave = () => {
    const realCigsNum = parseInt(realCigs, 10);
    
    if (isNaN(realCigsNum) || realCigsNum < 0) {
      Alert.alert('Erreur', 'Veuillez entrer un nombre valide de cigarettes');
      return;
    }

    if (selectedEmotion === null) {
      Alert.alert('Erreur', 'Veuillez sélectionner votre émotion');
      return;
    }

    const objectiveMet = realCigsNum <= goalCigs;
    const entry: DailyEntry = {
      realCigs: realCigsNum,
      goalCigs,
      date,
      emotion: selectedEmotion,
      objectiveMet,
    };

    onSave(entry);
  };

  const getMotivationalMessage = () => {
    const realCigsNum = parseInt(realCigs, 10);
    if (isNaN(realCigsNum)) return null;

    if (realCigsNum <= goalCigs) {
      return {
        message: "Bravo ! Tu es sur la bonne voie ! 🌟",
        color: '#10B981',
        icon: '✅'
      };
    } else {
      return {
        message: "Demain sera un jour meilleur ! 💪 Continue tes efforts !",
        color: '#F59E0B',
        icon: '🔥'
      };
    }
  };

  // Calcul des cigarettes évitées pour ce jour
  const getDailyAvoided = () => {
    const realCigsNum = parseInt(realCigs, 10);
    if (isNaN(realCigsNum)) return 0;
    
    // Supposons que l'utilisateur fumait 20 cigarettes par jour au départ
    // (ceci devrait venir du profil utilisateur)
    const originalDailyCigs = 20; // À remplacer par profile.cigsPerDay
    return Math.max(0, originalDailyCigs - realCigsNum);
  };

  const motivationalMsg = getMotivationalMessage();
  const realCigsNum = parseInt(realCigs, 10);
  const progress = isNaN(realCigsNum) ? 0 : realCigsNum / goalCigs;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#000000', '#000000']}
          style={styles.modalContainer}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Saisie quotidienne</Text>
              <Text style={styles.date}>
                {new Date(date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={async () => {
                  await HapticService.light();
                  onClose();
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Objectif affiché */}
            <View style={styles.goalContainer}>
              <Text style={styles.goalLabel}>Objectif du jour : {goalCigs} cigarettes</Text>
            </View>

            {/* Saisie cigarettes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Combien de cigarettes avez-vous fumé ?</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={realCigs}
                  onChangeText={setRealCigs}
                  placeholder="0"
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.inputSuffix}>/{goalCigs}</Text>
              </View>
              
              {/* Barre de progression */}
              {!isNaN(realCigsNum) && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min(progress * 100, 100)}%`,
                          backgroundColor: progress <= 1 ? '#10B981' : '#EF4444'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {realCigsNum}/{goalCigs}
                  </Text>
                </View>
              )}
            </View>

            {/* Message motivant */}
            {motivationalMsg && (
              <View style={[styles.motivationalContainer, { backgroundColor: motivationalMsg.color + '20' }]}>
                <Text style={styles.motivationalIcon}>{motivationalMsg.icon}</Text>
                <Text style={[styles.motivationalText, { color: motivationalMsg.color }]}>
                  {motivationalMsg.message}
                </Text>
              </View>
            )}

            {/* Résumé du jour */}
            {!isNaN(realCigsNum) && (
              <View style={styles.dailySummaryContainer}>
                <Text style={styles.dailySummaryTitle}>Résumé de ce jour :</Text>
                <View style={styles.dailySummaryRow}>
                  <Text style={styles.dailySummaryLabel}>Cigarettes évitées :</Text>
                  <Text style={[styles.dailySummaryValue, { color: '#10B981' }]}>
                    {getDailyAvoided()}
                  </Text>
                </View>
                <View style={styles.dailySummaryRow}>
                  <Text style={styles.dailySummaryLabel}>Économies :</Text>
                  <Text style={[styles.dailySummaryValue, { color: '#51CF66' }]}>
                    {(getDailyAvoided() * 0.6).toFixed(1)}€
                  </Text>
                </View>
              </View>
            )}

            {/* Sélection émotion */}
            <View style={styles.emotionContainer}>
              <Text style={styles.emotionLabel}>Comment vous sentez-vous ?</Text>
              <View style={styles.emotionsGrid}>
                {EMOTIONS.map((emotion) => (
                  <TouchableOpacity
                    key={emotion.type}
                    style={[
                      styles.emotionButton,
                      {
                        backgroundColor: selectedEmotion === emotion.type 
                          ? emotion.color + '30' 
                          : 'rgba(255, 255, 255, 0.1)',
                        borderColor: selectedEmotion === emotion.type 
                          ? emotion.color 
                          : 'rgba(255, 255, 255, 0.2)',
                      }
                    ]}
                    onPress={async () => {
                      await HapticService.selection();
                      setSelectedEmotion(emotion.type);
                    }}
                  >
                    <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                    <Text style={styles.emotionLabel}>{emotion.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Boutons d'action */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={async () => {
                  await HapticService.light();
                  onClose();
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  { 
                    opacity: realCigs && selectedEmotion ? 1 : 0.5,
                    backgroundColor: motivationalMsg?.color || '#8B45FF'
                  }
                ]} 
                onPress={async () => {
                  if (realCigs && selectedEmotion) {
                    await HapticService.success();
                    handleSave();
                  } else {
                    await HapticService.error();
                  }
                }}
                disabled={!realCigs || !selectedEmotion}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalContainer: {
    backgroundColor: 'rgba(139, 69, 255, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.3)',
  },
  goalLabel: {
    color: '#8B45FF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputSuffix: {
    color: '#94A3B8',
    fontSize: 18,
    marginLeft: 10,
  },
  progressContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  motivationalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  motivationalIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  motivationalText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  dailySummaryContainer: {
    backgroundColor: 'rgba(139, 69, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.2)',
  },
  dailySummaryTitle: {
    color: '#8B45FF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  dailySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  dailySummaryLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  dailySummaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emotionContainer: {
    marginBottom: 30,
  },
  emotionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    textAlign: 'center',
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emotionButton: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  emotionEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    marginLeft: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
