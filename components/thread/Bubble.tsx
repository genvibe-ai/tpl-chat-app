/**
 * One message. Your bubbles are Chirpline tomato, theirs are paper white.
 * Bubbles from the same person join with tighter inner corners. Long-press
 * to react, double-tap for a quick ❤️, tap a photo to open it.
 */
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { copy, photos, type Message, type Person } from "@/constants/content";
import { Radius, Space, Type } from "@/constants/theme";
import { isEmojiOnly } from "@/lib/chats";
import { EASE_OUT, SNAP, motion, popIn, riseIn } from "@/lib/motion";
import { useTheme } from "@/lib/theme";
import { Avatar } from "../ui/Avatar";

export const BUBBLE_AVATAR = 28;

export type BubbleRect = { x: number; y: number; width: number; height: number };

type Props = {
  message: Message;
  sender?: Person;
  mine: boolean;
  /** First and last of a run from the same person. */
  first: boolean;
  last: boolean;
  showName: boolean;
  maxWidth: number;
  animate: boolean;
  onLongPress: (message: Message, rect: BubbleRect) => void;
  onDoubleTap: (message: Message) => void;
  onOpenPhoto: (message: Message) => void;
  onPressReactions: (message: Message) => void;
};

/** What a message looks like: a bubble (text, photo, or both) or big emoji. */
export const BubbleBody = memo(function BubbleBody({
  message,
  mine,
  first,
  last,
  maxWidth,
}: {
  message: Message;
  mine: boolean;
  first: boolean;
  last: boolean;
  maxWidth: number;
}) {
  const t = useTheme();
  const photo = message.photo ? photos[message.photo] : undefined;
  const big = !photo && isEmojiOnly(message.text);
  const R = Radius.bubble;
  const J = Radius.bubbleJoin;
  const shape = mine
    ? { borderTopLeftRadius: R, borderBottomLeftRadius: R, borderTopRightRadius: first ? R : J, borderBottomRightRadius: last ? R : J }
    : { borderTopRightRadius: R, borderBottomRightRadius: R, borderTopLeftRadius: first ? R : J, borderBottomLeftRadius: last ? R : J };
  const textColor = mine ? t.bubbleOutText : t.bubbleInText;
  const imageWidth = Math.min(maxWidth, 280);

  if (big) {
    return <Text style={{ fontSize: Array.from(message.text ?? "").length <= 2 ? 46 : 36, lineHeight: 56 }}>{message.text}</Text>;
  }
  return (
    <View
      style={[
        shape,
        styles.bubble,
        { backgroundColor: mine ? t.bubbleOut : t.bubbleIn, boxShadow: `0 ${mine ? 4 : 3}px 14px ${t.shadow}` },
      ]}
    >
      {mine && (
        <View style={[shape, StyleSheet.absoluteFill, { overflow: "hidden" }]}>
          <LinearGradient colors={[t.bubbleOut, t.bubbleOutEnd]} style={StyleSheet.absoluteFill} />
        </View>
      )}
      {photo && (
        <View
          style={{
            overflow: "hidden",
            borderTopLeftRadius: shape.borderTopLeftRadius,
            borderTopRightRadius: shape.borderTopRightRadius,
            borderBottomLeftRadius: message.text ? 4 : shape.borderBottomLeftRadius,
            borderBottomRightRadius: message.text ? 4 : shape.borderBottomRightRadius,
          }}
        >
          <Image
            source={photo.source}
            alt={photo.alt}
            contentFit="cover"
            transition={0}
            style={{ width: imageWidth, height: (imageWidth * photo.height) / photo.width }}
          />
        </View>
      )}
      {!!message.text && (
        <Text
          style={[
            Type.body,
            {
              color: textColor,
              paddingHorizontal: 15,
              paddingTop: photo ? 9 : 10,
              paddingBottom: 10,
              maxWidth: photo ? imageWidth : undefined,
            },
          ]}
        >
          {message.text}
        </Text>
      )}
    </View>
  );
});

