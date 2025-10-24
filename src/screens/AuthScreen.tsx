import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import StarryBackground from '../components/StarryBackground';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const result = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (result.error) {
        Alert.alert('Erreur', result.error.message);
      } else if (result.user) {
        if (isSignUp) {
          Alert.alert(
            'Succès',
            'Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.',
            [{ text: 'OK', onPress: onAuthSuccess }]
          );
        } else {
          onAuthSuccess();
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarryBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Étoiles décoratives */}
          <View style={styles.starsContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={[styles.star, styles.star2]}>✨</Text>
            <Text style={[styles.star, styles.star3]}>🌟</Text>
            <Text style={[styles.star, styles.star4]}>⭐</Text>
            <Text style={[styles.star, styles.star5]}>✨</Text>
            <Text style={[styles.star, styles.star6]}>🌟</Text>
            <Text style={[styles.star, styles.star7]}>⭐</Text>
            <Text style={[styles.star, styles.star8]}>✨</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>🌱 MyQuitSpace</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Créez votre compte' : 'Connectez-vous'}
            </Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              {isSignUp && (
                <TextInput
                  style={styles.input}
                  placeholder="Confirmer le mot de passe"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleAuth}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Chargement...' : (isSignUp ? 'Créer le compte' : 'Se connecter')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsSignUp(!isSignUp)}
              >
                <Text style={styles.switchButtonText}>
                  {isSignUp 
                    ? 'Déjà un compte ? Se connecter' 
                    : 'Pas de compte ? Créer un compte'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  star: {
    position: 'absolute',
    fontSize: 20,
    opacity: 0.8,
  },
  star2: {
    top: '15%',
    left: '20%',
    fontSize: 16,
  },
  star3: {
    top: '25%',
    right: '15%',
    fontSize: 24,
  },
  star4: {
    top: '40%',
    left: '10%',
    fontSize: 18,
  },
  star5: {
    top: '60%',
    right: '25%',
    fontSize: 22,
  },
  star6: {
    top: '75%',
    left: '30%',
    fontSize: 16,
  },
  star7: {
    top: '85%',
    right: '10%',
    fontSize: 20,
  },
  star8: {
    top: '10%',
    left: '60%',
    fontSize: 14,
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 40,
    opacity: 0.9,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  button: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
  },
  switchButtonText: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
