import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryButton } from "../components/PrimaryButton";
import { PetAvatar } from "../components/PetAvatar";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { hasActiveSubscription, type Pet } from "../types";
import { colors, radius, spacing } from "../theme";
import type { AppStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "PetList">;

export function PetListScreen({ navigation }: Props) {
  const { token, user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const subscribed = hasActiveSubscription(user);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let cancelled = false;
      setLoading(true);
      api
        .listPets(token)
        .then(({ pets: fetched }) => {
          if (!cancelled) setPets(fetched);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [token]),
  );

  const onPetPress = (pet: Pet) => {
    if (!subscribed) {
      navigation.navigate("Subscribe");
      return;
    }
    navigation.navigate("Chat", { petId: pet.id, petName: pet.name });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your pets</Text>
        <View style={styles.headerLinks}>
          <Pressable onPress={() => navigation.navigate("FindVet")}>
            <Text style={styles.accountLink}>Find a vet</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Account")}>
            <Text style={styles.accountLink}>Account</Text>
          </Pressable>
        </View>
      </View>

      {!subscribed && (
        <Pressable style={styles.banner} onPress={() => navigation.navigate("Subscribe")}>
          <Text style={styles.bannerTitle}>Unlock unlimited pet chat</Text>
          <Text style={styles.bannerBody}>
            Subscribe monthly or yearly for unlimited nutrition & medical Q&A.
          </Text>
        </Pressable>
      )}

      <FlatList
        data={pets}
        keyExtractor={(pet) => pet.id}
        refreshing={loading}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Add your first pet to get started.</Text> : null
        }
        renderItem={({ item }) => (
          <Pressable style={styles.petCard} onPress={() => onPetPress(item)}>
            <PetAvatar name={item.name} photo={item.photo} size={52} />
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{item.name}</Text>
              <Text style={styles.petMeta}>
                {[
                  item.species,
                  item.breed,
                  item.gender && item.gender !== "unknown"
                    ? item.gender === "male"
                      ? "Male"
                      : "Female"
                    : null,
                  item.ageYears != null ? `${item.ageYears} yr` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        <PrimaryButton title="Add a pet" onPress={() => navigation.navigate("AddPet")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },
  headerLinks: {
    flexDirection: "row",
    gap: spacing.md,
  },
  accountLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  banner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  bannerBody: {
    color: "#E6F2EB",
    marginTop: spacing.xs,
    fontSize: 13,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  petCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  petMeta: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 13,
  },
  footer: {
    padding: spacing.lg,
  },
});
