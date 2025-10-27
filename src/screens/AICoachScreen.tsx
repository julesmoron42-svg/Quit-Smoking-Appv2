import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatMessageComponent from '../components/ChatMessageComponent';
import { useAICoach } from '../contexts/AICoachContext';
import { useSubscription } from '../contexts/SubscriptionContextMock';
import { HapticService } from '../lib/hapticService';

const { height } = Dimensions.get('window');

interface AICoachScreenProps {
  onClose: () => void;
}

export default function AICoachScreen({ onClose }: AICoachScreenProps) {
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearConversation, 
    messageSuggestions, 
    error 
  } = useAICoach();
  
  const { isPremium } = useSubscription();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const message = inputText.trim();
    setInputText('');

    // Vérifier si l'utilisateur est premium
    if (!isPremium) {
      Alert.alert(
        'Fonctionnalité Premium',
        'Le coach IA est disponible avec l\'abonnement Premium. Voulez-vous vous abonner ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Voir les offres', onPress: () => onClose() }
        ]
      );
      return;
    }

    await HapticService.subtle();
    await sendMessage(message);
  };

  const handleSuggestionPress = async (suggestion: string) => {
    setInputText(suggestion);
    await HapticService.subtle();
  };

  const handleClearConversation = () => {
    Alert.alert(
      'Effacer la conversation',
      'Êtes-vous sûr de vouloir effacer toute la conversation ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await HapticService.warning();
            await clearConversation();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.fullScreenContainer}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🤖 Coach IA</Text>
            <Text style={styles.headerSubtitle}>
              {isPremium ? 'Disponible 24/7' : 'Premium requis'}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearConversation}
          >
            <Ionicons name="trash-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <ChatMessageComponent 
              key={message.id} 
              message={message}
              isTyping={isLoading && !message.isUser && message.id === messages[messages.length - 1]?.id}
            />
          ))}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ChatMessageComponent 
                message={{
                  id: 'typing',
                  content: '',
                  isUser: false,
                  timestamp: new Date(),
                }}
                isTyping={true}
              />
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Suggestions de messages */}
        {messageSuggestions.length > 0 && messages.length <= 2 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>💡 Suggestions :</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsContent}
            >
              {messageSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isPremium ? "Tapez votre message..." : "Abonnement Premium requis"}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              maxLength={500}
              editable={isPremium}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || !isPremium) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || !isPremium || isLoading}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={(!inputText.trim() || !isPremium) ? "rgba(255, 255, 255, 0.3)" : "#FFFFFF"} 
              />
            </TouchableOpacity>
          </View>
          
          {!isPremium && (
            <View style={styles.premiumPrompt}>
              <Text style={styles.premiumPromptText}>
                🔒 Le coach IA est disponible avec l'abonnement Premium
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    marginVertical: 4,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  suggestionsTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionsContent: {
    paddingRight: 16,
  },
  suggestionButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  premiumPrompt: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  premiumPromptText: {
    color: '#FF9800',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
