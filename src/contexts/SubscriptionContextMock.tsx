import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { UserSubscription, SubscriptionContextType } from '../types/subscription';

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

// Version mock 100% compatible Expo Go - aucun module natif
export const SubscriptionProviderMock: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(true); // Activé pour tester le coach IA
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const purchaseSubscription = async (productId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simuler délai d'achat
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler l'achat réussi
      setIsPremium(true);
      setSubscription({
        userId: 'mock_user',
        planId: 'premium_monthly',
        status: 'active',
        startDate: new Date().toISOString(),
        productId: productId,
        transactionId: 'mock_transaction_' + Date.now()
      });
      
      Alert.alert(
        '✅ Achat simulé réussi !',
        'En mode développement, l\'achat est simulé. En production, ceci serait un vrai achat.',
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'achat simulé:', error);
      Alert.alert('Erreur', 'Impossible de procéder à l\'achat simulé.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simuler délai de restauration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'ℹ️ Restauration simulée',
        'En mode développement, aucun achat à restaurer. En production, ceci vérifierait vos achats réels.',
        [{ text: 'OK' }]
      );
      
      return false; // Pas d'achat à restaurer en mode mock
    } catch (error) {
      console.error('Erreur lors de la restauration simulée:', error);
      Alert.alert('Erreur', 'Impossible de restaurer les achats simulés.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscriptionStatus = async (): Promise<void> => {
    // En mode mock, on garde l'état actuel
    console.log('Vérification du statut simulé:', { isPremium, subscription });
  };

  const value: SubscriptionContextType = {
    isPremium,
    subscription,
    isLoading,
    purchaseSubscription,
    restorePurchases,
    checkSubscriptionStatus
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
