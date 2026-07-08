import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";
import type { ChatMessage } from "../types";

interface Props {
  message: ChatMessage;
  onFindVet?: () => void;
}

export function ChatBubble({ message, onFindVet }: Props) {
  const isUser = message.role === "user";
  const showReferral = !isUser && message.vetReferral && onFindVet;
  return (
    <View>
      <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={isUser ? styles.textUser : styles.textAssistant}>{message.content}</Text>
        </View>
      </View>
      {showReferral && (
        <View style={[styles.row, styles.rowAssistant]}>
          <Pressable style={styles.referralCard} onPress={onFindVet}>
            <Text style={styles.referralTitle}>This needs a veterinarian's eyes</Text>
            <Text style={styles.referralBody}>
              Find nearby clinics with phone numbers and directions.
            </Text>
            <Text style={styles.referralAction}>Find a vet near you</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowAssistant: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleUser: {
    backgroundColor: colors.bubbleUser,
    borderBottomRightRadius: radius.sm,
  },
  bubbleAssistant: {
    backgroundColor: colors.bubbleAssistant,
    borderBottomLeftRadius: radius.sm,
  },
  textUser: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  textAssistant: {
    color: colors.text,
    fontSize: 15,
  },
  referralCard: {
    maxWidth: "82%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: 2,
  },
  referralTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  referralBody: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  referralAction: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
    marginTop: spacing.sm,
  },
});
