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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import { settingsStorage, exportAllData, importData, storage } from '../lib/storage';
import { AppSettings, ExportData } from '../types';

export default function SettingsTab() {
  const [settings, setSettings] = useState<AppSettings>({
    pricePerCig: 0.6,
    currency: '€',
    notificationsAllowed: true,
    language: 'fr',
    animationsEnabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await settingsStorage.get();
      setSettings(settingsData);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
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

  const showAbout = () => {
    Alert.alert(
      '🌱 MyQuitZone',
      'Version 1.0.0\n\nUne application pour vous accompagner dans votre démarche d\'arrêt du tabac.\n\nDéveloppé avec ❤️ pour votre bien-être.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#071033', '#1a1a2e', '#16213e', '#071033']}
        style={styles.gradientContainer}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Paramètres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Paramètres</Text>
          
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Prix par cigarette</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingValue}>{settings.pricePerCig}€</Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Devise</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingValue}>{settings.currency}</Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Langue</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingValue}>Français</Text>
              <TouchableOpacity style={styles.editButton}>
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
              onValueChange={(value) => setSettings({
                ...settings,
                animationsEnabled: value,
              })}
              trackColor={{ false: '#64748B', true: '#3B82F6' }}
              thumbColor={settings.animationsEnabled ? '#F8FAFC' : '#F8FAFC'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Notifications</Text>
              <Text style={styles.switchDescription}>
                Recevoir des rappels quotidiens
              </Text>
            </View>
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

          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.saveButtonText}>💾 Sauvegarder les paramètres</Text>
          </TouchableOpacity>
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
          
          <TouchableOpacity style={styles.supportButton}>
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
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  editButtonText: {
    color: '#3B82F6',
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
});