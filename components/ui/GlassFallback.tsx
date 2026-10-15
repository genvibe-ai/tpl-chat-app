/**
 * Frosted glass for iPhones without Liquid Glass (iOS before 26, or Reduce
 * Transparency on): a system blur with a soft tint and a hairline edge.
 */
import { BlurView } from "expo-blur";
import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { pointer } from "@/lib/pointer";
import { useScheme, useTheme } from "@/lib/theme";

export type GlassProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  /** "clear" is lighter, for glass over photos. */
  effect?: "regular" | "clear";
  /** A colour laid over the glass. */
  tint?: string;
  /** Liquid Glass reacts to touches (iOS 26+). */
  interactive?: boolean;
}>;

export function GlassFallback({ style, effect = "regular", tint, children }: GlassProps) {
  const t = useTheme();
  const scheme = useScheme();
  const radius = StyleSheet.flatten(style)?.borderRadius;
  return (
    <View
      style={[
        { borderCurve: "continuous", borderWidth: StyleSheet.hairlineWidth, borderColor: t.glassEdge },
        style,
        { overflow: "hidden" },
      ]}
    >
      <BlurView
        tint={scheme === "dark" ? "dark" : "light"}
        intensity={effect === "clear" ? 28 : 56}
        style={[StyleSheet.absoluteFill, { borderRadius: radius as number | undefined }]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          pointer.none,
          { backgroundColor: tint ?? (effect === "clear" ? "transparent" : t.glass) },
        ]}
      />
      {children}
    </View>
  );
}
