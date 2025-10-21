import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../contexts/SubscriptionContextMock';
import { PREMIUM_FEATURES, SUBSCRIPTION_PLANS } from '../types/subscription';
import PremiumFeatureCard from '../components/PremiumFeatureCard';

const { width } = Dimensions.get('window');

export default function PremiumTab() {
  const { isPremium, purchaseSubscription, restorePurchases, isLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[2]); // Pack Complet par défaut

  const handlePurchase = async () => {
    try {
      const success = await purchaseSubscription(selectedPlan.productId);
      if (success) {
        console.log('Achat initié avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
    }
  };

  const handleRestore = async () => {
    await restorePurchases();
  };

  const handleFeaturePress = (feature: any) => {
    if (isPremium) {
      Alert.alert(
        'Fonctionnalité disponible',
        `La fonctionnalité "${feature.title}" sera bientôt disponible !`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Fonctionnalité Premium',
        `Cette fonctionnalité est disponible avec l'abonnement Premium. Voulez-vous vous abonner ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'S\'abonner', onPress: handlePurchase }
        ]
      );
    }
  };

  return (
    <LinearGradient
      colors={['#071033', '#1E293B']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🚨 Besoin d'aide ?</Text>
          <Text style={styles.subtitle}>
            {isPremium 
              ? 'Profitez de toutes vos fonctionnalités premium' 
              : 'Débloquez des outils puissants pour vous accompagner'
            }
          </Text>
        </View>

        {/* Statut Premium */}
        <View style={[styles.statusCard, isPremium ? styles.premiumCard : styles.freeCard]}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={isPremium ? 'star' : 'star-outline'} 
              size={24} 
              color={isPremium ? '#FFD700' : '#64748B'} 
            />
            <Text style={[styles.statusText, isPremium ? styles.premiumText : styles.freeText]}>
              {isPremium ? 'Premium Actif' : 'Version Gratuite'}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            {isPremium 
              ? 'Toutes les fonctionnalités premium sont débloquées'
              : 'Débloquez plus de fonctionnalités avec Premium'
            }
          </Text>
        </View>

        {/* Plans Premium */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choisissez votre Pack Premium</Text>
          
          {SUBSCRIPTION_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan.id === plan.id && styles.selectedPlanCard
              ]}
              onPress={() => setSelectedPlan(plan)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>Bientôt</Text>
              </View>
              <Text style={styles.planDescription}>{plan.description}</Text>
              <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <Text key={index} style={styles.planFeature}>
                    • {feature}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fonctionnalités Premium */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Fonctionnalités Disponibles</Text>
          
          {PREMIUM_FEATURES.map((feature) => (
            <PremiumFeatureCard
              key={feature.id}
              feature={feature}
              isPremium={isPremium}
              onPress={() => handleFeaturePress(feature)}
            />
          ))}
        </View>

        {/* Boutons d'action */}
        {!isPremium && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.purchaseButton, isLoading && styles.disabledButton]}
              onPress={handlePurchase}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.purchaseButtonGradient}
              >
                <Text style={styles.purchaseButtonText}>
                  {isLoading ? 'Chargement...' : 'Bientôt disponible'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
            >
              <Text style={styles.restoreButtonText}>Restaurer les achats</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Informations supplémentaires */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Pourquoi Premium ?</Text>
          <Text style={styles.infoText}>
            • Accès immédiat à des outils de crise éprouvés{'\n'}
            • Techniques de relaxation guidées par des experts{'\n'}
            • Support prioritaire pour vous accompagner{'\n'}
            • Nouveautés en avant-première{'\n'}
            • Aucun engagement, résiliation à tout moment
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
  },
  premiumCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  freeCard: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: '#64748B',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  premiumText: {
    color: '#3B82F6',
  },
  freeText: {
    color: '#64748B',
  },
  statusDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  plansSection: {
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  selectedPlanCard: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  planDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 15,
    lineHeight: 20,
  },
  planFeatures: {
    marginTop: 10,
  },
  planFeature: {
    fontSize: 13,
    color: '#E2E8F0',
    marginBottom: 5,
    lineHeight: 18,
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  actionSection: {
    marginBottom: 30,
  },
  purchaseButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  purchaseButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  restoreButton: {
    padding: 15,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  infoSection: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
  },
});
