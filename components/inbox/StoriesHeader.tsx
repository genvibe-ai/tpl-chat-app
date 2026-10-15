/**
 * The Chats header and its story row. Scroll the list down and the stories
 * fold into a little cluster beside the title; pull down (or tap the cluster)
 * and they unfold again. Every position comes from one scroll-driven progress
 * value on the UI thread.
 */
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
  type SharedValue,
} from "react-native-reanimated";
import { copy, me, type Story } from "@/constants/content";
import { Type } from "@/constants/theme";
import { personFor } from "@/lib/chats";
import { useStorySeen } from "@/lib/stories";
import { useTheme } from "@/lib/theme";
import { withAlpha } from "@/lib/color";
import { pointer } from "@/lib/pointer";
import { Avatar } from "../ui/Avatar";
import { GlassButton } from "../ui/GlassButton";
import { Icon } from "../ui/Icon";
import { PressScale } from "../ui/PressScale";

/** Geometry shared with the list (components/inbox/InboxScreen.tsx). */
export const NAV_H = 56;
export const STORIES_H = 108;
const AV = 64; // an unfolded story
const GAP = 14;
const PAD = 16;
const MINI = 26; // a story folded into the title
const MINI_STEP = 17;
const CLUSTER_COUNT = 3;
const CLUSTER_W = MINI + (CLUSTER_COUNT - 1) * MINI_STEP;
const TITLE_GAP = 8;

const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);

type Props = {
  progress: SharedValue<number>; // 0 folded → 1 open, follows the finger
  stretch: SharedValue<number>; // pull beyond open, in points
  stories: Story[];
  width: number;
  insetTop: number;
  isOpen: boolean;
  onPressCluster: () => void;
  onPressStory: (story: Story) => void;
  onPressCompose: () => void;
  onPressProfile: () => void;
};

