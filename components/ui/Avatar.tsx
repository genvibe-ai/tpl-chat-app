/**
 * Round portraits with a soft glass sheen (a window reflection and a rim of
 * light), drawn with plain views so it looks the same on every platform.
 * People without a portrait get their initials; groups show two members.
 */
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { storyRing, type Person } from "@/constants/content";
import { pointer } from "@/lib/pointer";
import { useTheme } from "@/lib/theme";

export type Ring = "unseen" | "seen" | "none";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "")).toUpperCase();
}

/** One face: portrait or initials, with the sheen. */
const Face = memo(function Face({ person, size }: { person: Person; size: number }) {
  const t = useTheme();
  const round = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[round, { overflow: "hidden", backgroundColor: person.tint?.bg ?? t.chip }]}>
      {person.avatar ? (
        <Image
          source={person.avatar}
          style={round}
          contentFit="cover"
          transition={0}
          accessibilityIgnoresInvertColors
          alt={person.name}
        />
      ) : (
        <View style={[round, styles.center]}>
          <Text
            style={{
              color: person.tint?.fg ?? t.label,
              fontSize: size * 0.36,
              fontWeight: "600",
              letterSpacing: -0.4,
            }}
          >
            {initials(person.name)}
          </Text>
        </View>
      )}
      {/* The glass: light gathered at the upper left, and a hairline rim. */}
      <LinearGradient
        colors={["rgba(255,255,255,0.30)", "rgba(255,255,255,0.06)", "rgba(255,255,255,0)"]}
        locations={[0, 0.38, 0.62]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.7, y: 0.9 }}
        style={[StyleSheet.absoluteFill, pointer.none]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          pointer.none,
          { borderRadius: size / 2, borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" },
        ]}
      />
    </View>
  );
});

export const Avatar = memo(function Avatar({
  person,
  group,
  size,
  ring = "none",
  online = false,
  style,
}: {
  person?: Person;
  /** Members of a group chat: the first two are shown overlapping. */
  group?: Person[];
  size: number;
  ring?: Ring;
  online?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const ringWidth = ring === "none" ? 0 : ring === "seen" ? 1.5 : Math.max(2, size * 0.04);
  const gap = ring === "none" ? 0 : Math.max(2, size * 0.04);
  const inner = size - 2 * (ringWidth + gap);
  const seat = { boxShadow: `0 ${Math.round(size * 0.05)}px ${Math.round(size * 0.14)}px ${t.shadow}` };

  let face;
  if (group && group.length > 1) {
    const small = inner * 0.7;
    face = (
      <View style={{ width: inner, height: inner }}>
        <View style={[{ position: "absolute", right: 0, top: 0 }, seat, { borderRadius: small / 2 }]}>
          <Face person={group[1]} size={small} />
        </View>
        <View
          style={[
            {
              position: "absolute",
              left: 0,
              bottom: 0,
              padding: 2,
              borderRadius: small / 2 + 2,
              backgroundColor: t.bg,
            },
          ]}
        >
          <Face person={group[0]} size={small - 4} />
        </View>
      </View>
    );
  } else if (person) {
    face = (
      <View style={[{ borderRadius: inner / 2 }, seat]}>
        <Face person={person} size={inner} />
      </View>
    );
  } else {
    face = <View style={{ width: inner, height: inner }} />;
  }

  return (
    <View style={[{ width: size, height: size }, styles.center, style]}>
      {ring === "unseen" && (
        <>
          <LinearGradient
            colors={[...storyRing]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
          />
          {/* The gap between ring and face, in the page colour. */}
          <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, margin: ringWidth, backgroundColor: t.bg }]} />
        </>
      )}
      {ring === "seen" && (
        <View
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderWidth: ringWidth, borderColor: t.seenRing }]}
        />
      )}
      {face}
      {online && (
        <View
          style={{
            position: "absolute",
            right: size * 0.02,
            bottom: size * 0.02,
            width: Math.max(10, size * 0.22),
            height: Math.max(10, size * 0.22),
            borderRadius: size,
            backgroundColor: t.online,
            borderWidth: Math.max(2, size * 0.045),
            borderColor: t.bg,
          }}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
