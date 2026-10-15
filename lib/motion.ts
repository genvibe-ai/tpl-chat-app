/**
 * Motion: one spring vocabulary, plus the enter/exit animations of sheets,
 * toasts, trays and bubbles. On iPhone and Android these move without fading
 * (Liquid Glass switches off while a parent fades). The web runs Reanimated's
 * predefined animations, so each has a web twin.
 */
import { Platform } from "react-native";
import {
  Easing,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export const SNAP = { duration: 420, dampingRatio: 1 } as const; // settle, no bounce
export const SOFT = { duration: 480, dampingRatio: 0.82 } as const; // one gentle overshoot
export const POP = { duration: 380, dampingRatio: 0.62 } as const; // reactions, badges

/** Timing for anything the finger did not touch. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const PRESS_MS = 120;

const web = Platform.OS === "web";

/** Enters from `y` points away (and a little smaller), springing into place. */
function arriveFrom(y: number, scale = 1) {
  return () => {
    "worklet";
    return {
      initialValues: { transform: [{ translateY: y }, { scale }] },
      animations: { transform: [{ translateY: withSpring(0, SOFT) }, { scale: withSpring(1, SOFT) }] },
    };
  };
}

/** Leaves towards `y` points away. */
function leaveTo(y: number, scale = 1, duration = 200) {
  return () => {
    "worklet";
    return {
      initialValues: { transform: [{ translateY: 0 }, { scale: 1 }] },
      animations: { transform: [{ translateY: withTiming(y, { duration }) }, { scale: withTiming(scale, { duration }) }] },
    };
  };
}

/** Your message leaves the composer: a little low and a touch large, then it settles. */
function sentBubble() {
  "worklet";
  return {
    initialValues: { opacity: 0, transform: [{ translateY: 22 }, { scale: 1.02 }] },
    animations: {
      opacity: withTiming(1, { duration: 140 }),
      transform: [{ translateY: withSpring(0, SOFT) }, { scale: withSpring(1, SOFT) }],
    },
  };
}

export const motion = {
  toastIn: web ? FadeInUp.duration(220) : arriveFrom(-90, 0.96),
  toastOut: web ? FadeOutUp.duration(180) : leaveTo(-110, 0.96, 220),
  sheetIn: web ? SlideInDown.duration(300) : arriveFrom(420),
  sheetOut: web ? SlideOutDown.duration(220) : leaveTo(460),
  trayIn: web ? FadeInDown.duration(200) : arriveFrom(40, 0.97),
  trayOut: web ? FadeOutDown.duration(140) : leaveTo(60, 0.97, 160),
  pickerIn: web ? ZoomIn.duration(180) : arriveFrom(14, 0.8),
  pickerOut: web ? ZoomOut.duration(120) : leaveTo(0, 0.85, 120),
  sent: web ? FadeInDown.duration(220) : sentBubble,
  /** The long-pressed message lifting above the dimmed chat. */
  lift: web ? undefined : arriveFrom(0, 0.96),
};

/** Rows and bubbles rising into place (web layout animations run linear easing only). */
export function riseIn(delay = 0, duration = 320) {
  const base = FadeInDown.delay(delay).duration(duration);
  return web ? base : base.easing(EASE_OUT.factory());
}

/** Badges, reactions and emoji popping in. */
export function popIn(delay = 0) {
  return web ? ZoomIn.delay(delay).duration(200) : ZoomIn.delay(delay).springify().damping(13);
}
