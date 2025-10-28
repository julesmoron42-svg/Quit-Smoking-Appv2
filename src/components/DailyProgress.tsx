import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DailyEntry, UserProfile } from '../types';
import { getProgressiveGoalByDate } from '../utils/calculations';

interface DailyProgressProps {
  dailyEntries: Record<string, DailyEntry>;
  profile: UserProfile;
  onDayPress: (dayIndex: number) => void;
}

const DailyProgress = memo(({ dailyEntries, profile, onDayPress }: DailyProgressProps) => {
  const getSevenDaysData = () => {
    const days = [];
    const today = new Date();
    const entryDates = Object.keys(dailyEntries).sort();
    const startDate = entryDates.length > 0 ? entryDates[0] : today.toISOString().split('T')[0];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const entry = dailyEntries[dateString];
      
      let goalCigs;
      if (entry && entry.goalCigs !== undefined) {
        goalCigs = entry.goalCigs;
      } else {
        goalCigs = profile.objectiveType === 'complete' 
          ? 0 
          : getProgressiveGoalByDate(profile, dateString, startDate);
      }
      
      days.push({
        date: dateString,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNumber: date.getDate(),
        entry,
        isToday: dateString === new Date().toISOString().split('T')[0],
        goalCigs,
      });
    }
    return days;
  };

  const days = getSevenDaysData();

  return (
    <View style={styles.container}>
      <View style={styles.daysLabels}>
        {days.map((day, index) => (
          <View key={index} style={styles.dayLabelContainer}>
            <Text style={styles.dayLabel}>{day.dayName}</Text>
            <Text style={styles.dayDate}>{day.dayNumber}/{new Date(day.date).getMonth() + 1}</Text>
          </View>
        ))}
      </View>
      <View style={styles.daysIndicators}>
        {days.map((day, index) => {
          const hasEntry = day.entry !== undefined;
          const objectiveMet = day.entry?.objectiveMet || false;
          const realCigs = day.entry?.realCigs || 0;
          const goalCigs = day.goalCigs;
          const progress = goalCigs > 0 ? Math.min(realCigs / goalCigs, 1) : 0;
          const isOverGoal = realCigs > goalCigs;
          
          return (
            <View key={index} style={styles.dayContainer}>
              <TouchableOpacity
                style={[
                  styles.dayIndicator,
                  hasEntry && {
                    backgroundColor: objectiveMet ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    borderColor: objectiveMet ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)',
                  }
                ]}
                onPress={() => onDayPress(index)}
              >
                {hasEntry ? (
                  <Text style={[
                    styles.dayIndicatorIcon,
                    { color: objectiveMet ? '#10B981' : '#EF4444' }
                  ]}>
                    {objectiveMet ? '✓' : '✗'}
                  </Text>
                ) : (
                  <View style={styles.dayIndicatorInner} />
                )}
              </TouchableOpacity>
              
              {hasEntry && (
                <View style={styles.dayProgressContainer}>
                  <View style={styles.dayProgressBar}>
                    <View 
                      style={[
                        styles.dayProgressFill, 
                        { 
                          width: `${Math.min(progress * 100, 100)}%`,
                          backgroundColor: isOverGoal ? '#EF4444' : '#10B981'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.dayProgressText}>
                    {realCigs}/{goalCigs}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
});

DailyProgress.displayName = 'DailyProgress';

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  daysLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  dayLabelContainer: {
    alignItems: 'center',
  },
  dayLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  dayDate: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.6,
    marginTop: 2,
  },
  daysIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 5,
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dayIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 69, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(139, 69, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayIndicatorInner: {
    width: 20,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  dayIndicatorIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dayProgressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  dayProgressBar: {
    width: 30,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  dayProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  dayProgressText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
});

export default DailyProgress;
