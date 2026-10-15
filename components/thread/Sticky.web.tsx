import type { PropsWithChildren } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

/** Web: the browser moves the page for its keyboard; a plain container. */
export function Sticky({ style, children }: PropsWithChildren<{ insetBottom: number; style?: StyleProp<ViewStyle> }>) {
  return <View style={style}>{children}</View>;
}
