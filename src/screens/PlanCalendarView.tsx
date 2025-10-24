import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PlanContent, PlanDay } from '../data/planContent';

interface PlanCalendarViewProps {
  planContent: PlanContent;
  currentDay: number;
  onBack: () => void;
  onDaySelect: (day: PlanDay) => void;
}

const { width } = Dimensions.get('window');

export default function PlanCalendarView({
  planContent,
  currentDay,
  onBack,
  onDaySelect,
}: PlanCalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const handleDayPress = (day: PlanDay) => {
    if (day.jour <= currentDay) {
      setSelectedDay(day.jour);
      onDaySelect(day);
    }
  };

  const getDayStatus = (dayNumber: number) => {
    if (dayNumber < currentDay) return 'completed';
    if (dayNumber === currentDay) return 'current';
    return 'future';
  };

  const getDayStyle = (dayNumber: number) => {
    const status = getDayStatus(dayNumber);
    switch (status) {
      case 'completed':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10B981',
          opacity: 1,
        };
      case 'current':
        return {
          backgroundColor: 'rgba(255, 215, 0, 0.2)',
          borderColor: '#FFD700',
          opacity: 1,
        };
      case 'future':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          opacity: 0.5,
        };
    }
  };

  const getDayTextColor = (dayNumber: number) => {
    const status = getDayStatus(dayNumber);
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'current':
        return '#FFD700';
      case 'future':
        return '#64748B';
    }
  };

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendrier du Plan</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Titre du plan */}
        <View style={styles.planTitleContainer}>
          <Text style={styles.planTitle}>{planContent.titre}</Text>
          <Text style={styles.planSubtitle}>
            {planContent.jours.length} jours de parcours personnalisé
          </Text>
        </View>

        {/* Légende */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Jour terminé</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
            <Text style={styles.legendText}>Jour actuel</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#64748B' }]} />
            <Text style={styles.legendText}>Jour futur</Text>
          </View>
        </View>

        {/* Grille des jours */}
        <View style={styles.calendarGrid}>
          {planContent.jours.map((day) => (
            <TouchableOpacity
              key={day.jour}
              style={[
                styles.dayCard,
                getDayStyle(day.jour),
                selectedDay === day.jour && styles.selectedDay,
              ]}
              onPress={() => handleDayPress(day)}
              disabled={day.jour > currentDay}
            >
              <Text style={[styles.dayNumber, { color: getDayTextColor(day.jour) }]}>
                {day.jour}
              </Text>
              <Text style={[styles.dayName, { color: getDayTextColor(day.jour) }]}>
                {day.nom}
              </Text>
              <Text style={[styles.dayObjective, { color: getDayTextColor(day.jour) }]}>
                {day.objectif}
              </Text>
              
              {day.jour <= currentDay && (
                <View style={styles.statusIcon}>
                  {day.jour < currentDay ? (
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  ) : (
                    <Ionicons name="star" size={20} color="#FFD700" />
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Statistiques du plan */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Vos progrès</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentDay}</Text>
              <Text style={styles.statLabel}>Jours accomplis</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{planContent.jours.length}</Text>
              <Text style={styles.statLabel}>Total du plan</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.round((currentDay / planContent.jours.length) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Progression</Text>
            </View>
          </View>
        </View>

        {/* Message d'encouragement */}
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            {currentDay === 0
              ? 'Prêt à commencer votre parcours ?'
              : currentDay < planContent.jours.length
              ? 'Continuez votre parcours, vous êtes sur la bonne voie !'
              : 'Félicitations ! Vous avez terminé votre plan de sevrage !'}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  placeholder: {
    width: 44,
  },
  planTitleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 10,
  },
  planSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#E2E8F0',
    fontSize: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  dayCard: {
    width: (width - 60) / 2,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    position: 'relative',
  },
  selectedDay: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  dayObjective: {
    fontSize: 12,
    lineHeight: 16,
  },
  statusIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  encouragementContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  encouragementText: {
    color: '#FFD700',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
