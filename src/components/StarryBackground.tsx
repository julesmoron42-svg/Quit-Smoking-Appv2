import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StarryBackgroundProps {
  children: React.ReactNode;
}

export default function StarryBackground({ children }: StarryBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* Ciel étoilé en arrière-plan */}
      <View style={styles.starryBackground}>
        {/* Étoiles statiques - plus petites */}
        <View style={[styles.star, styles.star1]} />
        <View style={[styles.star, styles.star2]} />
        <View style={[styles.star, styles.star3]} />
        <View style={[styles.star, styles.star4]} />
        <View style={[styles.star, styles.star5]} />
        <View style={[styles.star, styles.star6]} />
        <View style={[styles.star, styles.star7]} />
        <View style={[styles.star, styles.star8]} />
        <View style={[styles.star, styles.star9]} />
        <View style={[styles.star, styles.star10]} />
        <View style={[styles.star, styles.star11]} />
        <View style={[styles.star, styles.star12]} />
        <View style={[styles.star, styles.star13]} />
        <View style={[styles.star, styles.star14]} />
        <View style={[styles.star, styles.star15]} />
        <View style={[styles.star, styles.star16]} />
        <View style={[styles.star, styles.star17]} />
        <View style={[styles.star, styles.star18]} />
        <View style={[styles.star, styles.star19]} />
        <View style={[styles.star, styles.star20]} />
        <View style={[styles.star, styles.star21]} />
        <View style={[styles.star, styles.star22]} />
        <View style={[styles.star, styles.star23]} />
        <View style={[styles.star, styles.star24]} />
        <View style={[styles.star, styles.star25]} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  starryBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0a',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 0.5,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 1,
    elevation: 1,
  },
  // Étoiles plus petites et plus nombreuses
  star1: { top: '8%', left: '12%', width: 1, height: 1 },
  star2: { top: '15%', left: '85%', width: 0.5, height: 0.5 },
  star3: { top: '25%', left: '18%', width: 1, height: 1 },
  star4: { top: '35%', left: '75%', width: 0.5, height: 0.5 },
  star5: { top: '45%', left: '8%', width: 1, height: 1 },
  star6: { top: '55%', left: '88%', width: 0.5, height: 0.5 },
  star7: { top: '65%', left: '22%', width: 1, height: 1 },
  star8: { top: '75%', left: '82%', width: 0.5, height: 0.5 },
  star9: { top: '12%', left: '45%', width: 0.5, height: 0.5 },
  star10: { top: '28%', left: '38%', width: 1, height: 1 },
  star11: { top: '48%', left: '58%', width: 0.5, height: 0.5 },
  star12: { top: '68%', left: '42%', width: 1, height: 1 },
  star13: { top: '18%', left: '28%', width: 0.5, height: 0.5 },
  star14: { top: '58%', left: '92%', width: 1, height: 1 },
  star15: { top: '82%', left: '6%', width: 0.5, height: 0.5 },
  star16: { top: '5%', left: '65%', width: 0.5, height: 0.5 },
  star17: { top: '38%', left: '95%', width: 1, height: 1 },
  star18: { top: '72%', left: '15%', width: 0.5, height: 0.5 },
  star19: { top: '32%', left: '52%', width: 1, height: 1 },
  star20: { top: '62%', left: '68%', width: 0.5, height: 0.5 },
  star21: { top: '22%', left: '78%', width: 0.5, height: 0.5 },
  star22: { top: '52%', left: '32%', width: 1, height: 1 },
  star23: { top: '78%', left: '48%', width: 0.5, height: 0.5 },
  star24: { top: '42%', left: '12%', width: 0.5, height: 0.5 },
  star25: { top: '88%', left: '72%', width: 1, height: 1 },
});

