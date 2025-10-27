import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { ChatMessage } from '../lib/aiCoachService';

interface ChatMessageComponentProps {
  message: ChatMessage;
  isTyping?: boolean;
}

const { width } = Dimensions.get('window');

export default function ChatMessageComponent({ message, isTyping = false }: ChatMessageComponentProps) {
  const [typingAnimation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (isTyping) {
      const animateTyping = () => {
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isTyping) {
            setTimeout(animateTyping, 1000);
          }
        });
      };
      animateTyping();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping, typingAnimation]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (message.isUser) {
    return (
      <View style={styles.userMessageContainer}>
        <View style={styles.userMessageBubble}>
          <Text style={styles.userMessageText}>{message.content}</Text>
          <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.coachMessageContainer}>
      <View style={styles.coachAvatar}>
        <Text style={styles.coachAvatarText}>🤖</Text>
      </View>
      <View style={styles.coachMessageBubble}>
        {isTyping ? (
          <View style={styles.typingContainer}>
            <Animated.View
              style={[
                styles.typingDot,
                {
                  opacity: typingAnimation,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.typingDot,
                {
                  opacity: typingAnimation,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.typingDot,
                {
                  opacity: typingAnimation,
                },
              ]}
            />
          </View>
        ) : (
          <>
            <Text style={styles.coachMessageText}>{message.content}</Text>
            <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userMessageBubble: {
    backgroundColor: '#8B5CF6',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: width * 0.75,
    borderBottomRightRadius: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  coachMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  coachAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  coachAvatarText: {
    fontSize: 18,
  },
  coachMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: width * 0.7,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  coachMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 2,
  },
});
