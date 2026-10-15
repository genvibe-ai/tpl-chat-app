import { StyleSheet } from "react-native";

/**
 * Touch pass-through as compiled styles. On the web, "box-none" only works
 * from StyleSheet.create (react-native-web turns it into CSS rules there);
 * as an inline style it is ignored and taps fall through or get blocked.
 */
export const pointer = StyleSheet.create({
  none: { pointerEvents: "none" },
  boxNone: { pointerEvents: "box-none" },
  auto: { pointerEvents: "auto" },
});
