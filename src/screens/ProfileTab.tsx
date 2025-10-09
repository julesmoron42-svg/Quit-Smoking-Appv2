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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { profileStorage, settingsStorage } from '../lib/storage';
import { UserProfile, AppSettings } from '../types';

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

  const saveProfile = async () => {
    try {
      await profileStorage.set(profile);
      Alert.alert('Succès', 'Profil sauvegardé avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
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
      daily: dailySavings.toFixed(2),
      monthly: monthlySavings.toFixed(2),
      yearly: yearlySavings.toFixed(2),
    };
  };

  const savings = calculateSavings();

  return (
    <View style={styles.container}>
      {/* Fond étoilé */}
      <View style={styles.starryBackground}>
        {Array.from({ length: 150 }).map((_, i) => {
          const positions = [
            { left: 10, top: 15 }, { left: 25, top: 8 }, { left: 40, top: 20 }, { left: 60, top: 12 }, { left: 80, top: 18 },
            { left: 90, top: 25 }, { left: 15, top: 35 }, { left: 35, top: 40 }, { left: 55, top: 32 }, { left: 75, top: 38 },
            { left: 85, top: 45 }, { left: 20, top: 55 }, { left: 45, top: 60 }, { left: 65, top: 52 }, { left: 85, top: 58 },
            { left: 12, top: 70 }, { left: 30, top: 75 }, { left: 50, top: 68 }, { left: 70, top: 72 }, { left: 88, top: 78 },
            { left: 18, top: 85 }, { left: 38, top: 88 }, { left: 58, top: 82 }, { left: 78, top: 85 }, { left: 92, top: 90 },
            { left: 5, top: 25 }, { left: 95, top: 30 }, { left: 8, top: 45 }, { left: 92, top: 50 }, { left: 3, top: 65 },
            { left: 97, top: 70 }, { left: 6, top: 80 }, { left: 94, top: 85 }, { left: 22, top: 5 }, { left: 42, top: 3 },
            { left: 62, top: 7 }, { left: 82, top: 4 }, { left: 98, top: 8 }, { left: 2, top: 40 }, { left: 98, top: 45 },
            { left: 1, top: 60 }, { left: 99, top: 65 }, { left: 4, top: 80 }, { left: 96, top: 82 }, { left: 14, top: 95 },
            { left: 34, top: 92 }, { left: 54, top: 96 }, { left: 74, top: 93 }, { left: 86, top: 98 }
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
        colors={['#071033', '#1a1a2e', '#16213e', '#071033']}
        style={styles.gradientContainer}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Profil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Mon Profil</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Depuis combien de temps fumez-vous ?</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numberInput}
                value={profile.startedSmokingYears.toString()}
                onChangeText={(text) => setProfile({
                  ...profile,
                  startedSmokingYears: parseInt(text) || 0,
                })}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={styles.inputSuffix}>années</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cigarettes par jour</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numberInput}
                value={profile.cigsPerDay.toString()}
                onChangeText={(text) => setProfile({
                  ...profile,
                  cigsPerDay: parseInt(text) || 0,
                })}
                keyboardType="numeric"
                placeholder="20"
              />
              <Text style={styles.inputSuffix}>cigarettes</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Objectif</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  profile.objectiveType === 'complete' && styles.radioSelected,
                ]}
                onPress={() => setProfile({ ...profile, objectiveType: 'complete' })}
              >
                <Text style={[
                  styles.radioText,
                  profile.objectiveType === 'complete' && styles.radioTextSelected,
                ]}>
                  Arrêt définitif
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  profile.objectiveType === 'progressive' && styles.radioSelected,
                ]}
                onPress={() => setProfile({ ...profile, objectiveType: 'progressive' })}
              >
                <Text style={[
                  styles.radioText,
                  profile.objectiveType === 'progressive' && styles.radioTextSelected,
                ]}>
                  Arrêt progressif
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {profile.objectiveType === 'progressive' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Réduire de 1 cigarette tous les</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.numberInput}
                  value={profile.reductionFrequency?.toString() || '1'}
                  onChangeText={(text) => setProfile({
                    ...profile,
                    reductionFrequency: parseInt(text) || 1,
                  })}
                  keyboardType="numeric"
                  placeholder="1"
                />
                <Text style={styles.inputSuffix}>jours</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>💾 Sauvegarder le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Section Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          
          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>
              Rappels quotidiens pour entrer votre consommation
            </Text>
            <Switch
              value={settings.notificationsAllowed}
              onValueChange={(value) => setSettings({
                ...settings,
                notificationsAllowed: value,
              })}
              trackColor={{ false: '#64748B', true: '#3B82F6' }}
              thumbColor={settings.notificationsAllowed ? '#F8FAFC' : '#F8FAFC'}
            />
          </View>
          
          <Text style={styles.switchDescription}>
            Recevez des rappels quotidiens pour saisir votre consommation de cigarettes
          </Text>
        </View>

        {/* Section Économies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Économies potentielles</Text>
          
          <View style={styles.savingsContainer}>
            <View style={styles.savingsCard}>
              <Text style={styles.savingsAmount}>{savings.daily}€</Text>
              <Text style={styles.savingsLabel}>Par jour</Text>
            </View>
            
            <View style={styles.savingsCard}>
              <Text style={styles.savingsAmount}>{savings.monthly}€</Text>
              <Text style={styles.savingsLabel}>Par mois</Text>
            </View>
            
            <View style={styles.savingsCard}>
              <Text style={styles.savingsAmount}>{savings.yearly}€</Text>
              <Text style={styles.savingsLabel}>Par an</Text>
            </View>
          </View>
          
          <Text style={styles.savingsNote}>
            Calcul basé sur {profile.cigsPerDay} cigarettes/jour à {settings.pricePerCig}€ pièce
          </Text>
        </View>

        {/* Section Paramètres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Paramètres</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix par cigarette</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numberInput}
                value={settings.pricePerCig.toString()}
                onChangeText={(text) => setSettings({
                  ...settings,
                  pricePerCig: parseFloat(text) || 0.6,
                })}
                keyboardType="numeric"
                placeholder="0.60"
              />
              <Text style={styles.inputSuffix}>{settings.currency}</Text>
            </View>
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>Animations</Text>
            <Switch
              value={settings.animationsEnabled}
              onValueChange={(value) => setSettings({
                ...settings,
                animationsEnabled: value,
              })}
              trackColor={{ false: '#64748B', true: '#3B82F6' }}
              thumbColor={settings.animationsEnabled ? '#F8FAFC' : '#F8FAFC'}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.saveButtonText}>💾 Sauvegarder les paramètres</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    zIndex: 1,
  },
  section: {
    marginBottom: 30,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 80,
    textAlign: 'center',
  },
  inputSuffix: {
    color: '#94A3B8',
    fontSize: 16,
    marginLeft: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: '#3B82F6',
  },
  radioText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#F8FAFC',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    flex: 1,
    marginRight: 15,
  },
  switchDescription: {
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  savingsCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  savingsAmount: {
    color: '#10B981',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  savingsLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  savingsNote: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});