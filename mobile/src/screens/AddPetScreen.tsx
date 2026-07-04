import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryButton } from "../components/PrimaryButton";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";
import type { AppStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "AddPet">;

export function AddPetScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      await api.createPet(token, {
        name,
        species,
        breed: breed || undefined,
        ageYears: ageYears ? Number(ageYears) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        notes: notes || undefined,
      });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add pet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.title}>Add a pet</Text>

        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput
          style={styles.input}
          placeholder="Species (e.g. Dog, Cat)"
          value={species}
          onChangeText={setSpecies}
        />
        <TextInput
          style={styles.input}
          placeholder="Breed (optional)"
          value={breed}
          onChangeText={setBreed}
        />
        <TextInput
          style={styles.input}
          placeholder="Age in years (optional)"
          keyboardType="decimal-pad"
          value={ageYears}
          onChangeText={setAgeYears}
        />
        <TextInput
          style={styles.input}
          placeholder="Weight in kg (optional)"
          keyboardType="decimal-pad"
          value={weightKg}
          onChangeText={setWeightKg}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Notes for the assistant (allergies, conditions, etc.)"
          multiline
          value={notes}
          onChangeText={setNotes}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <PrimaryButton
          title="Save pet"
          onPress={onSubmit}
          loading={loading}
          disabled={!name.trim() || !species.trim()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    fontSize: 16,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
});
