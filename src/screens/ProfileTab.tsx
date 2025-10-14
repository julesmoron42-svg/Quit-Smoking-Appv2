import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { profileStorage, settingsStorage } from '../lib/storage';
import { UserProfile, AppSettings } from '../types';

const { width } = Dimensions.get('window');

export default function ProfileTab() {
  const [profile, setProfile] = useState<UserProfile>({
    startedSmokingYears: 0,
    cigsPerDay: 20,
    objectiveType: 'complete',
    reductionFrequency: 1,
  });
  const [settings, setSettings] = useState<AppSettings>({
    pricePerCig: 0.6,
    currency: '€',
    notificationsAllowed: true,
    language: 'fr',
    animationsEnabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, settingsData] = await Promise.all([
        profileStorage.get(),
        settingsStorage.get(),
      ]);
      
      setProfile(profileData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };


  const saveSettings = async () => {
    try {
      await settingsStorage.set(settings);
      Alert.alert('Succès', 'Paramètres sauvegardés avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    }
  };

  const calculateSavings = () => {
    const dailySavings = profile.cigsPerDay * settings.pricePerCig;
    const monthlySavings = dailySavings * 30;
    const yearlySavings = dailySavings * 365;
    
    return {
      daily: Math.round(dailySavings),
      monthly: Math.round(monthlySavings),
      yearly: Math.round(yearlySavings),
    };
  };

  const savings = calculateSavings();

  const getMotivationText = () => {
    switch (profile.mainMotivation) {
      case 'health': return 'Pour améliorer ma santé';
      case 'finance': return 'Pour économiser de l\'argent';
      case 'family': return 'Pour ma famille et mes proches';
      case 'sport': return 'Pour améliorer mes performances sportives';
      case 'independence': return 'Pour retrouver ma liberté';
      default: return 'Non spécifié';
    }
  };

  const getSmokingTimeText = () => {
    switch (profile.smokingPeakTime) {
      case 'morning': return 'Le matin au réveil';
      case 'after_meals': return 'Après les repas';
      case 'evening': return 'En soirée';
      case 'all_day': return 'Tout au long de la journée';
      case 'work_breaks': return 'Pendant les pauses au travail';
      default: return 'Non spécifié';
    }
  };

  return (
    <View style={styles.container}>
      {/* Fond étoilé */}
      <View style={styles.starryBackground}>
        {Array.from({ length: 100 }).map((_, i) => {
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
                  left: pos.left + '%',
                  top: pos.top + '%',
                  width: size,
                  height: size,
                },
              ]}
            />
          );
        })}
      </View>
      
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientContainer}
      >
        {/* Fond étoilé */}
        <View style={styles.starryBackground}>
          {Array.from({ length: 25 }).map((_, i) => {
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
            
            {/* Header avec avatar */}
            <View style={styles.headerSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarEmoji}>🌱</Text>
              </View>
              <Text style={styles.headerTitle}>Mon Parcours</Text>
              <Text style={styles.headerSubtitle}>Personnalisez votre expérience</Text>
            </View>

            {/* Profil Fumeur */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🚬</Text>
                <Text style={styles.cardTitle}>Mon Profil Fumeur</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Depuis combien d'années fumez-vous ?</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={profile.smokingYears?.toString() || profile.startedSmokingYears.toString()}
                    onChangeText={async (text) => {
                      const newProfile = {
                        ...profile,
                        smokingYears: parseInt(text) || 0,
                        startedSmokingYears: parseInt(text) || 0,
                      };
                      setProfile(newProfile);
                      try {
                        await profileStorage.set(newProfile);
                      } catch (error) {
                        console.error('Erreur lors de la sauvegarde:', error);
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="Ex: 5"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  />
                  <Text style={styles.inputSuffix}>années</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Combien de cigarettes par jour ?</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={profile.cigsPerDay.toString()}
                    onChangeText={async (text) => {
                      const newProfile = {
                        ...profile,
                        cigsPerDay: parseInt(text) || 0,
                      };
                      setProfile(newProfile);
                      try {
                        await profileStorage.set(newProfile);
                      } catch (error) {
                        console.error('Erreur lors de la sauvegarde:', error);
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="Ex: 20"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  />
                  <Text style={styles.inputSuffix}>cigarettes</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quand fumez-vous le plus ?</Text>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>{getSmokingTimeText()}</Text>
                </View>
              </View>
            </View>

            {/* Objectifs */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🎯</Text>
                <Text style={styles.cardTitle}>Mon Objectif</Text>
              </View>
              
              <View style={styles.objectiveButtons}>
                <TouchableOpacity
                  style={[
                    styles.objectiveButton,
                    (profile.objectiveType === 'complete' || profile.mainGoal === 'complete_stop') && styles.objectiveButtonSelected,
                  ]}
                  onPress={async () => {
                    const newProfile = { 
                      ...profile, 
                      objectiveType: 'complete', 
                      mainGoal: 'complete_stop' 
                    };
                    setProfile(newProfile);
                    try {
                      await profileStorage.set(newProfile);
                    } catch (error) {
                      console.error('Erreur lors de la sauvegarde:', error);
                    }
                  }}
                >
                  <Text style={[
                    styles.objectiveButtonText,
                    (profile.objectiveType === 'complete' || profile.mainGoal === 'complete_stop') && styles.objectiveButtonTextSelected,
                  ]}>
                    Arrêt Complet
                  </Text>
                  <Text style={[
                    styles.objectiveButtonSubtext,
                    (profile.objectiveType === 'complete' || profile.mainGoal === 'complete_stop') && styles.objectiveButtonSubtextSelected,
                  ]}>
                    J'arrête définitivement
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.objectiveButton,
                    (profile.objectiveType === 'progressive' || profile.mainGoal === 'progressive_reduction') && styles.objectiveButtonSelected,
                  ]}
                  onPress={async () => {
                    const newProfile = { 
                      ...profile, 
                      objectiveType: 'progressive', 
                      mainGoal: 'progressive_reduction' 
                    };
                    setProfile(newProfile);
                    try {
                      await profileStorage.set(newProfile);
                    } catch (error) {
                      console.error('Erreur lors de la sauvegarde:', error);
                    }
                  }}
                >
                  <Text style={[
                    styles.objectiveButtonText,
                    (profile.objectiveType === 'progressive' || profile.mainGoal === 'progressive_reduction') && styles.objectiveButtonTextSelected,
                  ]}>
                    Arrêt Progressif
                  </Text>
                  <Text style={[
                    styles.objectiveButtonSubtext,
                    (profile.objectiveType === 'progressive' || profile.mainGoal === 'progressive_reduction') && styles.objectiveButtonSubtextSelected,
                  ]}>
                    Je réduis progressivement
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date d'arrêt pour arrêt complet */}
              {(profile.objectiveType === 'complete' || profile.mainGoal === 'complete_stop') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Quand souhaitez-vous arrêter complètement ?</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={profile.targetDate || ''}
                    onChangeText={async (text) => {
                      const newProfile = { ...profile, targetDate: text };
                      setProfile(newProfile);
                      try {
                        await profileStorage.set(newProfile);
                      } catch (error) {
                        console.error('Erreur lors de la sauvegarde:', error);
                      }
                    }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  />
                </View>
              )}

              {/* Fréquence pour arrêt progressif */}
              {(profile.objectiveType === 'progressive' || profile.mainGoal === 'progressive_reduction') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Combien de cigarettes voulez-vous réduire chaque semaine ?</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={profile.reductionFrequency?.toString() || '1'}
                      onChangeText={async (text) => {
                        const newProfile = {
                          ...profile,
                          reductionFrequency: parseInt(text) || 1,
                        };
                        setProfile(newProfile);
                        try {
                          await profileStorage.set(newProfile);
                        } catch (error) {
                          console.error('Erreur lors de la sauvegarde:', error);
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    />
                    <Text style={styles.inputSuffix}>cigarettes/semaine</Text>
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ma motivation principale</Text>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>{getMotivationText()}</Text>
                </View>
              </View>
            </View>

            {/* Économies */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>💰</Text>
                <Text style={styles.cardTitle}>Mes Économies Potentielles</Text>
              </View>
              
              <View style={styles.savingsGrid}>
                <View style={styles.savingsItem}>
                  <Text style={styles.savingsAmount}>{savings.daily}€</Text>
                  <Text style={styles.savingsPeriod}>par jour</Text>
                </View>
                
                <View style={styles.savingsItem}>
                  <Text style={styles.savingsAmount}>{savings.monthly}€</Text>
                  <Text style={styles.savingsPeriod}>par mois</Text>
                </View>
                
                <View style={styles.savingsItem}>
                  <Text style={styles.savingsAmount}>{savings.yearly}€</Text>
                  <Text style={styles.savingsPeriod}>par an</Text>
                </View>
              </View>
              
              <Text style={styles.savingsNote}>
                Basé sur {profile.cigsPerDay} cigarettes/jour à {settings.pricePerCig}€ pièce
              </Text>
            </View>



          </View>
        </ScrollView>
      </LinearGradient>
    </View>
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
  gradientContainer: {
    flex: 1,
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
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderWidth: 3,
    borderColor: 'rgba(139, 69, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textShadowColor: '#8B45FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
    marginRight: 10,
  },
  dateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputSuffix: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: 'rgba(139, 69, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.3)',
  },
  infoText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '500',
  },
  objectiveButtons: {
    marginBottom: 20,
  },
  objectiveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  objectiveButtonSelected: {
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderColor: 'rgba(139, 69, 255, 0.7)',
  },
  objectiveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  objectiveButtonTextSelected: {
    color: '#FFFFFF',
  },
  objectiveButtonSubtext: {
    color: '#94A3B8',
    fontSize: 14,
  },
  objectiveButtonSubtextSelected: {
    color: '#E2E8F0',
  },
  savingsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  savingsItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    minWidth: 100,
  },
  savingsAmount: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  savingsPeriod: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  savingsNote: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
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
});