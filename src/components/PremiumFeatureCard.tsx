import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PremiumFeature } from '../types/subscription';

const { width } = Dimensions.get('window');

interface PremiumFeatureCardProps {
  feature: PremiumFeature;
  isPremium: boolean;
  onPress: () => void;
}

export default function PremiumFeatureCard({ feature, isPremium, onPress }: PremiumFeatureCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, !isPremium && styles.lockedCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{feature.icon}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, !isPremium && styles.lockedText]}>
            {feature.title}
          </Text>
          <Text style={[styles.description, !isPremium && styles.lockedDescription]}>
            {feature.description}
          </Text>
        </View>

        <View style={styles.actionContainer}>
          {!isPremium ? (
            <View style={styles.lockContainer}>
              <Ionicons name="lock-closed" size={20} color="#64748B" />
              <Text style={styles.lockText}>Premium</Text>
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
          )}
        </View>
      </View>

      {/* Overlay pour les fonctionnalités non disponibles */}
      {!isPremium && (
        <View style={styles.overlay}>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Bientôt</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  lockedCard: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  lockedText: {
    color: '#64748B',
  },
  lockedDescription: {
    color: '#64748B',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockContainer: {
    alignItems: 'center',
  },
  lockText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  comingSoonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
