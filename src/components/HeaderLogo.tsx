import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface HeaderLogoProps {
  title: string;
  showLogo?: boolean;
}

export default function HeaderLogo({ title, showLogo = true }: HeaderLogoProps) {
  return (
    <View style={styles.container}>
      {showLogo && (
        <Image 
          source={require('../../assets/cigarette-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 20,
    height: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
