/**
 * Your profile and settings: status, appearance (System / Light / Dark),
 * read receipts, message previews, typing indicators, haptics and a reset
 * for the sample chats. Every switch changes something you can see.
 */
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState, type PropsWithChildren } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { brand, copy, me } from "@/constants/content";
import { Space, Type } from "@/constants/theme";
import { ME } from "@/lib/chats";
import { haptics } from "@/lib/haptics";
import { SNAP } from "@/lib/motion";
import { cancelAllReplies } from "@/lib/replies";
import { useStore, type Appearance, type Settings } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { showToast } from "@/lib/toast";
import { Avatar } from "../ui/Avatar";
import { GlassButton } from "../ui/GlassButton";
import { Icon, type IconName } from "../ui/Icon";
import { PressScale } from "../ui/PressScale";

function Section({ title, children }: PropsWithChildren<{ title: string }>) {
  const t = useTheme();
  return (
    <View style={{ marginTop: Space[6] }}>
      <Text role="heading" style={[Type.section, { color: t.secondary, marginLeft: Space[4], marginBottom: Space[2] }]}>
        {title.toUpperCase()}
      </Text>
      <View style={[styles.card, { backgroundColor: t.surface }]}>{children}</View>
    </View>
  );
}

function Row({ icon, label, hint, last, children }: PropsWithChildren<{ icon: IconName; label: string; hint?: string; last?: boolean }>) {
  const t = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline }]}>
      <View style={[styles.rowIcon, { backgroundColor: t.accentSoft }]}>
        <Icon name={icon} size={17} color={t.accentText} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[Type.body, { color: t.label }]}>{label}</Text>
        {hint ? <Text style={[Type.meta, { color: t.secondary }]}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Toggle({ setting, icon, label, hint, last }: { setting: keyof Omit<Settings, "appearance">; icon: IconName; label: string; hint: string; last?: boolean }) {
  const t = useTheme();
  const value = useStore((state) => state.settings[setting]);
  return (
    <Row icon={icon} label={label} hint={hint} last={last}>
      <Switch
        aria-label={label}
        value={value}
        onValueChange={(next) => {
          useStore.getState().setSetting(setting, next);
          haptics.select();
        }}
        trackColor={{ false: t.chip, true: t.accent }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={t.chip}
        {...(Platform.OS === "web" ? { activeThumbColor: "#FFFFFF" } : null)}
      />
    </Row>
  );
}

const APPEARANCES: Appearance[] = ["system", "light", "dark"];

/** System / Light / Dark, with a thumb that slides to the choice. */
function AppearancePicker() {
  const t = useTheme();
  const value = useStore((state) => state.settings.appearance);
  const [width, setWidth] = useState(0);
  const slot = (width - 8) / APPEARANCES.length;
  const index = APPEARANCES.indexOf(value);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: withSpring(index * slot, SNAP) }] }), [index, slot]);
  return (
    <View
      role="radiogroup"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.segmented, { backgroundColor: t.chip }]}
    >
      {width > 0 && <Animated.View style={[styles.thumb, { width: slot, backgroundColor: t.surface, boxShadow: `0 2px 8px ${t.shadow}` }, thumb]} />}
      {APPEARANCES.map((option) => (
        <Pressable
          key={option}
          role="radio"
          aria-checked={option === value}
          aria-label={copy.profile.appearanceOptions[option]}
          testID={`appearance-${option}`}
          onPress={() => {
            haptics.select();
            useStore.getState().setSetting("appearance", option);
          }}
          style={styles.segment}
        >
          <Text style={[Type.meta, { color: t.label, fontWeight: option === value ? "700" : "500" }]}>
            {copy.profile.appearanceOptions[option]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function ProfileScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const status = useStore((state) => state.status);
  const [confirm, setConfirm] = useState(false);
  // iOS shows this screen as a sheet that already sits below the status bar.
  const top = Platform.OS === "ios" ? Space[5] : insets.top + Space[3];

  const reset = () => {
    cancelAllReplies();
    useStore.getState().resetSamples();
    setConfirm(false);
    haptics.success();
    showToast(copy.toasts.reset);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: Space[4], paddingTop: top, paddingBottom: insets.bottom + Space[8] }}>
        <View style={styles.header}>
          <Text role="heading" style={[Type.navTitle, { color: t.label }]}>
            {copy.profile.title}
          </Text>
          <GlassButton icon="close" iconSize={15} size={40} label={copy.profile.close} onPress={() => router.back()} testID="profile-close" />
        </View>

        <View style={styles.hero}>
          <Avatar person={ME} size={108} />
          <Text style={[Type.largeTitle, { color: t.label, marginTop: Space[3] }]}>{me.name}</Text>
          <Text style={[Type.preview, { color: t.secondary }]}>{me.handle}</Text>
          <PressScale
            label={`${me.statuses[status]}. ${copy.profile.statusHint}`}
            onPress={() => useStore.getState().nextStatus()}
            style={[styles.status, { backgroundColor: t.surface, boxShadow: `0 4px 14px ${t.shadow}` }]}
            testID="profile-status"
          >
            <Animated.Text key={status} entering={FadeIn.duration(180)} style={[Type.preview, { color: t.label, fontWeight: "600" }]}>
              {me.statuses[status]}
            </Animated.Text>
          </PressScale>
          <Text style={[Type.caption, { color: t.secondary }]}>{copy.profile.statusHint}</Text>
        </View>

        <Section title={copy.profile.appearance}>
          <View style={{ padding: Space[2] }}>
            <AppearancePicker />
          </View>
        </Section>

        <Section title={copy.profile.chats}>
          <Toggle setting="readReceipts" icon="read" label={copy.profile.readReceipts} hint={copy.profile.readReceiptsHint} />
          <Toggle setting="previews" icon="chat" label={copy.profile.previews} hint={copy.profile.previewsHint} />
          <Toggle setting="typingIndicators" icon="more" label={copy.profile.typing} hint={copy.profile.typingHint} last />
        </Section>

        {Platform.OS !== "web" && (
          <Section title={copy.profile.feel}>
            <Toggle setting="haptics" icon="sparkles" label={copy.profile.haptics} hint={copy.profile.hapticsHint} last />
          </Section>
        )}

        <Section title={copy.profile.data}>
          <Animated.View layout={LinearTransition.duration(220)}>
            <Pressable
              role="button"
              aria-label={copy.profile.reset}
              onPress={() => setConfirm((open) => !open)}
              style={({ pressed }) => [styles.row, { backgroundColor: pressed ? t.pressed : "transparent" }]}
              testID="profile-reset"
            >
              <View style={[styles.rowIcon, { backgroundColor: t.accentSoft }]}>
                <Icon name="reset" size={17} color={t.accentText} />
              </View>
              <Text style={[Type.body, { color: t.label, flex: 1 }]}>{copy.profile.reset}</Text>
              <Icon name="chevronRight" size={14} color={t.tertiary} />
            </Pressable>
            {confirm && (
              <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} style={styles.confirm}>
                <Text style={[Type.meta, { color: t.secondary }]}>{copy.profile.resetHint}</Text>
                <View style={styles.confirmButtons}>
                  <PressScale label={copy.profile.resetCancel} onPress={() => setConfirm(false)} style={[styles.button, { backgroundColor: t.chip }]}>
                    <Text style={[Type.meta, { color: t.label, fontWeight: "600" }]}>{copy.profile.resetCancel}</Text>
                  </PressScale>
                  <PressScale label={copy.profile.resetConfirm} onPress={reset} style={[styles.button, { backgroundColor: t.accent }]} testID="profile-reset-confirm">
                    <Text style={[Type.meta, { color: t.onAccent, fontWeight: "700" }]}>{copy.profile.resetConfirm}</Text>
                  </PressScale>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </Section>

        <View style={styles.footer}>
          <Image source={brand.logo} style={styles.logo} contentFit="cover" alt={brand.name} />
          <Text style={[Type.meta, { color: t.secondary, fontWeight: "600" }]}>{copy.profile.about(brand.name, brand.version)}</Text>
          <Text style={[Type.caption, { color: t.secondary, textAlign: "center" }]}>{copy.profile.privacyNote}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: Space[2] },
  hero: { alignItems: "center", gap: 4, marginTop: Space[2] },
  status: { marginTop: Space[3], marginBottom: 2, paddingHorizontal: 18, height: 40, borderRadius: 20, justifyContent: "center" },
  card: { borderRadius: 24, borderCurve: "continuous", overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: Space[4], paddingVertical: 13, minHeight: 60 },
  rowIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  segmented: { flexDirection: "row", borderRadius: 18, padding: 4, height: 44 },
  thumb: { position: "absolute", top: 4, left: 4, bottom: 4, borderRadius: 14 },
  segment: { flex: 1, alignItems: "center", justifyContent: "center" },
  confirm: { paddingHorizontal: Space[4], paddingBottom: Space[4], gap: Space[3] },
  confirmButtons: { flexDirection: "row", gap: Space[2] },
  button: { flex: 1, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  footer: { alignItems: "center", gap: 6, marginTop: Space[8] },
  logo: { width: 44, height: 44, borderRadius: 12, marginBottom: 4 },
});
