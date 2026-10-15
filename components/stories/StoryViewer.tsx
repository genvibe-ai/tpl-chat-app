/**
 * The story viewer: one story in a large rounded card with glass controls
 * over it. Tap the right side for the next story, the left for the previous
 * one; hold to pause; drag down or tap ✕ to leave. Mounted once at the root,
 * above the navigator, so opening a story never waits for a mount.
 */
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { copy, me, myStory, photos, storyDuration, type Story } from "@/constants/content";
import { Radius, Space, Type } from "@/constants/theme";
import { useAppWidth } from "@/hooks/useAppWidth";
import { personFor } from "@/lib/chats";
import { haptics } from "@/lib/haptics";
import { POP, SNAP } from "@/lib/motion";
import { pointer } from "@/lib/pointer";
import { closeStory, showStory, stepStory, useActiveStory } from "@/lib/stories";
import { useStore } from "@/lib/store";
import { Avatar } from "../ui/Avatar";
import { Glass } from "../ui/Glass";
import { GlassButton } from "../ui/GlassButton";
import { Heart } from "../ui/Heart";
import { Icon } from "../ui/Icon";

const ENTER_DELAY = 50;
const GLASS_TINT = "rgba(255, 255, 255, 0.16)";

export function StoryHost() {
  const active = useActiveStory();
  useEffect(() => () => closeStory(), []);
  // Mounted from the start with a real story (hidden), so the first open is as quick as every other.
  const [shown, setShown] = useState<Story>(active ?? myStory);
  if (active && active !== shown) setShown(active);
  return (
    <View
      collapsable={false}
      aria-hidden={!active}
      aria-modal={!!active}
      style={[StyleSheet.absoluteFill, { zIndex: 30 }, active ? pointer.boxNone : pointer.none]}
    >
      {active && <StatusBar style="light" />}
      <StoryViewer story={shown} open={!!active} />
    </View>
  );
}

