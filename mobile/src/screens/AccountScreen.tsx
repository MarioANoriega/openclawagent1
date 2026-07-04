import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryButton } from "../components/PrimaryButton";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { hasActiveSubscription } from "../types";
import { colors, radius, spacing } from "../theme";
import type { AppStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "Account">;

export function AccountScreen({ navigation }: Props) {
  const { token, user, logout, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscribed = hasActiveSubscription(user);

  const openBillingPortal = async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const { portalUrl } = await api.createBillingPortal(token);
      await WebBrowser.openBrowserAsync(portalUrl);
      await refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not open billing portal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={[styles.label, styles.spaced]}>Subscription</Text>
        <Text style={styles.value}>
          {subscribed
            ? `Active (${user?.subscriptionPlan ?? "plan"})`
            : "No active subscription"}
        </Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {subscribed ? (
        <PrimaryButton title="Manage billing" onPress={openBillingPortal} loading={loading} />
      ) : (
        <PrimaryButton title="Subscribe" onPress={() => navigation.navigate("Subscribe")} />
      )}

      <View style={styles.logout}>
        <PrimaryButton title="Log out" variant="secondary" onPress={logout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
  },
  spaced: {
    marginTop: spacing.md,
  },
  value: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 2,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  logout: {
    marginTop: spacing.xl,
  },
});
