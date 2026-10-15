/**
 * iOS 26+: neighbouring Liquid Glass shapes (the message field and the send
 * button) melt into each other as they move apart and together.
 */
import { GlassContainer } from "expo-glass-effect";
import type { PropsWithChildren } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useNativeGlass } from "./Glass";

export function GlassGroup({
  children,
  spacing = 14,
  style,
}: PropsWithChildren<{ spacing?: number; style?: StyleProp<ViewStyle> }>) {
  const native = useNativeGlass();
  if (!native) return <View style={style}>{children}</View>;
  return (
    <GlassContainer spacing={spacing} style={style}>
      {children}
    </GlassContainer>
  );
}
