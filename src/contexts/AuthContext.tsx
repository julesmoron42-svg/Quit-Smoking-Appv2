import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { clearLocalDataOnUserChange, syncAllDataWithUser, loadAllDataFromSupabase, sessionStorage } from '../lib/storage';
import { notificationService } from '../lib/notificationService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: { message: string; status?: number } | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: { message: string; status?: number } | null }>;
  signOut: () => Promise<{ error: { message: string; status?: number } | null }>;
  resetPassword: (email: string) => Promise<{ error: { message: string; status?: number } | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialiser le service de notifications
  useEffect(() => {
    notificationService.initialize();
  }, []);

  useEffect(() => {
    // Fonction pour récupérer la session avec retry
    const getSessionWithRetry = async (retryCount = 0) => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Si pas de session et qu'on est en production, essayer de récupérer depuis AsyncStorage
        if (!session && !__DEV__ && retryCount === 0) {
          setTimeout(() => getSessionWithRetry(1), 1000);
          return;
        }
        
        // Si un utilisateur est connecté, charger les données depuis Supabase
        if (session?.user) {
          // Utiliser le chargement forcé pour s'assurer que les données sont bien chargées
          setTimeout(async () => {
            try {
              const { forceLoadAllDataFromSupabase, dailyEntriesStorage } = await import('../lib/storage');
              await forceLoadAllDataFromSupabase();
              
              // Initialiser la synchronisation en arrière-plan des entrées en attente
              await dailyEntriesStorage.syncPendingEntriesInBackground();
            } catch (error) {
              console.error('Erreur chargement:', error);
            }
          }, 1000); // Délai de 1 seconde pour éviter les conflits
        }
      } catch (error) {
        if (retryCount === 0) {
          // Retry une fois après 2 secondes
          setTimeout(() => getSessionWithRetry(1), 2000);
        } else {
          setLoading(false);
        }
      }
    };
    
    // Lancer la récupération de session
    getSessionWithRetry();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const previousUser = user;
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Gérer les changements d'authentification
      if (event === 'SIGNED_IN' && session?.user) {
        // Vérifier si c'est un changement d'utilisateur
        if (previousUser && previousUser.email !== session.user.email) {
          // Le chrono sera automatiquement réinitialisé par clearLocalDataOnUserChange
          // qui est appelé lors de la déconnexion précédente
        }
        
        // Demander l'autorisation pour les notifications lors de la première connexion
        // (seulement si l'utilisateur n'a pas encore d'autorisation)
        const hasPermission = await notificationService.checkPermission();
        if (!hasPermission) {
          // Délai de 2 secondes pour laisser le temps à l'interface de se charger
          setTimeout(async () => {
            await notificationService.requestPermission();
          }, 2000);
        }
        
        // Utilisateur connecté - charger les données depuis Supabase et initialiser la sync en arrière-plan
        setTimeout(async () => {
          try {
            const { forceLoadAllDataFromSupabase, dailyEntriesStorage } = await import('../lib/storage');
            await forceLoadAllDataFromSupabase();
            
            // Initialiser la synchronisation en arrière-plan des entrées en attente
            await dailyEntriesStorage.syncPendingEntriesInBackground();
          } catch (error) {
            console.error('Erreur chargement après connexion:', error);
          }
        }, 1000);
      } else if (event === 'SIGNED_OUT' || (previousUser && !session?.user)) {
        // Utilisateur déconnecté - nettoyer les données locales (chrono préservé)
        await clearLocalDataOnUserChange();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token rafraîchi - charger les données depuis Supabase
        // console.log('📥 Token rafraîchi, chargement des données depuis Supabase...');
        // TEMPORAIREMENT DÉSACTIVÉ POUR ÉVITER LE SPAM
        // await loadAllDataFromSupabase();
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Suppression de [user] pour éviter la boucle infinie

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'myquitzone://auth/callback'
        }
      });

      if (error) {
        return { user: null, error: { message: error.message, status: error.status } };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: { message: 'Une erreur inattendue s\'est produite' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: { message: error.message, status: error.status } };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: { message: 'Une erreur inattendue s\'est produite' } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Nettoyer explicitement le stockage local
      try {
        await AsyncStorage.removeItem('sb-hdaqsjulitpzckaphujg-auth-token');
        await AsyncStorage.removeItem('@MyQuitZone:session');
      } catch (storageError) {
        // Erreur silencieuse lors du nettoyage
      }
      
      return { error: error ? { message: error.message, status: error.status } : null };
    } catch (error) {
      return { error: { message: 'Une erreur inattendue s\'est produite' } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myquitzone://auth/reset-password'
      });
      return { error: error ? { message: error.message, status: error.status } : null };
    } catch (error) {
      return { error: { message: 'Une erreur inattendue s\'est produite' } };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
