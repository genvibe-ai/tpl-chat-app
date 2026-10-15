/**
 * Parlo's design system, apart from colours (those live in content.ts).
 * Actions are circles and pills; bubbles 22; cards 24; the conversation
 * panel 40. Every spacing value is a multiple of 4. System font throughout.
 */
import type { TextStyle } from "react-native";

export const Radius = {
  bubble: 22,
  /** The inner corner between two bubbles from the same person. */
  bubbleJoin: 8,
  card: 24,
  panel: 40,
  pill: 999,
} as const;

export const Space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
} as const;

/** One type ramp: a single display size per screen, tabular times. */
export const Type = {
  largeTitle: { fontSize: 30, fontWeight: "700", letterSpacing: -0.9 },
  navTitle: { fontSize: 17, fontWeight: "600", letterSpacing: -0.3 },
  name: { fontSize: 16.5, fontWeight: "600", letterSpacing: -0.3 },
  body: { fontSize: 16.5, fontWeight: "400", letterSpacing: -0.2, lineHeight: 22.5 },
  preview: { fontSize: 15, fontWeight: "400", letterSpacing: -0.15, lineHeight: 20 },
  meta: { fontSize: 13, fontWeight: "400", letterSpacing: -0.05 },
  caption: { fontSize: 12, fontWeight: "500", letterSpacing: -0.05 },
  section: { fontSize: 13, fontWeight: "600", letterSpacing: 0.2 },
  badge: { fontSize: 12.5, fontWeight: "700", letterSpacing: -0.1 },
} satisfies Record<string, TextStyle>;

/** The widest the app gets in a desktop browser; phones use their full width. */
export const MAX_APP_WIDTH = 560;