export function StoriesHeader({
  progress,
  stretch,
  stories,
  width,
  insetTop,
  isOpen,
  onPressCluster,
  onPressStory,
  onPressCompose,
  onPressProfile,
}: Props) {
  const t = useTheme();
  const [titleWidth, setTitleWidth] = useState(48);
  const railRef = useAnimatedRef<Animated.ScrollView>();
  const sx = useScrollOffset(railRef);

  // Once folded, quietly rewind the row so the cluster is always the first three.
  useEffect(() => {
    if (!isOpen) railRef.current?.scrollTo({ x: 0, animated: false });
  }, [isOpen, railRef]);

  const groupW = CLUSTER_W + TITLE_GAP + titleWidth;
  const clusterLeft = (width - groupW) / 2;
  const clusterCY = insetTop + NAV_H / 2;
  const slotCY = insetTop + NAV_H + 6 + AV / 2;
  const titleShift = (CLUSTER_W + TITLE_GAP) / 2;

  const titleStyle = useAnimatedStyle(() => {
    const px = easeInOut(interpolate(progress.get(), [0.1, 1], [0, 1], Extrapolation.CLAMP));
    return { transform: [{ translateX: (1 - px) * titleShift }] };
  });
  const clusterHitStyle = useAnimatedStyle(() => ({ opacity: progress.get() < 0.5 ? 1 : 0 }));

  return (
    <View style={[styles.root, { height: insetTop + NAV_H + STORIES_H }, pointer.boxNone]}>
      {/* Solid behind the bar, then a short fade so rows slide under instead of being cut. */}
      <View style={[styles.fill, { height: insetTop + NAV_H, backgroundColor: t.bg }, pointer.none]} />
      <LinearGradient
        colors={[t.bg, withAlpha(t.bg, 0)]}
        style={[{ position: "absolute", top: insetTop + NAV_H, left: 0, right: 0, height: 24 }, pointer.none]}
      />

      {/* The row spans the whole header so stories can travel up into the bar unclipped. */}
      <Animated.ScrollView
        ref={railRef}
        horizontal
        scrollEnabled={isOpen}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        style={[StyleSheet.absoluteFill, isOpen ? pointer.auto : pointer.none]}
        contentContainerStyle={{ paddingTop: insetTop + NAV_H + 6, paddingHorizontal: PAD, gap: GAP }}
      >
        {stories.map((story, index) => (
          <StoryItem
            key={story.person}
            story={story}
            index={index}
            progress={progress}
            stretch={stretch}
            sx={sx}
            clusterLeft={clusterLeft}
            clusterCY={clusterCY}
            slotCY={slotCY}
            isOpen={isOpen}
            onPress={() => onPressStory(story)}
          />
        ))}
      </Animated.ScrollView>

      {/* The bar */}
      <View style={[styles.bar, { top: insetTop, height: NAV_H }, pointer.boxNone]}>
        <PressScale label={copy.inbox.profile} onPress={onPressProfile} scaleTo={0.9} hitSlop={8}>
          <Avatar person={personFor("me")} size={40} />
        </PressScale>
        <View style={[styles.titleWrap, pointer.boxNone]}>
          <Animated.Text
            role="heading"
            onLayout={(e) => setTitleWidth(Math.round(e.nativeEvent.layout.width))}
            style={[Type.navTitle, { color: t.label }, titleStyle]}
          >
            {copy.inbox.title}
          </Animated.Text>
        </View>
        <GlassButton icon="compose" iconSize={19} label={copy.inbox.newChat} onPress={onPressCompose} />
        {!isOpen && (
          <Animated.View
            style={[
              styles.clusterHit,
              clusterHitStyle,
              { left: clusterLeft - 8, top: (NAV_H - 44) / 2, width: CLUSTER_W + 16 },
            ]}
          >
            <Pressable aria-label={copy.inbox.showStories} role="button" onPress={onPressCluster} style={StyleSheet.absoluteFill} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

type ItemProps = {
  story: Story;
  index: number;
  progress: SharedValue<number>;
  stretch: SharedValue<number>;
  sx: SharedValue<number>;
  clusterLeft: number;
  clusterCY: number;
  slotCY: number;
  isOpen: boolean;
  onPress: () => void;
};

function StoryItem({ story, index, progress, stretch, sx, clusterLeft, clusterCY, slotCY, isOpen, onPress }: ItemProps) {
  const t = useTheme();
  const mine = story.person === me.id;
  const person = personFor(story.person);
  const seen = useStorySeen(story);
  const clusterK = index - 1; // the three after yours tuck into the title
  const inCluster = clusterK >= 0 && clusterK < CLUSTER_COUNT;
  const slotCX = PAD + index * (AV + GAP) + AV / 2;
  const targetCX = inCluster ? clusterLeft + clusterK * MINI_STEP + MINI / 2 : clusterLeft + CLUSTER_W / 2;

  const avatarStyle = useAnimatedStyle(() => {
    const p = progress.get();
    const s = stretch.get();
    const py = easeOut(interpolate(p, [0, 0.6], [0, 1], Extrapolation.CLAMP));
    const px = easeInOut(interpolate(p, [0.12, 1], [0, 1], Extrapolation.CLAMP));
    const dx = targetCX - (slotCX - sx.get());
    const dy = clusterCY - slotCY;
    const pull = s * 0.45; // follows the finger past open, like a rubber band
    if (inCluster) {
      const scale = MINI / AV + (1 - MINI / AV) * easeOut(p);
      return {
        opacity: 1,
        transform: [{ translateX: (1 - px) * dx }, { translateY: (1 - py) * dy + pull }, { scale: scale * (1 + s / 900) }],
      };
    }
    // Everyone else emerges from behind the cluster.
    const travel = mine ? 0.5 : 0.35;
    return {
      opacity: interpolate(p, [0.3, 0.78], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateX: (1 - px) * dx * travel },
        { translateY: (1 - py) * dy + pull },
        { scale: (0.55 + 0.45 * easeOut(p)) * (1 + s / 900) },
      ],
    };
  });

  // A ring in the page colour keeps overlapping cluster faces apart.
  const separatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0.35, 0.7], [1, 0], Extrapolation.CLAMP),
  }));
  const labelStyle = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: interpolate(p, [0.55, 1], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateY: (1 - p) * 10 + stretch.get() * 0.45 }],
    };
  });

  const label = mine ? copy.inbox.yourStory : (person?.first ?? "");
  return (
    // Not `disabled`: on the web a disabled Pressable lets its children catch taps.
    <Pressable
      onPress={() => {
        if (isOpen) onPress();
      }}
      role="button"
      aria-label={mine ? copy.story.yours : copy.story.open(person?.first ?? "")}
      style={[styles.item, { zIndex: inCluster ? 100 - index : 50 - index }]}
    >
      <Animated.View style={[styles.avatarBox, avatarStyle]}>
        <Animated.View style={[styles.separator, separatorStyle, { borderColor: t.bg }, pointer.none]} />
        <Avatar person={person} size={AV} ring={mine ? "seen" : seen ? "seen" : "unseen"} />
        {mine && (
          <View style={[styles.add, { backgroundColor: t.accent, borderColor: t.bg }]}>
            <Icon name="add" size={13} color={t.onAccent} weight="bold" />
          </View>
        )}
      </Animated.View>
      <Animated.Text numberOfLines={1} style={[Type.caption, styles.label, { color: t.secondary }, labelStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { position: "absolute", top: 0, left: 0, right: 0 },
  fill: { position: "absolute", top: 0, left: 0, right: 0 },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PAD,
  },
  titleWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  clusterHit: { position: "absolute", height: 44 },
  item: { width: AV, alignItems: "center" },
  avatarBox: { width: AV, height: AV, alignItems: "center", justifyContent: "center" },
  separator: {
    position: "absolute",
    width: AV + 8,
    height: AV + 8,
    borderRadius: (AV + 8) / 2,
    borderWidth: 4,
    top: -4,
    left: -4,
  },
  add: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { marginTop: 7, maxWidth: AV + 10 },
});
