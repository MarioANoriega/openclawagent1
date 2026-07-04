import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChatBubble } from "../components/ChatBubble";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { ChatMessage } from "../types";
import { colors, radius, spacing } from "../theme";
import type { AppStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "Chat">;

export function ChatScreen({ route, navigation }: Props) {
  const { petId, petName } = route.params;
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    navigation.setOptions({ title: petName });
  }, [navigation, petName]);

  useEffect(() => {
    if (!token) return;
    api.chatHistory(token, petId).then(({ messages: history }) => setMessages(history));
  }, [token, petId]);

  const onSend = async () => {
    const question = draft.trim();
    if (!question || !token) return;
    setDraft("");
    setError(null);
    setSending(true);

    setMessages((prev) => [
      ...prev,
      { id: `pending-${Date.now()}`, role: "user", content: question, createdAt: Date.now() },
    ]);

    try {
      const { assistantMessage } = await api.sendMessage(token, petId, question);
      const { messages: refreshed } = await api.chatHistory(token, petId);
      setMessages(refreshed);
      void assistantMessage;
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        navigation.navigate("Subscribe");
      } else {
        setError(err instanceof ApiError ? err.message : "Could not send message.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(message) => message.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text style={styles.hint}>
              Ask about {petName}&apos;s diet, weight, symptoms, or general care.
            </Text>
          }
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask a question..."
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable
            style={[styles.sendButton, (!draft.trim() || sending) && styles.sendButtonDisabled]}
            onPress={onSend}
            disabled={!draft.trim() || sending}
          >
            <Text style={styles.sendLabel}>{sending ? "..." : "Send"}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messages: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  hint: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  error: {
    color: colors.danger,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
