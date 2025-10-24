import React, { useState, useEffect, useRef } from 'react';
import { Text, TextProps } from 'react-native';
import { HapticService } from '../lib/hapticService';

interface TypewriterTextProps extends TextProps {
  text: string;
  speed?: number; // Délai entre chaque caractère en ms
  hapticEnabled?: boolean; // Activer les vibrations
  onComplete?: () => void; // Callback quand l'animation est terminée
  onCharacterTyped?: (char: string, index: number) => void; // Callback à chaque caractère
}

/**
 * Composant de texte avec effet machine à écrire et vibrations
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  hapticEnabled = true,
  onComplete,
  onCharacterTyped,
  style,
  ...props
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentIndex < text.length) {
      intervalRef.current = setTimeout(() => {
        const nextChar = text[currentIndex];
        setDisplayedText(prev => prev + nextChar);
        
        // Vibration pour chaque caractère (sauf espaces)
        if (hapticEnabled && nextChar !== ' ') {
          HapticService.typewriter();
        }
        
        // Callback pour chaque caractère
        onCharacterTyped?.(nextChar, currentIndex);
        
        setCurrentIndex(prev => prev + 1);
      }, speed);
    } else {
      // Animation terminée
      onComplete?.();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentIndex, text, speed, hapticEnabled, onComplete, onCharacterTyped]);

  // Reset quand le texte change
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <Text style={style} {...props}>
      {displayedText}
    </Text>
  );
};

/**
 * Hook pour créer un effet machine à écrire personnalisé
 */
export const useTypewriter = (
  text: string,
  speed: number = 50,
  hapticEnabled: boolean = true
) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        const nextChar = text[currentIndex];
        setDisplayedText(prev => prev + nextChar);
        
        // Vibration pour chaque caractère (sauf espaces)
        if (hapticEnabled && nextChar !== ' ') {
          HapticService.typewriter();
        }
        
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed, hapticEnabled]);

  // Reset quand le texte change
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  return {
    displayedText,
    currentIndex,
    isComplete,
    progress: text.length > 0 ? currentIndex / text.length : 0
  };
};

