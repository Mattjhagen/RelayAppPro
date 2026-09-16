import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  StatusBar,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme, IconButton } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';

const STORAGE_KEY = 'OPENCODE_SERVER_URL';
const DEFAULT_SERVER_URL = 'https://os.relayapp.pro'; // Your Cloudflare tunnel URL

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? MD3DarkTheme : MD3LightTheme;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '👋 Welcome to OpenCode Mobile! I\'m ready to help you with coding, debugging, and any technical questions you have. What would you like to work on today?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [selectedModel, setSelectedModel] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedUrl = await SecureStore.getItemAsync(STORAGE_KEY);
      if (storedUrl) {
        setServerUrl(storedUrl);
      }
      const storedModel = await SecureStore.getItemAsync(MODEL_KEY);
      if (storedModel) {
        setSelectedModel(storedModel);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveServerUrl = async (url: string) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, url);
      setServerUrl(url);
    } catch (error) {
      console.error('Failed to save server URL:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send to OpenCode via API bridge
      const response = await axios.post(`${serverUrl}/api/chat`, {
        message: inputText.trim(),
        history: messages.slice(-10), // Send last 10 messages for context
        model: selectedModel || undefined, // Send selected model if set
      }, {
        timeout: 120000, // 2 minute timeout
      });

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.data.response || 'No response received.',
        timestamp: new Date(),
      };

      setMessages((prev) => prev.slice(0, -1).concat(assistantMessage));
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Error: ${error.message}\n\nPlease check:\n- Your server is running\n- Cloudflare tunnel is active\n- Server URL is correct in settings`,
        timestamp: new Date(),
      };
      setMessages((prev) => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: '👋 Conversation cleared. What would you like to work on?',
        timestamp: new Date(),
      },
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const bgColor = isUser
      ? isDark ? '#2563eb' : '#3b82f6'
      : isDark ? '#1e293b' : '#f1f5f9';
    const textColor = isUser ? '#ffffff' : isDark ? '#e2e8f0' : '#1e293b';

    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        <View style={[styles.messageBubble, { backgroundColor: bgColor }]}>
          {item.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={textColor} />
              <Text style={[styles.loadingText, { color: textColor }]}>Thinking...</Text>
            </View>
          ) : (
            <>
              <Markdown
                style={{
                  body: { color: textColor },
                  code_inline: {
                    backgroundColor: isDark ? '#334155' : '#e2e8f0',
                    color: textColor,
                    padding: 2,
                    borderRadius: 4,
                  },
                  fence: {
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    padding: 10,
                    borderRadius: 8,
                  },
                }}
              >
                {item.content}
              </Markdown>
              <TouchableOpacity
                onPress={() => copyToClipboard(item.content)}
                style={styles.copyButton}
              >
                <Text style={[styles.copyButtonText, { color: textColor }]}>📋 Copy</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const saveSettings = async () => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, serverUrl);
      await SecureStore.setItemAsync(MODEL_KEY, selectedModel);
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  if (showSettings) {
    return (
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View style={styles.settingsHeader}>
              <IconButton icon="arrow-left" onPress={() => setShowSettings(false)} />
              <Text style={[styles.settingsTitle, { color: theme.colors.onBackground }]}>
                Settings
              </Text>
            </View>
            <ScrollView style={styles.settingsContent}>
              <Text style={[styles.settingsLabel, { color: theme.colors.onBackground }]}>
                Server URL
              </Text>
              <TextInput
                style={[styles.settingsInput, {
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  color: theme.colors.onBackground,
                }]}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://opencode.relayapp.pro"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={[styles.settingsLabel, { color: theme.colors.onBackground, marginTop: 20 }]}>
                Model
              </Text>
              <View style={[styles.pickerContainer, {
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              }]}>
                <Picker
                  selectedValue={selectedModel}
                  onValueChange={(itemValue) => setSelectedModel(itemValue)}
                  style={[styles.picker, { color: theme.colors.onBackground }]}
                  dropdownIconColor={theme.colors.onBackground}
                >
                  <Picker.Item label="Default" value="" />

                  <Picker.Item label="🆓 FREE OPENCODE MODELS" value="" enabled={false} />
                  {FREE_MODELS.map((model) => (
                    <Picker.Item
                      key={model.value}
                      label={`  ${model.label}`}
                      value={model.value}
                    />
                  ))}

                  <Picker.Item label="" value="" enabled={false} />
                  <Picker.Item label="💎 PREMIUM MODELS" value="" enabled={false} />
                  {PREMIUM_MODELS.map((model) => (
                    <Picker.Item
                      key={model.value}
                      label={`  ${model.label}`}
                      value={model.value}
                    />
                  ))}
                </Picker>
              </View>
              <Text style={[styles.settingsHint, { color: theme.colors.onSurfaceVariant }]}>
                Free OpenCode models don't require API keys. Premium models need your own API credentials configured in OpenCode.
              </Text>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveSettings}
              >
                <Text style={styles.saveButtonText}>Save Settings</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

          {/* Header */}
          <View style={[styles.header, { backgroundColor: isDark ? '#0f172a' : '#ffffff' }]}>
            <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
              OpenCode
            </Text>
            <View style={styles.headerActions}>
              <IconButton icon="delete-outline" onPress={clearConversation} />
              <IconButton icon="cog-outline" onPress={() => setShowSettings(true)} />
            </View>
          </View>

          {/* Messages */}
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
              onLayout={() => flatListRef.current?.scrollToEnd()}
            />

            {/* Input */}
            <View style={[styles.inputContainer, {
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              borderTopColor: isDark ? '#334155' : '#e2e8f0',
            }]}>
              <TextInput
                style={[styles.input, {
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  color: theme.colors.onBackground,
                }]}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message OpenCode..."
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                multiline
                maxLength={4000}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[styles.sendButton, {
                  backgroundColor: inputText.trim() && !isLoading ? '#3b82f6' : '#94a3b8',
                }]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Text style={styles.sendButtonText}>↑</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  messageList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  copyButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  copyButtonText: {
    fontSize: 12,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingsContent: {
    padding: 16,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingsInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  settingsHint: {
    fontSize: 12,
    marginBottom: 20,
    lineHeight: 16,
  },
});