function StoryViewer({ story, open }: { story: Story; open: boolean }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const width = useAppWidth();
  const { height } = useWindowDimensions();
  const mine = story.person === me.id;
  const person = personFor(story.person);
  const liked = useStore((state) => state.storiesLiked.includes(story.person));
  const name = mine ? copy.story.yours : (person?.first ?? "");

  const ty = useSharedValue(0);
  const enter = useSharedValue(0);
  const fade = useSharedValue(1);
  const progress = useSharedValue(0);
  const armed = useSharedValue(false); // gestures count only once the card has arrived
  const heart = useSharedValue(1);
  const [wasOpen, setWasOpen] = useState(false);

  const markSeen = useCallback(() => {
    if (!mine) useStore.getState().seeStory(story.person);
  }, [mine, story.person]);

  const leave = useCallback(() => {
    markSeen();
    closeStory();
  }, [markSeen]);

  const step = useCallback(
    (direction: 1 | -1) => {
      const next = stepStory(story, direction);
      if (direction === 1) markSeen();
      if (next) {
        haptics.select();
        showStory(next); // keeps the card; swaps what is on it
      } else if (direction === 1) {
        leave();
      } else {
        progress.set(0);
      }
    },
    [story, markSeen, leave, progress],
  );

  // Arrival and departure of the card.
  useEffect(() => {
    if (open && !wasOpen) {
      setWasOpen(true);
      ty.set(0);
      armed.set(false);
      enter.set(0);
      enter.set(
        withDelay(
          ENTER_DELAY,
          withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) }, (done) => {
            if (done) armed.set(true);
          }),
        ),
      );
    } else if (!open && wasOpen) {
      setWasOpen(false);
      armed.set(false);
      cancelAnimation(progress);
      ty.set(withTiming(height * 0.5, { duration: 240, easing: Easing.in(Easing.cubic) }));
      enter.set(withTiming(0, { duration: 200 }));
    }
  }, [open, wasOpen, armed, enter, height, progress, ty]);

  // Each story (including the first) restarts the timer; a swap cross-fades the card's content.
  useEffect(() => {
    if (!open) return;
    fade.set(0);
    fade.set(withTiming(1, { duration: 200 }));
    progress.set(0);
    progress.set(
      withDelay(
        ENTER_DELAY,
        withTiming(1, { duration: storyDuration, easing: Easing.linear, reduceMotion: ReduceMotion.Never }, (done) => {
          if (done) scheduleOnRN(step, 1);
        }),
      ),
    );
    return () => cancelAnimation(progress);
  }, [open, story, fade, progress, step]);

  // Android back closes the story.
  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      leave();
      return true;
    });
    return () => sub.remove();
  }, [open, leave]);

  const pause = () => cancelAnimation(progress);
  const resume = () => {
    const left = 1 - progress.get();
    progress.set(
      withTiming(1, { duration: left * storyDuration, easing: Easing.linear, reduceMotion: ReduceMotion.Never }, (done) => {
        if (done) scheduleOnRN(step, 1);
      }),
    );
  };

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e, success) => {
      if (!success || !armed.get()) return;
      step(e.x < width * 0.3 ? -1 : 1);
    });
  const hold = Gesture.LongPress()
    .minDuration(220)
    .runOnJS(true)
    .onStart(pause)
    .onFinalize((_e, success) => {
      if (success) resume();
    });
  const pan = Gesture.Pan()
    .activeOffsetY(10)
    .onChange((e) => {
      ty.set(Math.max(0, ty.get() + e.changeY));
    })
    .onEnd((e) => {
      if (ty.get() > 120 || e.velocityY > 900) scheduleOnRN(leave);
      else ty.set(withSpring(0, { ...SNAP, velocity: e.velocityY }));
    });
  const surface = Gesture.Exclusive(pan, hold, tap);

  const backdrop = useAnimatedStyle(() => ({ opacity: enter.get() * (1 - ty.get() / height) }));
  const card = useAnimatedStyle(() => {
    const e = enter.get();
    const t = ty.get();
    return {
      opacity: e,
      transform: [
        { translateY: reduced ? 0 : t + (1 - e) * 28 },
        { scale: reduced ? 1 : (0.94 + 0.06 * e) * (1 - (t / height) * 0.18) },
      ],
    };
  });
  const contentStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));
  const trackWidth = width - 2 * Space[4];
  const bar = useAnimatedStyle(() => ({ width: progress.get() * trackWidth }));
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heart.get() }] }));

  const photo = "photo" in story ? photos[story.photo] : undefined;

  return (
    <View collapsable={false} style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]} />
      <Animated.View
        style={[styles.card, { top: insets.top + Space[1], bottom: Math.max(insets.bottom, Space[3]) }, card]}
      >
        <Animated.View style={[StyleSheet.absoluteFill, contentStyle]}>
          {photo ? (
            <>
              {/* The whole photo over a blurred copy of itself. */}
              <Image source={photo.source} blurRadius={40} contentFit="cover" transition={0} style={StyleSheet.absoluteFill} />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.18)" }]} />
              <View style={styles.photoStage}>
                <Image
                  source={photo.source}
                  alt={photo.alt}
                  contentFit="contain"
                  transition={0}
                  style={{ width: "100%", aspectRatio: photo.width / photo.height }}
                />
              </View>
            </>
          ) : "text" in story ? (
            <LinearGradient colors={[...story.colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.textStage]}>
              <Text style={styles.storyText}>{story.text}</Text>
            </LinearGradient>
          ) : null}
        </Animated.View>

        {/* The gesture surface sits under the controls, so the buttons stay ordinary buttons. */}
        <GestureDetector gesture={surface}>
          <Animated.View style={StyleSheet.absoluteFill} aria-label={copy.story.next} />
        </GestureDetector>

        <LinearGradient colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0)"]} style={[styles.topScrim, pointer.none]} />
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.45)"]} style={[styles.bottomScrim, pointer.none]} />

        <View style={[styles.track, pointer.none]}>
          <Animated.View style={[styles.fill, bar]} />
        </View>
        <View style={[styles.header, open ? pointer.boxNone : pointer.none]}>
          {person && <Avatar person={person} size={36} />}
          <Text style={[Type.name, styles.white]}>{name}</Text>
          <Text style={[Type.meta, styles.dim]}>{story.ago}</Text>
          <View style={styles.spacer} />
          <GlassButton
            icon="close"
            iconSize={15}
            size={40}
            label={copy.story.close}
            effect="clear"
            tint={GLASS_TINT}
            iconColor="#FFFFFF"
            shadow={false}
            onPress={leave}
            testID="story-close"
          />
        </View>

        {photo && "caption" in story && story.caption ? (
          <Text style={[Type.body, styles.caption]} numberOfLines={2}>
            {story.caption}
          </Text>
        ) : null}

        <View style={[styles.footer, open ? pointer.boxNone : pointer.none]}>
          {mine ? (
            <View style={styles.seen}>
              <Icon name="eye" size={18} color="#FFFFFF" />
              <Text style={[Type.meta, styles.white, { fontWeight: "600" }]}>{copy.story.seenBy(story.views ?? 0)}</Text>
            </View>
          ) : (
            <>
              <Pressable
                role="button"
                aria-label={copy.story.reply(name)}
                onPress={() => {
                  leave();
                  router.push({ pathname: "/chat/[id]", params: { id: story.person } });
                }}
                style={{ flex: 1 }}
              >
                <Glass effect="clear" tint={GLASS_TINT} style={styles.reply}>
                  <Text style={[Type.body, styles.replyText]}>{copy.story.reply(name)}</Text>
                </Glass>
              </Pressable>
              <GlassButton
                label={liked ? copy.story.unlike : copy.story.like}
                size={48}
                effect="clear"
                tint={GLASS_TINT}
                shadow={false}
                testID="story-like"
                onPress={() => {
                  useStore.getState().toggleStoryLike(story.person);
                  heart.set(1.35);
                  heart.set(withSpring(1, POP));
                }}
              >
                <Animated.View style={heartStyle}>
                  <Heart filled={liked} size={21} color="#FFFFFF" />
                </Animated.View>
              </GlassButton>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "#000000" },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: Radius.panel,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: "#141210",
  },
  photoStage: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center" },
  textStage: { alignItems: "center", justifyContent: "center", padding: 36 },
  storyText: { color: "#FFFFFF", fontSize: 30, lineHeight: 38, fontWeight: "700", letterSpacing: -0.8, textAlign: "center" },
  topScrim: { position: "absolute", top: 0, left: 0, right: 0, height: 150 },
  bottomScrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 200 },
  track: {
    position: "absolute",
    top: Space[4],
    left: Space[4],
    right: Space[4],
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
  },
  fill: { height: 3, borderRadius: 1.5, backgroundColor: "#FFFFFF" },
  header: {
    position: "absolute",
    top: Space[4] + 14,
    left: Space[4],
    right: Space[4],
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  white: { color: "#FFFFFF" },
  dim: { color: "rgba(255,255,255,0.75)" },
  spacer: { flex: 1 },
  caption: { position: "absolute", left: Space[5], right: Space[5], bottom: 92, color: "#FFFFFF", fontWeight: "600" },
  footer: {
    position: "absolute",
    left: Space[4],
    right: Space[4],
    bottom: Space[4],
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reply: { height: 48, borderRadius: 24, justifyContent: "center", paddingHorizontal: 20 },
  replyText: { color: "rgba(255,255,255,0.92)" },
  seen: { flexDirection: "row", alignItems: "center", gap: 8, height: 48, paddingHorizontal: 4 },
});
