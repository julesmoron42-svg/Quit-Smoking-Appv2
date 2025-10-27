// Configuration des logs pour le Coach IA
// Ce fichier permet de contrôler l'affichage des logs selon l'environnement

export const LOG_CONFIG = {
  // Niveau de log (0 = aucun, 1 = erreurs seulement, 2 = warnings + erreurs, 3 = tout)
  LOG_LEVEL: __DEV__ ? 3 : 1,
  
  // Préfixes pour identifier les logs du Coach IA
  PREFIXES: {
    ERROR: '❌ AICoach',
    WARNING: '⚠️ AICoach',
    INFO: 'ℹ️ AICoach',
    SUCCESS: '✅ AICoach',
    DEBUG: '🔍 AICoach'
  }
};

// Fonction utilitaire pour logger avec niveau
export const logger = {
  error: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.LOG_LEVEL >= 1) {
      console.error(`${LOG_CONFIG.PREFIXES.ERROR}: ${message}`, ...args);
    }
  },
  
  warning: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.LOG_LEVEL >= 2) {
      console.warn(`${LOG_CONFIG.PREFIXES.WARNING}: ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.LOG_LEVEL >= 3) {
      console.log(`${LOG_CONFIG.PREFIXES.INFO}: ${message}`, ...args);
    }
  },
  
  success: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.LOG_LEVEL >= 3) {
      console.log(`${LOG_CONFIG.PREFIXES.SUCCESS}: ${message}`, ...args);
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (LOG_CONFIG.LOG_LEVEL >= 3) {
      console.log(`${LOG_CONFIG.PREFIXES.DEBUG}: ${message}`, ...args);
    }
  }
};

// Instructions :
// - En développement (__DEV__ = true) : tous les logs sont affichés
// - En production (__DEV__ = false) : seulement les erreurs sont affichées
// - Vous pouvez ajuster LOG_LEVEL pour changer le comportement
