import { Platform, Text } from "react-native";
import { Icon } from "./Icon";

/**
 * A like heart. iOS has a filled SF Symbol; Material Symbols (Android, web)
 * only ships the outline here, so a liked heart is the ❤️ emoji there.
 */
export function Heart({ filled, size, color }: { filled: boolean; size: number; color: string }) {
  if (filled && Platform.OS !== "ios") {
    return <Text style={{ fontSize: size - 2, lineHeight: size + 4 }}>❤️</Text>;
  }
  return <Icon name={filled ? "heartFill" : "heart"} size={size} color={filled ? "#FF6B5A" : color} />;
}
