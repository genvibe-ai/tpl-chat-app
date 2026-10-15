/** The reaction bar that opens above a long-pressed message. */
import { useEffect, type ReactNode } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { copy, reactions } from "@/constants/content";
import { haptics } from "@/lib/haptics";
import { motion, popIn } from "@/lib/motion";
import { pointer } from "@/lib/pointer";
import { useTheme } from "@/lib/theme";
import { Glass, useNativeGlass } from "../ui/Glass";
import type { BubbleRect } from "./Bubble";

const SLOT = 46;
const BAR_H = 58;

export function ReactionPicker({
  rect,
  mine,
  current,
  width,
  preview,
  onPick,
  onClose,
}: {
  /** The message's position inside the screen. */
  rect: BubbleRect;
  mine: boolean;
  /** Your current reaction on the message, if any. */
  current?: string;
  width: number;
  /** A copy of the message, shown lifted above the dimmed chat. */
  preview?: ReactNode;
  onPick: (emoji: string) => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const native = useNativeGlass();
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const barW = reactions.length * SLOT + 12;
  let top = rect.y - BAR_H - 10;
  if (top < insets.top + 70) top = rect.y + rect.height + 10;
  const left = Math.max(12, Math.min(width - barW - 12, mine ? rect.x + rect.width - barW : rect.x));

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 40 }]}>
      <Animated.View entering={FadeIn.duration(140)} exiting={FadeOut.duration(120)} style={StyleSheet.absoluteFill}>
        <Pressable aria-label={copy.thread.closeReactions} onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: t.scrim }]} />
      </Animated.View>
      {preview ? (
        <Animated.View
          entering={motion.lift}
          style={[
            { position: "absolute", top: rect.y, left: rect.x, width: rect.width, alignItems: mine ? "flex-end" : "flex-start" },
            pointer.none,
          ]}
        >
          {preview}
        </Animated.View>
      ) : null}
      <Animated.View
        entering={motion.pickerIn}
        exiting={motion.pickerOut}
        style={{ position: "absolute", top, left, borderRadius: BAR_H / 2, boxShadow: native ? undefined : `0 12px 32px ${t.shadow}` }}
      >
        <Glass style={{ flexDirection: "row", alignItems: "center", height: BAR_H, paddingHorizontal: 6, borderRadius: BAR_H / 2 }}>
          {reactions.map((emoji, index) => {
            const selected = current === emoji;
            return (
              <Animated.View key={emoji} entering={popIn(40 + index * 28)}>
                <Pressable
                  role="button"
                  aria-label={selected ? copy.thread.removeReaction : copy.thread.reactWith(emoji)}
                  aria-selected={selected}
                  testID={`react-${index}`}
                  onPress={() => {
                    haptics.light();
                    onPick(emoji);
                  }}
                  style={({ pressed }) => [
                    styles.slot,
                    { backgroundColor: selected ? t.accentSoft : "transparent", transform: [{ scale: pressed ? 1.25 : 1 }] },
                  ]}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </Glass>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { width: SLOT, height: SLOT, borderRadius: SLOT / 2, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 27, lineHeight: 34 },
});
