import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryButton } from "../components/PrimaryButton";
import { ChipSelector } from "../components/ChipSelector";
import { PetAvatar } from "../components/PetAvatar";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { PetGender } from "../types";
import { colors, radius, spacing } from "../theme";
import type { AppStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<AppStackParamList, "AddPet">;

const SPECIES_OPTIONS = [
  { value: "Dog", label: "Dog" },
  { value: "Cat", label: "Cat" },
  { value: "Bird", label: "Bird" },
  { value: "Rabbit", label: "Rabbit" },
  { value: "Other", label: "Other" },
];

const GENDER_OPTIONS: { value: PetGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unknown", label: "Not sure" },
];

const BREED_SUGGESTIONS: Record<string, string[]> = {
  Dog: ["Labrador", "Golden Retriever", "German Shepherd", "French Bulldog", "Poodle", "Mixed"],
  Cat: ["Domestic Shorthair", "Tabby", "Siamese", "Persian", "Maine Coon", "Mixed"],
  Bird: ["Parakeet", "Cockatiel", "Canary", "Parrot"],
  Rabbit: ["Holland Lop", "Netherland Dwarf", "Lionhead", "Mixed"],
};

export function AddPetScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<string | null>(null);
  const [customSpecies, setCustomSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState<PetGender | null>(null);
  const [ageYears, setAgeYears] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resolvedSpecies = species === "Other" ? customSpecies.trim() : (species ?? "");
  const breedSuggestions = species ? (BREED_SUGGESTIONS[species] ?? []) : [];

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo library access is needed to set a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });
    const asset = result.assets?.[0];
    if (!result.canceled && asset?.base64) {
      setError(null);
      setPhoto(`data:image/jpeg;base64,${asset.base64}`);
    }
  };

  const onSubmit = async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      await api.createPet(token, {
        name,
        species: resolvedSpecies,
        breed: breed.trim() || undefined,
        gender: gender ?? undefined,
        ageYears: ageYears ? Number(ageYears) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        notes: notes.trim() || undefined,
        photo: photo ?? undefined,
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
        <View style={styles.photoSection}>
          <Pressable onPress={pickPhoto}>
            <PetAvatar name={name} photo={photo} size={96} />
          </Pressable>
          <Pressable onPress={pickPhoto}>
            <Text style={styles.photoLink}>{photo ? "Change photo" : "Add a profile photo"}</Text>
          </Pressable>
          {photo && (
            <Pressable onPress={() => setPhoto(null)}>
              <Text style={styles.photoRemove}>Remove photo</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Milo"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Species</Text>
        <ChipSelector options={SPECIES_OPTIONS} selected={species} onSelect={setSpecies} />
        {species === "Other" && (
          <TextInput
            style={styles.input}
            placeholder="What kind of pet?"
            value={customSpecies}
            onChangeText={setCustomSpecies}
          />
        )}

        <Text style={styles.label}>Gender</Text>
        <ChipSelector
          options={GENDER_OPTIONS}
          selected={gender}
          onSelect={(value) => setGender(value as PetGender)}
        />

        <Text style={styles.label}>Breed</Text>
        {breedSuggestions.length > 0 && (
          <ChipSelector
            options={breedSuggestions.map((b) => ({ value: b, label: b }))}
            selected={breedSuggestions.includes(breed) ? breed : null}
            onSelect={setBreed}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder={breedSuggestions.length > 0 ? "Or type a breed" : "Breed (optional)"}
          value={breed}
          onChangeText={setBreed}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Age in years, e.g. 2.5"
          keyboardType="decimal-pad"
          value={ageYears}
          onChangeText={setAgeYears}
        />

        <Text style={styles.label}>Weight</Text>
        <TextInput
          style={styles.input}
          placeholder="Weight in kg (optional)"
          keyboardType="decimal-pad"
          value={weightKg}
          onChangeText={setWeightKg}
        />

        <Text style={styles.label}>Notes</Text>
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
          disabled={!name.trim() || !resolvedSpecies}
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
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  photoSection: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoLink: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 15,
  },
  photoRemove: {
    color: colors.textMuted,
    fontSize: 13,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
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
