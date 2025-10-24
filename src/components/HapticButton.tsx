import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Text, StyleSheet } from 'react-native';
import { HapticService } from '../lib/hapticService';

interface HapticButtonProps extends TouchableOpacityProps {
  title: string;
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error' | 'warning';
  onPress?: () => void;
  style?: any;
  textStyle?: any;
}

/**
 * Bouton avec retour haptique personnalisable
 */
export const HapticButton: React.FC<HapticButtonProps> = ({
  title,
  hapticType = 'medium',
  onPress,
  style,
  textStyle,
  ...props
}) => {
  const handlePress = () => {
    // Déclencher la vibration selon le type
    switch (hapticType) {
      case 'light':
        HapticService.light();
        break;
      case 'medium':
        HapticService.medium();
        break;
      case 'heavy':
        HapticService.heavy();
        break;
      case 'selection':
        HapticService.selection();
        break;
      case 'success':
        HapticService.success();
        break;
      case 'error':
        HapticService.error();
        break;
      case 'warning':
        HapticService.warning();
        break;
    }

    // Appeler la fonction onPress si fournie
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

/**
 * Bouton de succès avec vibration de succès
 */
export const SuccessButton: React.FC<Omit<HapticButtonProps, 'hapticType'>> = (props) => (
  <HapticButton {...props} hapticType="success" style={[styles.button, styles.successButton, props.style]} />
);

/**
 * Bouton d'erreur avec vibration d'erreur
 */
export const ErrorButton: React.FC<Omit<HapticButtonProps, 'hapticType'>> = (props) => (
  <HapticButton {...props} hapticType="error" style={[styles.button, styles.errorButton, props.style]} />
);

/**
 * Bouton d'avertissement avec vibration d'avertissement
 */
export const WarningButton: React.FC<Omit<HapticButtonProps, 'hapticType'>> = (props) => (
  <HapticButton {...props} hapticType="warning" style={[styles.button, styles.warningButton, props.style]} />
);

const additionalStyles = StyleSheet.create({
  successButton: {
    backgroundColor: '#34C759',
  },
  errorButton: {
    backgroundColor: '#FF3B30',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
});

