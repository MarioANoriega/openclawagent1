import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  name: string;
  photo: string | null;
  size?: number;
}

export function PetAvatar({ name, photo, size = 48 }: Props) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (photo) {
    return <Image source={{ uri: photo }} style={[styles.image, dimension]} />;
  }

  return (
    <View style={[styles.placeholder, dimension]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>
        {name.trim().charAt(0).toUpperCase() || "?"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.bubbleAssistant,
  },
  placeholder: {
    backgroundColor: colors.bubbleAssistant,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  initial: {
    color: colors.primary,
    fontWeight: "700",
  },
});
