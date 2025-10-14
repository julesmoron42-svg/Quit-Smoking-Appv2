import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration des notifications pour iOS
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Configuration spécifique pour iOS
if (Platform.OS === 'ios') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Notifications par défaut',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

// Interface pour les données de notification
export interface NotificationData {
  type: 'daily_reminder' | 'test';
  action?: 'open_daily_entry';
}

export interface NotificationSettings {
  enabled: boolean;
  dailyReminderTime: string; // Format HH:mm
  lastPermissionRequested?: string; // Date ISO
  scheduledNotificationIds?: string[]; // IDs des notifications programmées
}

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = {
    enabled: false,
      dailyReminderTime: '21:00',
    scheduledNotificationIds: [],
  };

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Demande l'autorisation pour les notifications
   */
  public async requestPermission(): Promise<boolean> {
    try {
      console.log('🔔 Demande d\'autorisation pour les notifications...');
      
      // Vérifier si l'autorisation a déjà été demandée récemment (dans les 7 derniers jours)
      const lastRequested = this.settings.lastPermissionRequested;
      if (lastRequested) {
        const lastRequestDate = new Date(lastRequested);
        const now = new Date();
        const daysDiff = (now.getTime() - lastRequestDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 7) {
          console.log('🔔 Autorisation déjà demandée récemment, skip...');
          return false;
        }
      }

      // Demander l'autorisation
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Marquer que l'autorisation a été demandée
      this.settings.lastPermissionRequested = new Date().toISOString();
      await this.saveSettings();

      const granted = finalStatus === 'granted';
      
      if (granted) {
        console.log('✅ Autorisation accordée pour les notifications');
        this.settings.enabled = true;
        await this.saveSettings();
        
        // Programmer la notification quotidienne
        await this.scheduleDailyNotification();
      } else {
        console.log('❌ Autorisation refusée pour les notifications');
      }

      return granted;
    } catch (error) {
      console.error('❌ Erreur lors de la demande d\'autorisation:', error);
      return false;
    }
  }

  /**
   * Vérifie si les notifications sont autorisées
   */
  public async checkPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  /**
   * Génère un message de notification aléatoire
   */
  private getRandomDailyMessage(): { title: string; body: string } {
    const messages = [
      {
        title: "🎯 Mission quotidienne accomplie ?",
        body: "Alors, as-tu réussi ta mission du jour ? Viens me raconter tes victoires, même les petites ! 🏆"
      },
      {
        title: "⚡ Défi quotidien relevé ?",
        body: "Alors champion, as-tu relevé le défi du jour ? Raconte-moi tes exploits ! 💪"
      },
      {
        title: "🌟 Succès du jour à partager ?",
        body: "Champion, quels sont tes succès d'aujourd'hui ? Même les plus petits comptent énormément ! 🏅"
      }
    ];

    // Choisir un message aléatoire
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  /**
   * Programme la notification quotidienne
   */
  public async scheduleDailyNotification(): Promise<void> {
    try {
      // Annuler les notifications existantes
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!this.settings.enabled) {
        console.log('🔔 Notifications désactivées, pas de programmation');
        return;
      }

      // Vérifier les permissions
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        console.log('❌ Pas d\'autorisation pour programmer les notifications');
        return;
      }

      // Extraire l'heure et les minutes
      const [hours, minutes] = this.settings.dailyReminderTime.split(':').map(Number);
      
      console.log(`🔔 Programmation de la notification pour ${hours}:${minutes.toString().padStart(2, '0')}`);

      // Générer un message aléatoire
      const randomMessage = this.getRandomDailyMessage();

      // Calculer la prochaine occurrence
      const now = new Date();
      const nextNotification = new Date();
      nextNotification.setHours(hours, minutes, 0, 0);
      
      // Si l'heure est déjà passée aujourd'hui, programmer pour demain
      if (nextNotification <= now) {
        nextNotification.setDate(nextNotification.getDate() + 1);
      }
      
      // S'assurer que la notification est programmée au moins 15 minutes dans le futur
      // pour éviter les notifications immédiates accidentelles
      const timeDiff = nextNotification.getTime() - now.getTime();
      if (timeDiff < 900000) { // Moins de 15 minutes
        nextNotification.setMinutes(nextNotification.getMinutes() + 15);
        console.log(`⏰ Notification reprogrammée pour éviter une notification immédiate (au moins 15 minutes dans le futur)`);
      }
      
      console.log(`🕐 Prochaine notification programmée pour: ${nextNotification.toLocaleString()}`);


      // Programmer la vraie notification quotidienne
      // Utiliser le même format pour toutes les plateformes pour éviter les notifications immédiates
      const triggerConfig = {
        seconds: Math.max(1, Math.floor((nextNotification.getTime() - now.getTime()) / 1000)),
        repeats: false,
      };

      console.log(`📱 Format de trigger pour ${Platform.OS}:`, triggerConfig);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: randomMessage.title,
          body: randomMessage.body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            type: 'daily_reminder',
            action: 'open_daily_entry'
          } as NotificationData,
        },
        trigger: triggerConfig,
      });

      console.log(`✅ Notification quotidienne programmée avec ID: ${notificationId} à ${this.settings.dailyReminderTime}`);
      
      // Stocker l'ID de la notification
      this.settings.scheduledNotificationIds = [notificationId];
      await this.saveSettings();
      
    } catch (error) {
      console.error('❌ Erreur lors de la programmation des notifications:', error);
    }
  }

  /**
   * Configure l'heure de la notification quotidienne
   */
  public async setDailyReminderTime(time: string): Promise<void> {
    this.settings.dailyReminderTime = time;
    await this.saveSettings();
    
    // Programmer automatiquement si les notifications sont activées
    if (this.settings.enabled) {
      await this.scheduleDailyNotification();
      console.log(`⏰ Heure mise à jour et notification reprogrammée pour ${time}`);
    } else {
      console.log(`⏰ Heure mise à jour vers ${time} (notifications désactivées)`);
    }
  }


  /**
   * Active ou désactive les notifications
   */
  public async setNotificationsEnabled(enabled: boolean): Promise<void> {
    this.settings.enabled = enabled;
    await this.saveSettings();
    
    if (enabled) {
      // Programmer automatiquement la notification quand on active
      await this.scheduleDailyNotification();
      console.log(`🔔 Notifications activées et programmées pour ${this.settings.dailyReminderTime}`);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log(`🔔 Notifications désactivées et annulées`);
    }
  }

  /**
   * Charge les paramètres depuis AsyncStorage
   */
  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paramètres de notification:', error);
    }
  }

  /**
   * Sauvegarde les paramètres dans AsyncStorage
   */
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des paramètres de notification:', error);
    }
  }

  /**
   * Callback pour gérer les clics sur les notifications
   */
  private onNotificationResponse: ((notification: Notifications.NotificationResponse) => void) | null = null;

  /**
   * Définit le callback pour gérer les clics sur les notifications
   */
  public setNotificationResponseHandler(callback: (notification: Notifications.NotificationResponse) => void): void {
    this.onNotificationResponse = callback;
    
    // Écouter les réponses aux notifications
    Notifications.addNotificationResponseReceivedListener((response) => {
      if (this.onNotificationResponse) {
        this.onNotificationResponse(response);
      }
    });
  }

  /**
   * Initialise le service de notifications
   */
  public async initialize(): Promise<void> {
    await this.loadSettings();
    
    // Ne pas programmer automatiquement au démarrage
    // pour éviter les notifications indésirables
    console.log(`🔔 Service de notifications initialisé (heure configurée: ${this.settings.dailyReminderTime})`);
    console.log(`💡 Les notifications seront programmées uniquement sur demande explicite`);
  }

  /**
   * Obtient les paramètres actuels
   */
  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Annule toutes les notifications programmées
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Nettoyer nos IDs stockés localement
      this.settings.scheduledNotificationIds = [];
      await this.saveSettings();
      
      console.log('✅ Toutes les notifications ont été annulées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation des notifications:', error);
    }
  }
}

// Instance singleton
export const notificationService = NotificationService.getInstance();
