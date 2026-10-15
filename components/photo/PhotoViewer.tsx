/**
 * A shared photo, full screen. Pinch or double-tap to zoom, drag to look
 * around, swipe down to close, tap to hide the controls.
 */
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { copy, photos, type Message } from "@/constants/content";
import { Space, Type } from "@/constants/theme";
import { useAppWidth } from "@/hooks/useAppWidth";
import { personFor, type ChatInfo } from "@/lib/chats";
import { haptics } from "@/lib/haptics";
import { pointer } from "@/lib/pointer";
import { POP, SNAP } from "@/lib/motion";
import { useStore } from "@/lib/store";
import { Avatar } from "../ui/Avatar";
import { GlassButton } from "../ui/GlassButton";
import { Heart } from "../ui/Heart";
import { Icon } from "../ui/Icon";
import { PressScale } from "../ui/PressScale";

const MAX_ZOOM = 4;
const GLASS_TINT = "rgba(255, 255, 255, 0.14)";

export function PhotoViewer({ info, message }: { info: ChatInfo; message: Message }) {
  const photo = photos[message.photo!];
  const insets = useSafeAreaInsets();
  const width = useAppWidth();
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const sender = personFor(message.from);
  const liked = message.reactions?.some((r) => r.from === "me" && r.emoji === "❤️") ?? false;
  const [chrome, setChrome] = useState(true);

  const fitW = width;
  const fitH = Math.min(height, (width * photo.height) / photo.width);

  const enter = useSharedValue(reduced ? 1 : 0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const drag = useSharedValue(0);
  const heart = useSharedValue(1);

  useEffect(() => {
    enter.set(withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) }));
  }, [enter]);

  const close = () => (router.canGoBack() ? router.back() : router.replace({ pathname: "/chat/[id]", params: { id: info.id } }));
  const toggleChrome = () => setChrome((shown) => !shown);

  // Keep a zoomed photo's edges on screen.
  const clamp = (value: number, s: number, size: number, viewport: number) => {
    "worklet";
    const limit = Math.max(0, (size * s - viewport) / 2);
    return Math.min(limit, Math.max(-limit, value));
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.set(Math.min(MAX_ZOOM, Math.max(1, savedScale.get() * e.scale)));
    })
    .onEnd(() => {
      if (scale.get() < 1.05) {
        scale.set(withSpring(1, SNAP));
        tx.set(withSpring(0, SNAP));
        ty.set(withSpring(0, SNAP));
        savedScale.set(1);
        savedTx.set(0);
        savedTy.set(0);
      } else {
        savedScale.set(scale.get());
        tx.set(withSpring(clamp(tx.get(), scale.get(), fitW, width), SNAP));
        ty.set(withSpring(clamp(ty.get(), scale.get(), fitH, height), SNAP));
        savedTx.set(clamp(tx.get(), scale.get(), fitW, width));
        savedTy.set(clamp(ty.get(), scale.get(), fitH, height));
      }
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      if (scale.get() > 1.01) {
        tx.set(savedTx.get() + e.translationX);
        ty.set(savedTy.get() + e.translationY);
      } else {
        drag.set(e.translationY);
      }
    })
    .onEnd((e) => {
      if (scale.get() > 1.01) {
        const nx = clamp(tx.get(), scale.get(), fitW, width);
        const ny = clamp(ty.get(), scale.get(), fitH, height);
        tx.set(withSpring(nx, SNAP));
        ty.set(withSpring(ny, SNAP));
        savedTx.set(nx);
        savedTy.set(ny);
        return;
      }
      if (Math.abs(drag.get()) > 120 || Math.abs(e.velocityY) > 900) {
        drag.set(withTiming(Math.sign(drag.get() || 1) * height, { duration: 220 }));
        scheduleOnRN(close);
      } else {
        drag.set(withSpring(0, { ...SNAP, velocity: e.velocityY }));
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(260)
    .onEnd((e, success) => {
      if (!success) return;
      if (scale.get() > 1.01) {
        scale.set(withSpring(1, SNAP));
        tx.set(withSpring(0, SNAP));
        ty.set(withSpring(0, SNAP));
        savedScale.set(1);
        savedTx.set(0);
        savedTy.set(0);
      } else {
        const target = 2.5;
        // Zoom towards the tapped point.
        const nx = clamp((width / 2 - e.absoluteX) * (target - 1), target, fitW, width);
        const ny = clamp((height / 2 - e.absoluteY) * (target - 1), target, fitH, height);
        scale.set(withSpring(target, SNAP));
        tx.set(withSpring(nx, SNAP));
        ty.set(withSpring(ny, SNAP));
        savedScale.set(target);
        savedTx.set(nx);
        savedTy.set(ny);
      }
    });
  const singleTap = Gesture.Tap().onEnd((_e, success) => {
    if (success) scheduleOnRN(toggleChrome);
  });
  const gesture = Gesture.Simultaneous(pinch, pan, Gesture.Exclusive(doubleTap, singleTap));

  const backdrop = useAnimatedStyle(() => ({
    opacity: enter.get() * interpolate(Math.abs(drag.get()), [0, height * 0.6], [1, 0.25], "clamp"),
  }));
  const imageStyle = useAnimatedStyle(() => {
    const pull = Math.abs(drag.get());
    return {
      opacity: enter.get(),
      transform: [
        { translateX: tx.get() },
        { translateY: ty.get() + drag.get() },
        { scale: scale.get() * (0.94 + 0.06 * enter.get()) * (1 - Math.min(pull / height, 0.4) * 0.3) },
      ],
    };
  });
  const chromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(drag.get()), [0, 80], [1, 0], "clamp") * enter.get(),
  }));
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heart.get() }] }));

  const toggleLike = () => {
    useStore.getState().setMyReaction(info.id, message.id, liked ? null : "❤️");
    haptics.light();
    heart.set(1.35);
    heart.set(withSpring(1, POP));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Animated.View style={[StyleSheet.absoluteFill, styles.black, backdrop]} />
      <GestureDetector gesture={gesture}>
        <View style={styles.stage} collapsable={false}>
          <Animated.View style={imageStyle}>
            <Image
              source={photo.source}
              alt={photo.alt}
              contentFit="contain"
              transition={0}
              style={{ width: fitW, height: fitH }}
            />
          </Animated.View>
        </View>
      </GestureDetector>

      {chrome && (
        <>
          <Animated.View style={[styles.top, { paddingTop: insets.top + Space[2] }, chromeStyle]}>
            <LinearGradient colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0)"]} style={[StyleSheet.absoluteFill, pointer.none]} />
            <GlassButton icon="close" iconSize={16} label={copy.photo.close} onPress={close} effect="clear" tint={GLASS_TINT} iconColor="#FFFFFF" shadow={false} testID="photo-close" />
            <View style={styles.who}>
              {sender && <Avatar person={sender} size={32} />}
              <View>
                <Text style={[Type.navTitle, styles.white]} numberOfLines={1}>
                  {sender ? copy.photo.from(sender.name) : info.title}
                </Text>
                <Text style={[Type.caption, styles.dim]}>{copy.thread.daySeparator(message.day, message.time)}</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.bottom, { paddingBottom: insets.bottom + Space[4] }, chromeStyle]}>
            <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]} style={[StyleSheet.absoluteFill, pointer.none]} />
            {!!message.text && <Text style={[Type.body, styles.white]}>{message.text}</Text>}
            <View style={styles.actions}>
              <PressScale label={liked ? copy.photo.unreact : copy.photo.react} onPress={toggleLike} style={styles.action} testID="photo-like">
                <Animated.View style={heartStyle}>
                  <Heart filled={liked} size={22} color="#FFFFFF" />
                </Animated.View>
              </PressScale>
              <PressScale label={copy.photo.reply} onPress={close} style={[styles.action, styles.reply]}>
                <Icon name="reply" size={19} color="#FFFFFF" />
                <Text style={[Type.meta, styles.white, { fontWeight: "600" }]}>{copy.photo.reply}</Text>
              </PressScale>
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "transparent" },
  black: { backgroundColor: "#050505" },
  stage: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  top: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Space[3],
    paddingHorizontal: Space[4],
    paddingBottom: Space[6],
  },
  who: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  white: { color: "#FFFFFF" },
  dim: { color: "rgba(255,255,255,0.72)" },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: Space[5], paddingTop: Space[8], gap: Space[4] },
  actions: { flexDirection: "row", alignItems: "center", gap: Space[3] },
  action: {
    height: 46,
    minWidth: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  reply: { flexDirection: "row", gap: 8, paddingHorizontal: 18 },
});
