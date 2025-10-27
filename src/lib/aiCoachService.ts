import { UserProfile, DailyEntry } from '../types';
import { AI_COACH_CONFIG } from '../config/aiCoachConfig';

// Types pour les messages du coach IA
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export interface ConversationContext {
  userProfile: UserProfile;
  dailyEntries: Record<string, DailyEntry>;
  currentStreak: number;
  cigarettesAvoided: number;
  moneySaved: number;
}

export interface AICoachResponse {
  message: string;
  tokenCount: number;
  success: boolean;
  error?: string;
}

class AICoachService {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = AI_COACH_CONFIG.GEMINI_API_KEY;
    this.baseUrl = AI_COACH_CONFIG.GEMINI_API_URL;
  }

  /**
   * Envoie un message à Gemini Pro et récupère la réponse
   */
  async sendMessage(
    userMessage: string, 
    context: ConversationContext,
    conversationHistory: ChatMessage[] = []
  ): Promise<AICoachResponse> {
    try {
      // Construire le prompt optimisé
      const systemPrompt = this.buildSystemPrompt(context);
      const conversationPrompt = this.buildConversationPrompt(conversationHistory, userMessage);
      
      const fullPrompt = `${systemPrompt}\n\n${conversationPrompt}`;

      // Construire l'URL complète avec la clé API
      const fullUrl = `${this.baseUrl}${this.apiKey}`;
      
      // Log pour debug
      console.log('🔍 AICoachService - URL:', fullUrl);
      console.log('🔍 AICoachService - Prompt length:', fullPrompt.length);
      
      // Appel à l'API Gemini Pro
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: AI_COACH_CONFIG.TEMPERATURE,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: AI_COACH_CONFIG.MAX_TOKENS,
          }
        })
      });

      if (!response.ok) {
        console.error('❌ AICoachService - API Error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ AICoachService - Error response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Réponse invalide de l\'API Gemini');
      }

      const aiMessage = data.candidates[0].content.parts[0].text;
      const tokenCount = data.usageMetadata?.totalTokenCount || 0;

      return {
        message: aiMessage.trim(),
        tokenCount,
        success: true
      };

    } catch (error) {
      console.error('❌ AICoachService Error:', error);
      return {
        message: 'Désolé, je rencontre un problème technique. Pouvez-vous réessayer ?',
        tokenCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Construit le prompt système avec le contexte utilisateur
   */
  private buildSystemPrompt(context: ConversationContext): string {
    const { userProfile, dailyEntries, currentStreak, cigarettesAvoided, moneySaved } = context;
    
    const entriesCount = Object.keys(dailyEntries).length;
    const recentEntries = Object.entries(dailyEntries)
      .slice(-3) // 3 dernières entrées
      .map(([date, entry]) => `${date}: ${entry.realCigs} cigarettes`)
      .join(', ');

    return `Tu es un coach spécialisé dans l'arrêt du tabac, bienveillant et motivant. Tu accompagnes les personnes dans leur parcours d'arrêt du tabac.

CONTEXTE UTILISATEUR:
- Âge: ${userProfile.age || 'Non spécifié'} ans
- Ancien fumeur: ${userProfile.cigsPerDay} cigarettes/jour pendant ${userProfile.smokingYears || userProfile.startedSmokingYears} ans
- Objectif: ${userProfile.objectiveType === 'complete' ? 'Arrêt complet' : 'Réduction progressive'}
- Motivation principale: ${userProfile.mainMotivation || 'Non spécifié'}
- Déclencheurs identifiés: ${userProfile.smokingTriggers?.join(', ') || 'Non spécifiés'}
- Niveau de stress: ${userProfile.stressLevel || 'Non spécifié'}/10
- Tentatives précédentes: ${userProfile.previousAttempts || 'Non spécifié'}

PROGRESSION ACTUELLE:
- Série en cours: ${currentStreak} jour${currentStreak > 1 ? 's' : ''}
- Cigarettes évitées: ${cigarettesAvoided}
- Argent économisé: ${moneySaved.toFixed(1)}€
- Entrées enregistrées: ${entriesCount} jour${entriesCount > 1 ? 's' : ''}
- Dernières entrées: ${recentEntries || 'Aucune'}

TON RÔLE:
- Sois encourageant et positif
- Donne des conseils pratiques et personnalisés
- Adapte tes réponses au profil et à la progression de l'utilisateur
- Utilise des techniques de motivation et de gestion des envies
- Reste concis (max 200 mots par réponse)
- Évite les conseils médicaux, oriente vers un professionnel si nécessaire

STYLE DE COMMUNICATION:
- Ton amical et professionnel
- Utilise des emojis avec modération
- Sois empathique face aux difficultés
- Célèbre les victoires, même petites
- Propose des alternatives concrètes aux envies`;
  }

  /**
   * Construit le prompt de conversation avec l'historique
   */
  private buildConversationPrompt(history: ChatMessage[], currentMessage: string): string {
    let prompt = '';
    
    // Ajouter l'historique récent (max 6 messages pour éviter de dépasser les limites)
    const recentHistory = history.slice(-6);
    
    recentHistory.forEach(msg => {
      if (msg.isUser) {
        prompt += `Utilisateur: ${msg.content}\n`;
      } else {
        prompt += `Coach: ${msg.content}\n`;
      }
    });
    
    // Ajouter le message actuel
    prompt += `Utilisateur: ${currentMessage}\n`;
    prompt += `Coach:`;
    
    return prompt;
  }

  /**
   * Génère une réponse de bienvenue personnalisée
   */
  generateWelcomeMessage(context: ConversationContext): string {
    const { userProfile, currentStreak } = context;
    
    if (currentStreak === 0) {
      return `Salut ! 👋 Je suis ton coach IA pour t'accompagner dans l'arrêt du tabac. Je vois que tu commences ton parcours - c'est fantastique ! 💪 

Comment te sens-tu aujourd'hui ? As-tu des questions ou des préoccupations particulières ?`;
    } else if (currentStreak < 7) {
      return `Bravo ! 🎉 Tu es déjà à ${currentStreak} jour${currentStreak > 1 ? 's' : ''} sans fumer ! C'est un excellent début.

Comment ça se passe ? As-tu rencontré des difficultés ou des moments de tentation ?`;
    } else if (currentStreak < 30) {
      return `Impressionnant ! 🌟 ${currentStreak} jour${currentStreak > 1 ? 's' : ''} de série, c'est formidable ! Tu es en train de créer de nouvelles habitudes.

Comment te sens-tu dans cette phase ? Y a-t-il des défis particuliers ?`;
    } else {
      return `Extraordinaire ! 🏆 ${currentStreak} jour${currentStreak > 1 ? 's' : ''} sans fumer, tu es un vrai champion ! 

Comment puis-je t'aider à maintenir cette excellente progression ?`;
    }
  }

  /**
   * Génère des suggestions de messages selon le contexte
   */
  generateMessageSuggestions(context: ConversationContext): string[] {
    const { currentStreak, userProfile } = context;
    
    if (currentStreak === 0) {
      return [
        "J'ai envie de fumer, que faire ?",
        "Comment gérer le stress sans cigarette ?",
        "Je me sens anxieux, des conseils ?"
      ];
    } else if (currentStreak < 7) {
      return [
        "J'ai une forte envie, comment résister ?",
        "Comment gérer les symptômes de sevrage ?",
        "Je me sens irritable, c'est normal ?"
      ];
    } else {
      return [
        "Comment éviter la rechute ?",
        "Je me sens mieux, c'est normal ?",
        "Des conseils pour les situations sociales ?"
      ];
    }
  }
}

// Instance singleton
export const aiCoachService = new AICoachService();
