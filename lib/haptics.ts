/**
 * Haptics that never throw. Skipped on the web (browsers only log warnings)
 * and when Settings > Haptics is off.
 */
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useStore } from "./store";

const run = (feedback: () => Promise<void>) => {
  if (Platform.OS === "web" || !useStore.getState().settings.haptics) return;
  try {
    feedback().catch(() => {});
  } catch {
    // Some devices have no haptic engine.
  }
};

export const haptics = {
  select: () => run(() => Haptics.selectionAsync()),
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
