import { useState } from "react";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { PrimaryButton } from "../components/PrimaryButton";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Vet } from "../types";
import { colors, radius, spacing } from "../theme";

function mapsUrl(vet: Vet): string {
  const label = encodeURIComponent(vet.name);
  return Platform.select({
    ios: `https://maps.apple.com/?q=${label}&ll=${vet.lat},${vet.lon}`,
    android: `geo:${vet.lat},${vet.lon}?q=${vet.lat},${vet.lon}(${label})`,
    default: `https://www.google.com/maps/search/?api=1&query=${vet.lat}%2C${vet.lon}`,
  });
}

function ContactButton({ label, url }: { label: string; url: string }) {
  return (
    <Pressable style={styles.contactButton} onPress={() => Linking.openURL(url)}>
      <Text style={styles.contactLabel}>{label}</Text>
    </Pressable>
  );
}

export function FindVetScreen() {
  const { token } = useAuth();
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [vets, setVets] = useState<Vet[] | null>(null);
  const [originLabel, setOriginLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (params: { lat: number; lon: number } | { zip: string; country?: string }) => {
    if (!token) return;
    setError(null);
    setLoading(true);
    setVets(null);
    try {
      const result = await api.searchVets(token, params);
      setVets(result.vets);
      setOriginLabel(result.origin.label);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = async () => {
    setError(null);
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setError("Location access was denied - you can search by ZIP code instead.");
      return;
    }
    setLoading(true);
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await runSearch({ lat: position.coords.latitude, lon: position.coords.longitude });
    } catch {
      setError("Could not read your location - you can search by ZIP code instead.");
      setLoading(false);
    }
  };

  const searchByZip = () => {
    if (!zip.trim()) return;
    runSearch({ zip: zip.trim(), country: country.trim() || undefined });
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.searchPanel}>
        <Text style={styles.intro}>
          In an emergency, call the nearest clinic right away. Find veterinarians near you:
        </Text>
        <PrimaryButton title="Use my location" onPress={useMyLocation} loading={loading && vets === null} />
        <Text style={styles.divider}>or search by ZIP / postal code</Text>
        <View style={styles.zipRow}>
          <TextInput
            style={[styles.input, styles.zipInput]}
            placeholder="ZIP code"
            value={zip}
            onChangeText={setZip}
            autoCapitalize="characters"
          />
          <TextInput
            style={[styles.input, styles.countryInput]}
            placeholder="Country (default US)"
            value={country}
            onChangeText={setCountry}
          />
        </View>
        <PrimaryButton title="Search" variant="secondary" onPress={searchByZip} disabled={!zip.trim() || loading} />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <FlatList
        data={vets ?? []}
        keyExtractor={(vet) => vet.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          vets && originLabel ? (
            <Text style={styles.resultsHeader}>
              {vets.length} result{vets.length === 1 ? "" : "s"} near {originLabel}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          vets !== null && !loading ? (
            <Text style={styles.empty}>
              No veterinarians found nearby. Try a different ZIP code or a larger city.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.vetName}>{item.name}</Text>
              <Text style={styles.distance}>{item.distanceKm} km</Text>
            </View>
            {item.address && <Text style={styles.address}>{item.address}</Text>}
            <View style={styles.contactRow}>
              {item.phone && <ContactButton label="Call" url={`tel:${item.phone}`} />}
              {item.email && <ContactButton label="Email" url={`mailto:${item.email}`} />}
              {item.website && <ContactButton label="Website" url={item.website} />}
              <ContactButton label="Map" url={mapsUrl(item)} />
            </View>
            {item.phone && <Text style={styles.phone}>{item.phone}</Text>}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchPanel: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  intro: {
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  divider: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
  },
  zipRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    fontSize: 15,
  },
  zipInput: {
    flex: 1,
  },
  countryInput: {
    flex: 1.4,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  resultsHeader: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  vetName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  distance: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  address: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  contactButton: {
    backgroundColor: colors.bubbleAssistant,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  contactLabel: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  phone: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
