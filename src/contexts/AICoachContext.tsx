import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMessage, ConversationContext, aiCoachService } from '../lib/aiCoachService';
import { UserProfile, DailyEntry, StreakData } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface AICoachContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearConversation: () => void;
  messageSuggestions: string[];
  welcomeMessage: string;
  error: string | null;
}

const AICoachContext = createContext<AICoachContextType | undefined>(undefined);

interface AICoachProviderProps {
  children: ReactNode;
}

export const AICoachProvider: React.FC<AICoachProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [messageSuggestions, setMessageSuggestions] = useState<string[]>([]);

  // Charger le contexte utilisateur et initialiser la conversation
  useEffect(() => {
    if (user) {
      loadUserContext();
    }
  }, [user]);

  // Charger les messages depuis Supabase
  useEffect(() => {
    if (user) {
      loadConversationHistory();
    }
  }, [user]);

  const loadUserContext = async () => {
    try {
      // Charger le profil utilisateur depuis Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.email) // Utiliser l'email comme ID
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ AICoach Context - Profile Error:', profileError.message);
        return;
      }

      // Charger les entrées quotidiennes
      const { data: entriesData, error: entriesError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user?.email); // Utiliser l'email comme ID

      if (entriesError) {
        console.error('❌ AICoach Context - Entries Error:', entriesError.message);
        return;
      }

      // Charger les statistiques de streak
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user?.email) // Utiliser l'email comme ID
        .single();

      if (streakError && streakError.code !== 'PGRST116') {
        console.error('❌ AICoach Context - Streak Error:', streakError.message);
        return;
      }

      // Construire le contexte
      const profile: UserProfile = profileData || {
        startedSmokingYears: 0,
        cigsPerDay: 20,
        objectiveType: 'complete',
        reductionFrequency: 1,
        onboardingCompleted: false,
      };

      const dailyEntries: Record<string, DailyEntry> = {};
      entriesData?.forEach(entry => {
        dailyEntries[entry.date] = {
          realCigs: entry.real_cigs,
          goalCigs: entry.goal_cigs,
          date: entry.date,
          emotion: entry.emotion,
          objectiveMet: entry.objective_met,
          connectedOnDate: entry.connected_on_date,
        };
      });

      const streak: StreakData = streakData || {
        lastDateConnected: '',
        currentStreak: 0,
      };

      // Calculer les statistiques
      const cigarettesAvoided = calculateCigarettesAvoided(profile, dailyEntries);
      const moneySaved = cigarettesAvoided * 0.6; // Prix moyen par cigarette

      const context: ConversationContext = {
        userProfile: profile,
        dailyEntries,
        currentStreak: streak.currentStreak,
        cigarettesAvoided,
        moneySaved,
      };

      setConversationContext(context);

      // Générer le message de bienvenue et les suggestions
      const welcome = aiCoachService.generateWelcomeMessage(context);
      const suggestions = aiCoachService.generateMessageSuggestions(context);
      
      setWelcomeMessage(welcome);
      setMessageSuggestions(suggestions);

      // Ajouter le message de bienvenue si c'est la première conversation
      if (messages.length === 0) {
        const welcomeMsg: ChatMessage = {
          id: 'welcome-' + Date.now(),
          content: welcome,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([welcomeMsg]);
      }

    } catch (error) {
      console.error('❌ AICoach Context - Load Error:', error);
      setError('Erreur lors du chargement des données utilisateur');
    }
  };

  const loadConversationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_coach_conversations')
        .select('*')
        .eq('user_id', user?.email) // Utiliser l'email comme ID
        .order('created_at', { ascending: true })
        .limit(50); // Limiter à 50 messages récents

      if (error) {
        console.error('❌ AICoach Context - History Error:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const chatMessages: ChatMessage[] = data.map(conv => ({
          id: conv.id,
          content: conv.message,
          isUser: true,
          timestamp: new Date(conv.created_at),
        }));

        // Ajouter les réponses du coach
        const responses: ChatMessage[] = data.map(conv => ({
          id: conv.id + '-response',
          content: conv.response,
          isUser: false,
          timestamp: new Date(conv.created_at),
        }));

        // Intercaler les messages utilisateur et réponses
        const allMessages: ChatMessage[] = [];
        for (let i = 0; i < chatMessages.length; i++) {
          allMessages.push(chatMessages[i]);
          if (responses[i]) {
            allMessages.push(responses[i]);
          }
        }

        setMessages(allMessages);
      }
    } catch (error) {
      console.error('❌ AICoach Context - History Load Error:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!conversationContext || !user) {
      setError('Contexte utilisateur non disponible');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Ajouter le message utilisateur
      const userMessage: ChatMessage = {
        id: 'user-' + Date.now(),
        content: message,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Obtenir la réponse du coach IA
      const response = await aiCoachService.sendMessage(
        message,
        conversationContext,
        messages
      );

      if (response.success) {
        // Ajouter la réponse du coach
        const coachMessage: ChatMessage = {
          id: 'coach-' + Date.now(),
          content: response.message,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, coachMessage]);

        // Sauvegarder la conversation dans Supabase
        await saveConversationToSupabase(message, response.message);
      } else {
        setError(response.error || 'Erreur lors de la génération de la réponse');
      }

    } catch (error) {
      console.error('❌ AICoach Context - Send Message Error:', error);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversationToSupabase = async (userMessage: string, coachResponse: string) => {
    try {
      const { error } = await supabase
        .from('ai_coach_conversations')
        .insert({
          user_id: user?.email, // Utiliser l'email comme ID
          message: userMessage,
          response: coachResponse,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ AICoach Context - Save Error:', error.message);
      }
    } catch (error) {
      console.error('❌ AICoach Context - Save Conversation Error:', error);
    }
  };

  const clearConversation = async () => {
    try {
      // Supprimer l'historique de Supabase
      if (user) {
        const { error } = await supabase
          .from('ai_coach_conversations')
          .delete()
          .eq('user_id', user.email); // Utiliser l'email comme ID

        if (error) {
          console.error('❌ AICoach Context - Delete Error:', error.message);
        }
      }

      // Réinitialiser les messages locaux
      setMessages([]);
      setError(null);

      // Régénérer le message de bienvenue
      if (conversationContext) {
        const welcome = aiCoachService.generateWelcomeMessage(conversationContext);
        const welcomeMsg: ChatMessage = {
          id: 'welcome-' + Date.now(),
          content: welcome,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([welcomeMsg]);
      }

    } catch (error) {
      console.error('❌ AICoach Context - Clear Error:', error);
    }
  };

  // Fonction utilitaire pour calculer les cigarettes évitées
  const calculateCigarettesAvoided = (profile: UserProfile, entries: Record<string, DailyEntry>): number => {
    let totalAvoided = 0;
    Object.values(entries).forEach(entry => {
      const avoided = Math.max(0, profile.cigsPerDay - entry.realCigs);
      totalAvoided += avoided;
    });
    return totalAvoided;
  };

  const value: AICoachContextType = {
    messages,
    isLoading,
    sendMessage,
    clearConversation,
    messageSuggestions,
    welcomeMessage,
    error,
  };

  return (
    <AICoachContext.Provider value={value}>
      {children}
    </AICoachContext.Provider>
  );
};

export const useAICoach = (): AICoachContextType => {
  const context = useContext(AICoachContext);
  if (context === undefined) {
    throw new Error('useAICoach must be used within an AICoachProvider');
  }
  return context;
};
