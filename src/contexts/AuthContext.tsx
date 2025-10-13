import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { clearLocalDataOnUserChange, syncAllDataWithUser, loadAllDataFromSupabase, sessionStorage } from '../lib/storage';

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

  useEffect(() => {
    // console.log('🔍 AuthContext: Initialisation...');
    
    // Récupérer la session actuelle
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      // console.log('🔍 AuthContext: Session récupérée:', { 
      //   hasSession: !!session, 
      //   hasUser: !!session?.user,
      //   userEmail: session?.user?.email,
      //   error: error?.message 
      // });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Si un utilisateur est connecté, charger les données depuis Supabase
      if (session?.user) {
        console.log('📥 Utilisateur connecté, chargement des données depuis Supabase...');
        // Utiliser le chargement forcé pour s'assurer que les données sont bien chargées
        setTimeout(async () => {
          try {
            const { forceLoadAllDataFromSupabase } = await import('../lib/storage');
            await forceLoadAllDataFromSupabase();
          } catch (error) {
            console.error('Erreur chargement:', error);
          }
        }, 1000); // Délai de 1 seconde pour éviter les conflits
      }
    }).catch(error => {
      console.error('❌ AuthContext: Erreur lors de la récupération de session:', error);
      setLoading(false);
    });

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
          console.log('👤 Changement d\'utilisateur détecté, réinitialisation du chrono');
          await sessionStorage.resetForNewUser();
        }
        
        // Utilisateur connecté - charger les données depuis Supabase
        // console.log('📥 Connexion détectée, chargement des données depuis Supabase...');
        // TEMPORAIREMENT DÉSACTIVÉ POUR ÉVITER LE SPAM
        // await loadAllDataFromSupabase();
      } else if (event === 'SIGNED_OUT' || (previousUser && !session?.user)) {
        // Utilisateur déconnecté - nettoyer les données locales (chrono préservé)
        console.log('🚪 Déconnexion détectée, nettoyage des données locales');
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
      return { error: error ? { message: error.message, status: error.status } : null };
    } catch (error) {
      return { error: { message: 'Une erreur inattendue s\'est produite' } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
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
