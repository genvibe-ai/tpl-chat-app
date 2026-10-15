/** Android and web: a plain row. iOS merges neighbouring glass in GlassGroup.ios.tsx. */
import { View, type StyleProp, type ViewStyle } from "react-native";
import type { PropsWithChildren } from "react";

export function GlassGroup({
  children,
  style,
}: PropsWithChildren<{ spacing?: number; style?: StyleProp<ViewStyle> }>) {
  return <View style={style}>{children}</View>;
}
