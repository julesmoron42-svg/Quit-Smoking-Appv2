import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  Platform,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StarryBackground from '../components/StarryBackground';
import * as FileSystem from 'expo-file-system';
// Pas de DateTimePicker nécessaire - nous utiliserons un modal personnalisé
import { settingsStorage, exportAllData, importData, storage, profileStorage } from '../lib/storage';
import { AppSettings, ExportData, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../lib/notificationService';

export default function SettingsTab() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    pricePerCig: 0.6,
    currency: '€',
    notificationsAllowed: true,
    language: 'fr',
    animationsEnabled: true,
    hapticsEnabled: true,
  });
  const [profile, setProfile] = useState<UserProfile>({
    startedSmokingYears: 0,
    cigsPerDay: 20,
    objectiveType: 'complete',
    reductionFrequency: 1,
    onboardingCompleted: false,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    dailyReminderTime: '20:00',
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState('20');
  const [tempMinute, setTempMinute] = useState('00');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showSmokingYearsModal, setShowSmokingYearsModal] = useState(false);
  const [showCigsPerDayModal, setShowCigsPerDayModal] = useState(false);
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showReductionFrequencyModal, setShowReductionFrequencyModal] = useState(false);
  const [showTargetDateModal, setShowTargetDateModal] = useState(false);
  const [tempPrice, setTempPrice] = useState('');
  const [tempCurrency, setTempCurrency] = useState('');
  const [tempSmokingYears, setTempSmokingYears] = useState('');
  const [tempCigsPerDay, setTempCigsPerDay] = useState('');
  const [tempObjective, setTempObjective] = useState('');
  const [tempLanguage, setTempLanguage] = useState('');
  const [tempReductionFrequency, setTempReductionFrequency] = useState('');
  const [tempTargetDate, setTempTargetDate] = useState('');

  // Debug: Log de l'état de l'utilisateur
  useEffect(() => {
    console.log('🔍 SettingsTab: État utilisateur:', { 
      hasUser: !!user, 
      userEmail: user?.email,
      userId: user?.id 
    });
  }, [user]);

  useEffect(() => {
    loadSettings();
    loadNotificationSettings();
    loadProfile();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await settingsStorage.get();
      setSettings(settingsData);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const notificationData = notificationService.getSettings();
      setNotificationSettings(notificationData);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres de notification:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const profileData = await profileStorage.get();
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const saveSettings = async (newSettings?: AppSettings) => {
    try {
      const settingsToSave = newSettings || settings;
      await settingsStorage.set(settingsToSave);
      if (!newSettings) {
        Alert.alert('Succès', 'Paramètres sauvegardés avec succès !');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    }
  };

  const handlePriceEdit = () => {
    setTempPrice(settings.pricePerCig.toString());
    setShowPriceModal(true);
  };

  const handleCurrencyEdit = () => {
    setTempCurrency(settings.currency);
    setShowCurrencyModal(true);
  };

  const handleSmokingYearsEdit = () => {
    setTempSmokingYears((profile.smokingYears || profile.startedSmokingYears).toString());
    setShowSmokingYearsModal(true);
  };

  const handleCigsPerDayEdit = () => {
    setTempCigsPerDay(profile.cigsPerDay.toString());
    setShowCigsPerDayModal(true);
  };

  const handleObjectiveEdit = () => {
    setTempObjective(profile.objectiveType);
    setShowObjectiveModal(true);
  };

  const handleLanguageEdit = () => {
    setTempLanguage(settings.language);
    setShowLanguageModal(true);
  };

  const handleReductionFrequencyEdit = () => {
    setTempReductionFrequency(profile.reductionFrequency?.toString() || '1');
    setShowReductionFrequencyModal(true);
  };

  const handleTargetDateEdit = () => {
    setTempTargetDate(profile.targetDate || '');
    setShowTargetDateModal(true);
  };

  const savePrice = async () => {
    const newPrice = parseFloat(tempPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un prix valide');
      return;
    }
    
    const newSettings = { ...settings, pricePerCig: newPrice };
    setSettings(newSettings);
    await saveSettings(newSettings);
    setShowPriceModal(false);
  };

  const saveCurrency = async () => {
    if (!tempCurrency.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une devise valide');
      return;
    }
    
    const newSettings = { ...settings, currency: tempCurrency.trim() };
    setSettings(newSettings);
    await saveSettings(newSettings);
    setShowCurrencyModal(false);
  };

  const saveSmokingYears = async () => {
    const newYears = parseInt(tempSmokingYears);
    if (isNaN(newYears) || newYears < 0 || newYears > 100) {
      Alert.alert('Erreur', 'Veuillez saisir un nombre d\'années valide (0-100)');
      return;
    }
    
    const newProfile = { ...profile, smokingYears: newYears };
    await saveProfile(newProfile);
    setShowSmokingYearsModal(false);
  };

  const saveCigsPerDay = async () => {
    const newCigs = parseInt(tempCigsPerDay);
    if (isNaN(newCigs) || newCigs < 1 || newCigs > 100) {
      Alert.alert('Erreur', 'Veuillez saisir un nombre de cigarettes valide (1-100)');
      return;
    }
    
    const newProfile = { ...profile, cigsPerDay: newCigs };
    await saveProfile(newProfile);
    setShowCigsPerDayModal(false);
  };

  const saveObjective = async () => {
    if (!tempObjective || !['complete', 'progressive'].includes(tempObjective)) {
      Alert.alert('Erreur', 'Veuillez sélectionner un objectif valide');
      return;
    }
    
    const newProfile = { ...profile, objectiveType: tempObjective as 'complete' | 'progressive' };
    await saveProfile(newProfile);
    setShowObjectiveModal(false);
  };

  const saveLanguage = async () => {
    if (!tempLanguage || !['fr', 'en'].includes(tempLanguage)) {
      Alert.alert('Erreur', 'Veuillez sélectionner une langue valide');
      return;
    }
    
    const newSettings = { ...settings, language: tempLanguage as 'fr' | 'en' };
    setSettings(newSettings);
    await saveSettings(newSettings);
    setShowLanguageModal(false);
  };

  const saveReductionFrequency = async () => {
    const newFrequency = parseInt(tempReductionFrequency);
    if (isNaN(newFrequency) || newFrequency < 1 || newFrequency > 50) {
      Alert.alert('Erreur', 'Veuillez saisir une fréquence de réduction valide (1-50 cigarettes)');
      return;
    }
    
    const newProfile = { ...profile, reductionFrequency: newFrequency };
    await saveProfile(newProfile);
    setShowReductionFrequencyModal(false);
  };

  const saveTargetDate = async () => {
    if (!tempTargetDate.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une date d\'arrêt valide');
      return;
    }
    
    // Validation basique de la date
    const date = new Date(tempTargetDate);
    if (isNaN(date.getTime())) {
      Alert.alert('Erreur', 'Format de date invalide');
      return;
    }
    
    const newProfile = { ...profile, targetDate: tempTargetDate };
    await saveProfile(newProfile);
    setShowTargetDateModal(false);
  };

  const saveProfile = async (newProfile: UserProfile) => {
    try {
      await profileStorage.set(newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
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

  const exportData = async () => {
    try {
      const data = await exportAllData();
      const fileName = `myquitzone_export_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
      
      Alert.alert(
        'Export réussi',
        `Vos données ont été exportées vers ${fileName}`,
        [
          {
            text: 'Partager',
            onPress: () => Share.share({
              url: fileUri,
              title: 'Export MyQuitZone',
              message: 'Voici mes données d\'export MyQuitZone',
            }),
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'exporter les données');
    }
  };

  const resetData = () => {
    Alert.alert(
      '⚠️ Zone de danger',
      'Cette action va supprimer TOUTES vos données. Cette action est irréversible.\n\nÊtes-vous absolument sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer tout',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Dernière confirmation',
              'Dernière chance ! Toutes vos données seront définitivement perdues.',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'CONFIRMER LA SUPPRESSION',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await storage.clear();
                      Alert.alert('Succès', 'Toutes les données ont été supprimées');
                      // Recharger les paramètres par défaut
                      loadSettings();
                    } catch (error) {
                      Alert.alert('Erreur', 'Impossible de supprimer les données');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Se déconnecter',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      '🌱 MyQuitZone',
      'Version 1.0.0\n\nUne application pour vous accompagner dans votre démarche d\'arrêt du tabac.\n\nDéveloppé avec ❤️ pour votre bien-être.',
      [{ text: 'OK' }]
    );
  };

  const handleContact = async () => {
    const email = 'MyQuitZone.contact@gmail.com';
    const subject = 'Support MyQuitZone';
    const body = 'Bonjour,\n\nJ\'aimerais vous contacter concernant...';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Application de messagerie non disponible',
          `Vous pouvez nous contacter directement à l'adresse : ${email}`,
          [
            { text: 'Copier l\'adresse', onPress: () => {
              // Note: Clipboard n'est pas importé, mais on peut utiliser Share
              Share.share({
                message: email,
                title: 'Adresse email MyQuitZone'
              });
            }},
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du client email:', error);
      Alert.alert(
        'Erreur',
        `Impossible d'ouvrir l'application de messagerie. Vous pouvez nous contacter à : ${email}`,
        [
          { text: 'Copier l\'adresse', onPress: () => {
            Share.share({
              message: email,
              title: 'Adresse email MyQuitZone'
            });
          }},
          { text: 'OK' }
        ]
      );
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        // Demander l'autorisation si elle n'est pas encore accordée
        const hasPermission = await notificationService.checkPermission();
        if (!hasPermission) {
          const granted = await notificationService.requestPermission();
          if (!granted) {
            Alert.alert(
              'Autorisation requise',
              'Pour activer les notifications, vous devez autoriser MyQuitZone dans les paramètres de votre appareil.',
              [{ text: 'OK' }]
            );
            return;
          }
        }
      }
      
      await notificationService.setNotificationsEnabled(enabled);
      setNotificationSettings(prev => ({ ...prev, enabled }));
      
      Alert.alert(
        'Paramètres mis à jour',
        enabled 
          ? 'Les notifications quotidiennes sont maintenant activées !'
          : 'Les notifications quotidiennes ont été désactivées.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur lors de la modification des notifications:', error);
      Alert.alert('Erreur', 'Impossible de modifier les paramètres de notification');
    }
  };

  const openTimePicker = () => {
    const [hour, minute] = notificationSettings.dailyReminderTime.split(':');
    setTempHour(hour);
    setTempMinute(minute);
    setShowTimePicker(true);
  };

  const closeTimePicker = () => {
    setShowTimePicker(false);
  };

  const saveTime = async () => {
    const hour = parseInt(tempHour);
    const minute = parseInt(tempMinute);
    
    // Validation
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      Alert.alert('Erreur', 'Veuillez saisir une heure valide (HH:MM)');
      return;
    }
    
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    try {
      console.log(`🕐 Modification de l'heure des notifications vers: ${timeString}`);
      
      await notificationService.setDailyReminderTime(timeString);
      setNotificationSettings(prev => ({ ...prev, dailyReminderTime: timeString }));
      setShowTimePicker(false);
      
      
      Alert.alert(
        'Heure mise à jour',
        `Les notifications quotidiennes sont maintenant programmées à ${timeString}. Vérifiez la console pour voir les détails.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur lors de la modification de l\'heure:', error);
      Alert.alert('Erreur', 'Impossible de modifier l\'heure de notification');
    }
  };


  return (
    <StarryBackground>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Section Profil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Mon Profil</Text>
          
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Années de tabac</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingValue}>{profile.smokingYears || profile.startedSmokingYears} ans</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleSmokingYearsEdit}>
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Cigarettes par jour</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingValue}>{profile.cigsPerDay} cigarettes</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleCigsPerDayEdit}>
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Objectif principal</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingValue}>
                {profile.objectiveType === 'complete' ? 'Arrêt complet' : 'Réduction progressive'}
              </Text>
              <TouchableOpacity style={styles.editButton} onPress={handleObjectiveEdit}>
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>

          {profile.objectiveType === 'progressive' && (
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Fréquence de réduction</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingValue}>{profile.reductionFrequency || 1} cigarettes/jour</Text>
                <TouchableOpacity style={styles.editButton} onPress={handleReductionFrequencyEdit}>
                  <Text style={styles.editButtonText}>Modifier</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {profile.objectiveType === 'complete' && (
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Date d'arrêt cible</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingValue}>{profile.targetDate || 'Non définie'}</Text>
                <TouchableOpacity style={styles.editButton} onPress={handleTargetDateEdit}>
                  <Text style={styles.editButtonText}>Modifier</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Motivation principale</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>{getMotivationText()}</Text>
            </View>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Moment de consommation</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>{getSmokingTimeText()}</Text>
            </View>
          </View>

          {/* Économies potentielles */}
          <View style={styles.savingsSection}>
            <Text style={styles.settingLabel}>💰 Mes Économies Potentielles</Text>
            <View style={styles.savingsGrid}>
              <View style={styles.savingsItem}>
                <Text style={styles.savingsAmount}>{calculateSavings().daily}€</Text>
                <Text style={styles.savingsPeriod}>par jour</Text>
              </View>
              
              <View style={styles.savingsItem}>
                <Text style={styles.savingsAmount}>{calculateSavings().monthly}€</Text>
                <Text style={styles.savingsPeriod}>par mois</Text>
              </View>
              
              <View style={styles.savingsItem}>
                <Text style={styles.savingsAmount}>{calculateSavings().yearly}€</Text>
                <Text style={styles.savingsPeriod}>par an</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section Paramètres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Paramètres</Text>
          
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Prix par cigarette</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingValue}>{settings.pricePerCig}€</Text>
              <TouchableOpacity style={styles.editButton} onPress={handlePriceEdit}>
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Devise</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingValue}>{settings.currency}</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleCurrencyEdit}>
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Langue</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingValue}>{settings.language === 'fr' ? 'Français' : 'English'}</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleLanguageEdit}>
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Animations</Text>
              <Text style={styles.switchDescription}>
                Activer les animations et effets visuels
              </Text>
            </View>
            <Switch
              value={settings.animationsEnabled}
              onValueChange={async (value) => {
                const newSettings = {
                  ...settings,
                  animationsEnabled: value,
                };
                setSettings(newSettings);
                await saveSettings(newSettings);
              }}
              trackColor={{ false: '#64748B', true: '#8B45FF' }}
              thumbColor={settings.animationsEnabled ? '#F8FAFC' : '#F8FAFC'}
            />
          </View>

          {/* Section Vibrations */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>📳 Vibrations</Text>
            
            <View style={styles.switchGroup}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Vibrations haptiques</Text>
                <Text style={styles.switchDescription}>
                  Activer les vibrations lors des interactions
                </Text>
              </View>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={async (value) => {
                  const newSettings = {
                    ...settings,
                    hapticsEnabled: value,
                  };
                  setSettings(newSettings);
                  await saveSettings(newSettings);
                }}
                trackColor={{ false: '#64748B', true: '#8B45FF' }}
                thumbColor={settings.hapticsEnabled ? '#F8FAFC' : '#F8FAFC'}
              />
            </View>
          </View>

          {/* Section Notifications */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>🔔 Notifications</Text>
            
            <View style={styles.switchGroup}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Notifications quotidiennes</Text>
                <Text style={styles.switchDescription}>
                  Recevoir des rappels pour saisir vos données du jour
                </Text>
              </View>
              <Switch
                value={notificationSettings.enabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#64748B', true: '#8B45FF' }}
                thumbColor={notificationSettings.enabled ? '#F8FAFC' : '#F8FAFC'}
              />
            </View>

            {notificationSettings.enabled && (
              <View style={styles.notificationConfigContainer}>
                <Text style={styles.notificationConfigLabel}>Heure du rappel quotidien</Text>
                <TouchableOpacity 
                  style={styles.timePickerButton}
                  onPress={openTimePicker}
                >
                  <Text style={styles.timePickerButtonText}>
                    🕐 {notificationSettings.dailyReminderTime}
                  </Text>
                  <Text style={styles.timePickerButtonSubtext}>Appuyer pour modifier</Text>
                </TouchableOpacity>
                
              </View>
            )}
          </View>


        </View>

        {/* Section Données */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Gestion des données</Text>
          
          <TouchableOpacity style={styles.dataButton} onPress={exportData}>
            <Text style={styles.dataButtonText}>📤 Exporter mes données</Text>
            <Text style={styles.dataButtonDescription}>
              Sauvegarder toutes vos données en fichier JSON
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataButton}>
            <Text style={styles.dataButtonText}>📥 Importer des données</Text>
            <Text style={styles.dataButtonDescription}>
              Restaurer vos données depuis un fichier JSON
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Zone de danger */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Zone de danger</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={resetData}>
            <Text style={styles.dangerButtonText}>🗑️ Supprimer toutes les données</Text>
            <Text style={styles.dangerButtonDescription}>
              Cette action est irréversible et supprimera tout votre historique
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section À propos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ À propos</Text>
          
          <TouchableOpacity style={styles.aboutButton} onPress={showAbout}>
            <Text style={styles.aboutButtonText}>🌱 MyQuitZone v1.0.0</Text>
            <Text style={styles.aboutButtonDescription}>
              Votre compagnon pour arrêter de fumer
            </Text>
          </TouchableOpacity>

          <View style={styles.creditsContainer}>
            <Text style={styles.creditsTitle}>Remerciements</Text>
            <Text style={styles.creditsText}>
              • Données santé : Organisation Mondiale de la Santé (OMS)
            </Text>
            <Text style={styles.creditsText}>
              • Icônes : Lucide React
            </Text>
            <Text style={styles.creditsText}>
              • Graphiques : React Native Chart Kit
            </Text>
            <Text style={styles.creditsText}>
              • Framework : React Native + Expo
            </Text>
          </View>
        </View>

        {/* Section Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🆘 Support</Text>
          
          <TouchableOpacity style={styles.supportButton} onPress={handleContact}>
            <Text style={styles.supportButtonText}>📧 Nous contacter</Text>
            <Text style={styles.supportButtonDescription}>
              Signaler un bug ou suggérer une amélioration
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>⭐ Évaluer l'app</Text>
            <Text style={styles.supportButtonDescription}>
              Donnez votre avis sur l'App Store / Google Play
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>📖 Guide d'utilisation</Text>
            <Text style={styles.supportButtonDescription}>
              Apprendre à utiliser toutes les fonctionnalités
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Compte */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Mon compte</Text>
            
            <View style={styles.accountInfo}>
              <Text style={styles.accountEmail}>{user.email}</Text>
              <Text style={styles.accountDescription}>
                Connecté avec Supabase
              </Text>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>🚪 Se déconnecter</Text>
              <Text style={styles.signOutButtonDescription}>
                Déconnectez-vous de votre compte
              </Text>
            </TouchableOpacity>
          </View>
        )}

        </ScrollView>
        
        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={closeTimePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choisir l'heure</Text>
              
              <View style={styles.timeInputContainer}>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeInputLabel}>Heures</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={tempHour}
                    onChangeText={setTempHour}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="HH"
                  />
                </View>
                
                <Text style={styles.timeSeparator}>:</Text>
                
                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeInputLabel}>Minutes</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={tempMinute}
                    onChangeText={setTempMinute}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="MM"
                  />
                </View>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={closeTimePicker}
                >
                  <Text style={styles.modalCancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalSaveButton}
                  onPress={saveTime}
                >
                  <Text style={styles.modalSaveButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal pour modifier le prix */}
        <Modal
          visible={showPriceModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPriceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentNew}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalBackButton}
                  onPress={() => setShowPriceModal(false)}
                >
                  <Text style={styles.modalBackButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitleNew}>Modifier le prix par cigarette</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>
              
              <View style={styles.modalBody}>
                <TextInput
                  style={styles.modalTextInput}
                  value={tempPrice}
                  onChangeText={setTempPrice}
                  keyboardType="numeric"
                  placeholder="Prix en euros"
                  placeholderTextColor="#64748B"
                />
              </View>
              
              <TouchableOpacity 
                style={styles.modalSaveButtonFull}
                onPress={savePrice}
              >
                <Text style={styles.modalSaveButtonFullText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal pour modifier la devise */}
        <Modal
          visible={showCurrencyModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCurrencyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentNew}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalBackButton}
                  onPress={() => setShowCurrencyModal(false)}
                >
                  <Text style={styles.modalBackButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitleNew}>Modifier la devise</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>
              
              <View style={styles.modalBody}>
                <TextInput
                  style={styles.modalTextInput}
                  value={tempCurrency}
                  onChangeText={setTempCurrency}
                  placeholder="Symbole de devise (€, $, £, etc.)"
                  placeholderTextColor="#64748B"
                  maxLength={3}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.modalSaveButtonFull}
                onPress={saveCurrency}
              >
                <Text style={styles.modalSaveButtonFullText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal pour modifier les années de tabac */}
        <Modal
          visible={showSmokingYearsModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSmokingYearsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentNew}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalBackButton}
                  onPress={() => setShowSmokingYearsModal(false)}
                >
                  <Text style={styles.modalBackButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitleNew}>Modifier les années de tabac</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>
              
              <View style={styles.modalBody}>
                <TextInput
                  style={styles.modalTextInput}
                  value={tempSmokingYears}
                  onChangeText={setTempSmokingYears}
                  keyboardType="numeric"
                  placeholder="Nombre d'années"
                  placeholderTextColor="#64748B"
                  maxLength={2}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.modalSaveButtonFull}
                onPress={saveSmokingYears}
              >
                <Text style={styles.modalSaveButtonFullText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal pour modifier les cigarettes par jour */}
        <Modal
          visible={showCigsPerDayModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCigsPerDayModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentNew}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalBackButton}
                  onPress={() => setShowCigsPerDayModal(false)}
                >
                  <Text style={styles.modalBackButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitleNew}>Modifier les cigarettes par jour</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>
              
              <View style={styles.modalBody}>
                <TextInput
                  style={styles.modalTextInput}
                  value={tempCigsPerDay}
                  onChangeText={setTempCigsPerDay}
                  keyboardType="numeric"
                  placeholder="Nombre de cigarettes"
                  placeholderTextColor="#64748B"
                  maxLength={3}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.modalSaveButtonFull}
                onPress={saveCigsPerDay}
              >
                <Text style={styles.modalSaveButtonFullText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal pour modifier l'objectif */}
        <Modal
          visible={showObjectiveModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowObjectiveModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentNew}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalBackButton}
                  onPress={() => setShowObjectiveModal(false)}
                >
                  <Text style={styles.modalBackButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitleNew}>Modifier l'objectif</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>
              
              <View style={styles.modalBody}>
                <View style={styles.objectiveOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.objectiveOption,
                      tempObjective === 'complete' && styles.objectiveOptionSelected
                    ]}
                    onPress={() => setTempObjective('complete')}
                  >
                    <Text style={[
                      styles.objectiveOptionText,
                      tempObjective === 'complete' && styles.objectiveOptionTextSelected
                    ]}>Arrêt complet</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.objectiveOption,
                      tempObjective === 'progressive' && styles.objectiveOptionSelected
                    ]}
                    onPress={() => setTempObjective('progressive')}
                  >
                    <Text style={[
                      styles.objectiveOptionText,
                      tempObjective === 'progressive' && styles.objectiveOptionTextSelected
                    ]}>Réduction progressive</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.modalSaveButtonFull}
                onPress={saveObjective}
              >
                <Text style={styles.modalSaveButtonFullText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal pour modifier la langue */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentNew}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalBackButton}
                  onPress={() => setShowLanguageModal(false)}
                >
                  <Text style={styles.modalBackButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitleNew}>Modifier la langue</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>
              
              <View style={styles.modalBody}>
                <View style={styles.languageOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.languageOption,
                      tempLanguage === 'fr' && styles.languageOptionSelected
                    ]}
                    onPress={() => setTempLanguage('fr')}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      tempLanguage === 'fr' && styles.languageOptionTextSelected
                    ]}>🇫🇷 Français</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.languageOption,
                      tempLanguage === 'en' && styles.languageOptionSelected
                    ]}
                    onPress={() => setTempLanguage('en')}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      tempLanguage === 'en' && styles.languageOptionTextSelected
                    ]}>🇬🇧 English</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.modalSaveButtonFull}
                onPress={saveLanguage}
              >
                <Text style={styles.modalSaveButtonFullText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal pour modifier la fréquence de réduction */}
        <Modal
          visible={showReductionFrequencyModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowReductionFrequencyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentNew}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalBackButton}
                  onPress={() => setShowReductionFrequencyModal(false)}
                >
                  <Text style={styles.modalBackButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitleNew}>Modifier la fréquence de réduction</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>
              
              <View style={styles.modalBody}>
                <TextInput
                  style={styles.modalTextInput}
                  value={tempReductionFrequency}
                  onChangeText={setTempReductionFrequency}
                  keyboardType="numeric"
                  placeholder="Cigarettes par jour"
                  placeholderTextColor="#64748B"
                  maxLength={2}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.modalSaveButtonFull}
                onPress={saveReductionFrequency}
              >
                <Text style={styles.modalSaveButtonFullText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal pour modifier la date d'arrêt */}
        <Modal
          visible={showTargetDateModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTargetDateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentNew}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.modalBackButton}
                  onPress={() => setShowTargetDateModal(false)}
                >
                  <Text style={styles.modalBackButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitleNew}>Modifier la date d'arrêt</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>
              
              <View style={styles.modalBody}>
                <TextInput
                  style={styles.modalTextInput}
                  value={tempTargetDate}
                  onChangeText={setTempTargetDate}
                  placeholder="YYYY-MM-DD (ex: 2024-12-31)"
                  placeholderTextColor="#64748B"
                />
              </View>
              
              <TouchableOpacity 
                style={styles.modalSaveButtonFull}
                onPress={saveTargetDate}
              >
                <Text style={styles.modalSaveButtonFullText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071033',
  },
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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
  settingGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingValue: {
    color: '#8B45FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.5)',
  },
  editButtonText: {
    color: '#8B45FF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  switchGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: 15,
  },
  switchLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  switchDescription: {
    color: '#94A3B8',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: 'rgba(139, 69, 255, 0.8)',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.3)',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dataButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dataButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dataButtonDescription: {
    color: '#94A3B8',
    fontSize: 12,
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dangerButtonDescription: {
    color: '#FCA5A5',
    fontSize: 12,
  },
  aboutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  aboutButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  aboutButtonDescription: {
    color: '#94A3B8',
    fontSize: 12,
  },
  creditsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 15,
  },
  creditsTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  creditsText: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 5,
  },
  supportButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  supportButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  supportButtonDescription: {
    color: '#94A3B8',
    fontSize: 12,
  },
  accountInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  accountEmail: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  accountDescription: {
    color: '#94A3B8',
    fontSize: 12,
  },
  signOutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  signOutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  signOutButtonDescription: {
    color: '#FCA5A5',
    fontSize: 12,
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
  notificationConfigContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationConfigLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  notificationConfigTime: {
    color: '#8B45FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  timePickerButton: {
    backgroundColor: 'rgba(139, 69, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.4)',
    alignItems: 'center',
    marginTop: 8,
  },
  timePickerButtonText: {
    color: '#8B45FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  timePickerButtonSubtext: {
    color: '#94A3B8',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#0a0a0a',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 300,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeInputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 80,
  },
  timeSeparator: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  modalCancelButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalSaveButton: {
    backgroundColor: 'rgba(139, 69, 255, 0.8)',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 255, 0.3)',
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  modalSaveButtonText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 25,
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
  savingsSection: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  savingsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  savingsItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  savingsAmount: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  savingsPeriod: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  objectiveOptions: {
    marginBottom: 25,
  },
  objectiveOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  objectiveOptionSelected: {
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderColor: 'rgba(139, 69, 255, 0.5)',
  },
  objectiveOptionText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  objectiveOptionTextSelected: {
    color: '#8B45FF',
    fontWeight: 'bold',
  },
  languageOptions: {
    marginBottom: 25,
  },
  languageOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageOptionSelected: {
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderColor: 'rgba(139, 69, 255, 0.5)',
  },
  languageOptionText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  languageOptionTextSelected: {
    color: '#8B45FF',
    fontWeight: 'bold',
  },
  // Nouveaux styles pour les modals
  modalContentNew: {
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 300,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalBackButtonText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitleNew: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalBody: {
    padding: 20,
  },
  modalSaveButtonFull: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalSaveButtonFullText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
});