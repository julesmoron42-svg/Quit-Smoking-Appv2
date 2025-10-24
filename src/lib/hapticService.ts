import * as Haptics from 'expo-haptics';
import { settingsStorage } from './storage';

/**
 * Service pour gérer les retours haptiques dans l'application
 */
export class HapticService {
  /**
   * Vérifie si les vibrations sont activées
   */
  private static async isHapticsEnabled(): Promise<boolean> {
    try {
      const settings = await settingsStorage.get();
      return settings?.hapticsEnabled !== false; // Par défaut activé
    } catch (error) {
      console.log('Erreur lors de la vérification des paramètres haptiques:', error);
      return true; // Par défaut activé en cas d'erreur
    }
  }

  /**
   * Exécute une vibration si elle est activée
   */
  private static async executeHaptic(action: () => void) {
    const isEnabled = await this.isHapticsEnabled();
    if (isEnabled) {
      action();
    }
  }
  /**
   * Vibration légère - pour les interactions subtiles
   */
  static async light() {
    await this.executeHaptic(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });
  }

  /**
   * Vibration moyenne - pour les interactions normales
   */
  static async medium() {
    await this.executeHaptic(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    });
  }

  /**
   * Vibration forte - pour les actions importantes
   */
  static async heavy() {
    await this.executeHaptic(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    });
  }

  /**
   * Vibration de sélection - pour les changements d'état
   */
  static async selection() {
    await this.executeHaptic(() => {
      Haptics.selectionAsync();
    });
  }

  /**
   * Vibration de notification - pour les alertes
   */
  static async notification(type: 'success' | 'warning' | 'error' = 'success') {
    await this.executeHaptic(() => {
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    });
  }

  /**
   * Vibration pour effet machine à écrire
   */
  static async typewriter() {
    await this.executeHaptic(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });
  }

  /**
   * Vibration légère et courte pour les interactions subtiles
   */
  static async subtle() {
    await this.executeHaptic(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });
  }

  /**
   * Vibration pour les confirmations de saisie
   */
  static async confirmation() {
    await this.executeHaptic(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });
  }

  /**
   * Vibration pour boutons
   */
  static async buttonPress() {
    await this.executeHaptic(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    });
  }

  /**
   * Vibration pour succès d'action
   */
  static async success() {
    await this.executeHaptic(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }

  /**
   * Vibration pour erreur
   */
  static async error() {
    await this.executeHaptic(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    });
  }

  /**
   * Vibration pour avertissement
   */
  static async warning() {
    await this.executeHaptic(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    });
  }
}
