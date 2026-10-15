import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { copy, type Person } from "@/constants/content";
import { Radius, Space } from "@/constants/theme";
import { useTheme } from "@/lib/theme";
import { Avatar } from "../ui/Avatar";
import { BUBBLE_AVATAR } from "./Bubble";

function Dot({ delay, color }: { delay: number; color: string }) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    t.set(
      withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 320 }), withTiming(0, { duration: 320 })), -1)),
    );
    return () => cancelAnimation(t);
  }, [delay, t, reduced]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * t.get(),
    transform: [{ translateY: -3 * t.get() }],
  }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

/** Three bouncing dots while the other person writes. */
export function TypingBubble({ person }: { person: Person }) {
  const t = useTheme();
  return (
    // No exit animation: the reply takes the dots' place directly.
    <Animated.View entering={FadeIn.duration(200)} style={styles.row}>
      <Avatar person={person} size={BUBBLE_AVATAR} />
      <View
        aria-label={`${person.first} ${copy.thread.typing}`}
        style={[styles.bubble, { backgroundColor: t.bubbleIn, boxShadow: `0 3px 14px ${t.shadow}` }]}
      >
        <Dot delay={0} color={t.secondary} />
        <Dot delay={140} color={t.secondary} />
        <Dot delay={280} color={t.secondary} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 14,
    marginTop: Space[3],
  },
  bubble: {
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 17,
    height: 42,
    alignItems: "center",
    borderRadius: Radius.bubble,
    borderCurve: "continuous",
  },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
});
