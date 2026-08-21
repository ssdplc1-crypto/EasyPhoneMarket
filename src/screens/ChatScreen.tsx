import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList, Message } from '../types';
import { COLORS } from '../constants';
import { useApp } from '../context/AppContext';
import { sendMessage, subscribeToMessages } from '../services/api';
import { isApiConfigured } from '../services/api';

type Route = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { user, language } = useApp();
  const { chatId, phoneTitle, otherUserName } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Mock messages for demo
  useEffect(() => {
    if (!isApiConfigured) {
      setMessages([
        {
          id: 'm1',
          chatId,
          senderId: 'other',
          text: language === 'ha' ? 'Sannu, wayar tana nan' : 'Hello, the phone is available',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          read: true,
        },
        {
          id: 'm2',
          chatId,
          senderId: user?.id || 'me',
          text: language === 'ha' ? 'Yaya farashin?' : 'What is the final price?',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          read: true,
        },
      ]);
      return;
    }

    const unsubscribe = subscribeToMessages(chatId, setMessages);
    return unsubscribe;
  }, [chatId]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;

    const newMsg: Message = {
      id: 'm_' + Date.now(),
      chatId,
      senderId: user.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setText('');

    try {
      await sendMessage(chatId, user.id, text.trim());
    } catch (e) {
      console.log('Send error (mock mode ok)', e);
    }

    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        <Text style={[styles.msgText, isMe && styles.myMsgText]}>{item.text}</Text>
        <Text style={[styles.time, isMe && styles.myTime]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.adminAvatar}><Text style={styles.adminAvatarText}>F</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName} numberOfLines={1}>{otherUserName}</Text>
          <Text style={styles.online}>● Online · {phoneTitle}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={10}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={language === 'ha' ? 'Rubuta saƙo...' : 'Type a message...'}
            placeholderTextColor={COLORS.gray}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: COLORS.black,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },
  online: { fontSize: 11, color: '#16A34A', marginTop: 2 },
  adminAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  adminAvatarText: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  messages: {
    padding: 16,
    paddingBottom: 8,
  },
  bubble: {
    maxWidth: '78%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 15,
    color: COLORS.black,
    lineHeight: 20,
  },
  myMsgText: {
    color: COLORS.white,
  },
  time: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: COLORS.black,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendText: {
    color: COLORS.white,
    fontSize: 18,
  },
});
