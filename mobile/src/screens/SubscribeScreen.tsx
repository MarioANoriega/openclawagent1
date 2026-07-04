import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryButton } from "../components/PrimaryButton";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme";
import type { AppStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "Subscribe">;
type Plan = "monthly" | "yearly";

export function SubscribeScreen({ navigation }: Props) {
  const { token, refreshUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async (plan: Plan) => {
    if (!token) return;
    setError(null);
    setLoadingPlan(plan);
    try {
      const { checkoutUrl } = await api.createCheckout(token, plan);
      await WebBrowser.openBrowserAsync(checkoutUrl);
      await refreshUser();
      navigation.goBack();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start checkout.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Pet Plus subscription</Text>
      <Text style={styles.subtitle}>
        Unlimited chat about your pet's nutrition and medical questions, any time.
      </Text>

      <View style={styles.card}>
        <Text style={styles.planName}>Monthly</Text>
        <Text style={styles.planPrice}>Billed every month</Text>
        <PrimaryButton
          title="Subscribe monthly"
          onPress={() => subscribe("monthly")}
          loading={loadingPlan === "monthly"}
          disabled={loadingPlan !== null}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.planName}>Yearly</Text>
        <Text style={styles.planPrice}>Billed once a year - best value</Text>
        <PrimaryButton
          title="Subscribe yearly"
          onPress={() => subscribe("yearly")}
          loading={loadingPlan === "yearly"}
          disabled={loadingPlan !== null}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.disclaimer}>
        Payment is processed securely by Stripe. Pet Plus provides general information and is not
        a substitute for veterinary care.
      </Text>
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
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  planPrice: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  disclaimer: {
    marginTop: spacing.lg,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
});
