/**
 * Web: frosted glass with a CSS backdrop filter on a single view (so text
 * and inputs inside are never covered by an overlay). iOS uses Glass.ios.tsx
 * (Liquid Glass), Android uses Glass.android.tsx (a solid surface).
 */
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import type { GlassProps } from "./GlassFallback";

export type { GlassProps };

/** True only where the system draws Liquid Glass (iOS 26+). */
export function useNativeGlass() {
  return false;
}

export function Glass({ style, effect = "regular", tint, children }: GlassProps) {
  const t = useTheme();
  const frost = {
    backgroundColor: tint ?? (effect === "clear" ? "rgba(255, 255, 255, 0.08)" : t.glass),
    backdropFilter: `blur(${effect === "clear" ? 14 : 24}px) saturate(170%)`,
  } as ViewStyle;
  return (
    <View
      style={[
        { borderWidth: StyleSheet.hairlineWidth, borderColor: t.glassEdge, overflow: "hidden" },
        frost,
        style,
      ]}
    >
      {children}
    </View>
  );
}
