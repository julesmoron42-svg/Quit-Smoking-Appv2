import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';

const { width } = Dimensions.get('window');

interface CalendarPickerProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

export default function CalendarPicker({ selectedDate, onDateSelect, onClose }: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  console.log('🗓️ CalendarPicker rendered with selectedDate:', selectedDate);
  
  // Générer les jours du mois
  const generateDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Ajouter les jours vides du début du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    console.log('Generated days:', days);
    return days;
  };

  const formatDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate || !day) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateString = formatDate(year, month, day);
    return selectedDate === dateString;
  };

  const isDatePast = (day: number) => {
    if (!day) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (day: number) => {
    if (!day || isDatePast(day)) return;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateString = formatDate(year, month, day);
    console.log('Date selected:', dateString);
    onDateSelect(dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getMonthName = () => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[currentMonth.getMonth()];
  };

  const days = generateDays();
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayBackground} 
          onPress={onClose}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={styles.container}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Sélectionner la date</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Navigation du mois */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity 
                onPress={() => navigateMonth('prev')}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>
              
              <Text style={styles.monthYear}>
                {getMonthName()} {currentMonth.getFullYear()}
              </Text>
              
              <TouchableOpacity 
                onPress={() => navigateMonth('next')}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Jours de la semaine */}
            <View style={styles.weekDaysContainer}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            {/* Grille du calendrier */}
            <View style={styles.calendarGrid}>
              {days.map((day, index) => {
                if (!day) {
                  return <View key={index} style={styles.emptyDay} />;
                }
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      isDatePast(day) && styles.pastDay,
                      isDateSelected(day) && styles.selectedDay,
                    ]}
                    onPress={() => handleDateSelect(day)}
                    disabled={isDatePast(day)}
                  >
                    <Text style={[
                      styles.dayText,
                      isDatePast(day) && styles.pastDayText,
                      isDateSelected(day) && styles.selectedDayText,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date sélectionnée */}
            {selectedDate && (
              <View style={styles.selectedDateContainer}>
                <Text style={styles.selectedDateLabel}>Date sélectionnée :</Text>
                <Text style={styles.selectedDateText}>
                  {new Date(selectedDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 30,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthYear: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayButton: {
    width: '14.28%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyDay: {
    width: '14.28%',
    height: 45,
    marginBottom: 8,
  },
  pastDay: {
    opacity: 0.3,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  selectedDay: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  pastDayText: {
    color: '#64748B',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedDateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  selectedDateLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 4,
  },
  selectedDateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});