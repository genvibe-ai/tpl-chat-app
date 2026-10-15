import type { PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";

/**
 * iOS and Android: keeps the composer on top of the keyboard, following it
 * frame by frame (including the interactive drag-to-dismiss). When the
 * keyboard is open, the composer's own safe-area padding tucks behind it.
 */
export function Sticky({ insetBottom, style, children }: PropsWithChildren<{ insetBottom: number; style?: StyleProp<ViewStyle> }>) {
  return (
    <KeyboardStickyView offset={{ closed: 0, opened: insetBottom }} style={style}>
      {children}
    </KeyboardStickyView>
  );
}
