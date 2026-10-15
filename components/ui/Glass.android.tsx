/**
 * Android: a solid surface with a hairline edge and a soft shadow instead of
 * live blur (steady and cheap in Expo Go). iOS uses Glass.ios.tsx.
 */
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/theme";
import type { GlassProps } from "./GlassFallback";

export type { GlassProps };

export function useNativeGlass() {
  return false;
}

export function Glass({ style, effect = "regular", tint, children }: GlassProps) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: tint ?? (effect === "clear" ? "rgba(255, 255, 255, 0.16)" : t.surface),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.glassEdge,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