export const Bubble = memo(function Bubble({
  message,
  sender,
  mine,
  first,
  last,
  showName,
  maxWidth,
  animate,
  onLongPress,
  onDoubleTap,
  onOpenPhoto,
  onPressReactions,
}: Props) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const box = useRef<View>(null);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const photo = message.photo ? photos[message.photo] : undefined;
  const reactions = message.reactions ?? [];

  const measure = () => {
    box.current?.measureInWindow((x, y, width, height) => onLongPress(message, { x, y, width, height }));
  };

  const longPress = Gesture.LongPress()
    .minDuration(320)
    .runOnJS(true)
    .onBegin(() => {
      if (!reduced) scale.set(withTiming(0.97, { duration: 160, easing: EASE_OUT }));
    })
    .onStart(measure)
    .onFinalize(() => scale.set(withSpring(1, SNAP)));
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(260)
    .runOnJS(true)
    .onEnd((_e, success) => {
      if (success) onDoubleTap(message);
    });
  const singleTap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((_e, success) => {
      if (success && photo) onOpenPhoto(message);
    });
  const gesture = Gesture.Race(longPress, photo ? Gesture.Exclusive(doubleTap, singleTap) : doubleTap);

  return (
    <Animated.View
      entering={animate && !reduced ? (mine ? motion.sent : riseIn(0, 260)) : undefined}
      style={[
        styles.row,
        mine ? styles.rowMine : styles.rowTheirs,
        { marginTop: first ? Space[3] : 3, paddingBottom: reactions.length ? 16 : 0 },
      ]}
    >
      {!mine && (
        <View style={styles.avatarSlot}>{last && sender ? <Avatar person={sender} size={BUBBLE_AVATAR} /> : null}</View>
      )}
      <View style={{ maxWidth, alignItems: mine ? "flex-end" : "flex-start" }}>
        {showName && sender && (
          <Text style={[Type.caption, { color: t.secondary, marginLeft: 12, marginBottom: 3 }]}>{sender.first}</Text>
        )}
        <GestureDetector gesture={gesture}>
          <Animated.View
            ref={box}
            collapsable={false}
            style={pressStyle}
            role={photo ? "button" : undefined}
            aria-label={photo ? `${copy.thread.openPhoto}. ${photo.alt}` : message.text}
          >
            <BubbleBody message={message} mine={mine} first={first} last={last} maxWidth={maxWidth} />
          </Animated.View>
        </GestureDetector>
        {reactions.length > 0 && (
          <ReactionPill message={message} mine={mine} onPress={() => onPressReactions(message)} />
        )}
      </View>
    </Animated.View>
  );
});

function ReactionPill({ message, mine, onPress }: { message: Message; mine: boolean; onPress: () => void }) {
  const t = useTheme();
  const reactions = message.reactions ?? [];
  const emojis = [...new Set(reactions.map((r) => r.emoji))].slice(0, 3);
  const byMe = reactions.some((r) => r.from === "me");
  return (
    <Animated.View
      key={reactions.map((r) => r.emoji + r.from).join()}
      entering={popIn()}
      style={[styles.pillWrap, mine ? { left: 10 } : { right: 10 }]}
    >
      <Pressable
        role="button"
        aria-label={byMe ? copy.thread.removeReaction : copy.thread.reactWith(emojis[0] ?? "")}
        hitSlop={8}
        onPress={onPress}
        style={[styles.pill, { backgroundColor: t.surface, borderColor: t.surface, boxShadow: `0 2px 8px ${t.shadow}` }]}
      >
        <View style={[styles.pillInner, { backgroundColor: byMe ? t.accentSoft : "transparent" }]}>
          <Text style={styles.pillEmoji}>{emojis.join("")}</Text>
          {reactions.length > 1 && (
            <Text style={[Type.caption, { color: t.secondary, fontVariant: ["tabular-nums"] }]}>{reactions.length}</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 14 },
  rowMine: { justifyContent: "flex-end" },
  rowTheirs: { justifyContent: "flex-start", gap: 8 },
  avatarSlot: { width: BUBBLE_AVATAR, height: BUBBLE_AVATAR, marginBottom: 1 },
  bubble: { borderCurve: "continuous" },
  pillWrap: { position: "absolute", bottom: -16 },
  pill: { borderRadius: 15, borderWidth: 2 },
  pillInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 13,
  },
  pillEmoji: { fontSize: 14, lineHeight: 18 },
});
