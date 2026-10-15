/**
 * The floating composer: attach (+), the message field and a round button
 * that sends a wave when the field is empty and turns into Send as you type.
 * On iOS 26 the three glass shapes melt together (GlassGroup.ios.tsx).
 */
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { copy, photos, quickEmoji, recentPhotos, type PhotoId } from "@/constants/content";
import { Space, Type } from "@/constants/theme";
import { haptics } from "@/lib/haptics";
import { pointer } from "@/lib/pointer";
import { EASE_OUT, motion } from "@/lib/motion";
import { useScheme, useTheme } from "@/lib/theme";
import { Glass, useNativeGlass } from "../ui/Glass";
import { GlassButton } from "../ui/GlassButton";
import { GlassGroup } from "../ui/GlassGroup";
import { Icon } from "../ui/Icon";
import { PressScale } from "../ui/PressScale";
import { webNoOutline } from "../ui/SearchField";
import { Sticky } from "./Sticky";

const BUTTON = 44;

function AttachmentTray({ onPick }: { onPick: (photo: PhotoId) => void }) {
  const t = useTheme();
  const native = useNativeGlass(); // Liquid Glass draws its own shadow
  return (
    <Animated.View
      entering={motion.trayIn}
      exiting={motion.trayOut}
      style={{ marginBottom: Space[2], borderRadius: 26, boxShadow: native ? undefined : `0 10px 30px ${t.shadow}` }}
    >
      <Glass style={{ borderRadius: 26, paddingVertical: Space[3] }}>
        <Text style={[Type.caption, { color: t.secondary, paddingHorizontal: Space[4], marginBottom: Space[2] }]}>
          {copy.composer.photosTitle}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: 10, paddingHorizontal: Space[3] }}
        >
          {recentPhotos.map((id) => (
            <PressScale key={id} label={`${copy.composer.sendPhoto}: ${photos[id].alt}`} onPress={() => onPick(id)} testID={`tray-${id}`}>
              <Image
                source={photos[id].source}
                alt={photos[id].alt}
                contentFit="cover"
                transition={0}
                style={{ width: 108, height: 80, borderRadius: 16 }}
              />
            </PressScale>
          ))}
        </ScrollView>
      </Glass>
    </Animated.View>
  );
}

export function Composer({
  insetBottom,
  onSend,
  onSendPhoto,
  onHeight,
}: {
  insetBottom: number;
  onSend: (text: string) => void;
  onSendPhoto: (photo: PhotoId) => void;
  onHeight: (height: number) => void;
}) {
  const t = useTheme();
  const scheme = useScheme();
  const native = useNativeGlass();
  const [text, setText] = useState("");
  const [tray, setTray] = useState(false);
  const hasText = text.trim().length > 0;
  const sendT = useSharedValue(0);

  useEffect(() => {
    sendT.set(withTiming(hasText ? 1 : 0, { duration: 180, easing: EASE_OUT }));
  }, [hasText, sendT]);

  const sendStyle = useAnimatedStyle(() => ({
    opacity: sendT.get(),
    transform: [{ scale: 0.6 + 0.4 * sendT.get() }, { rotate: `${(1 - sendT.get()) * -40}deg` }],
  }));
  const quickStyle = useAnimatedStyle(() => ({
    opacity: 1 - sendT.get(),
    transform: [{ scale: 1 - 0.4 * sendT.get() }],
  }));

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    setText("");
    haptics.light();
    onSend(value);
  };

  return (
    <Sticky insetBottom={insetBottom} style={styles.sticky}>
      <View
        onLayout={(e) => onHeight(e.nativeEvent.layout.height)}
        style={{ paddingHorizontal: Space[3], paddingTop: Space[2], paddingBottom: insetBottom + Space[2] }}
      >
        {tray && (
          <AttachmentTray
            onPick={(photo) => {
              setTray(false);
              haptics.light();
              onSendPhoto(photo);
            }}
          />
        )}
        <GlassGroup spacing={12} style={styles.row}>
          <GlassButton
            icon={tray ? "close" : "add"}
            iconSize={19}
            label={tray ? copy.composer.closeAttach : copy.composer.attach}
            testID="composer-attach"
            onPress={() => {
              Keyboard.dismiss();
              setTray((open) => !open);
            }}
          />
          <View style={[styles.fieldWrap, { boxShadow: native ? undefined : `0 6px 18px ${t.shadow}` }]}>
            <Glass interactive style={styles.field}>
              <TextInput
                testID="composer-input"
                aria-label={copy.composer.placeholder}
                placeholder={copy.composer.placeholder}
                placeholderTextColor={t.placeholder}
                value={text}
                onChangeText={setText}
                onFocus={() => setTray(false)}
                multiline
                // Browsers would show a two-line box; the field starts at one line there.
                {...(Platform.OS === "web" ? { rows: 1 } : null)}
                submitBehavior={Platform.OS === "web" ? "submit" : "newline"}
                onSubmitEditing={submit}
                keyboardAppearance={scheme}
                selectionColor={t.accent}
                style={[Type.body, styles.input, { color: t.label }, webNoOutline]}
              />
            </Glass>
          </View>
          <View style={styles.sendSlot}>
            <Animated.View style={[StyleSheet.absoluteFill, quickStyle, hasText ? pointer.none : pointer.auto]}>
              <GlassButton label={copy.composer.quick(quickEmoji)} onPress={() => onSend(quickEmoji)} testID="composer-quick">
                <Text style={styles.quick}>{quickEmoji}</Text>
              </GlassButton>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, sendStyle, hasText ? pointer.auto : pointer.none]}>
              <PressScale
                label={copy.composer.send}
                onPress={submit}
                scaleTo={0.88}
                testID="composer-send"
                style={[styles.send, { backgroundColor: t.accent, boxShadow: `0 6px 16px ${t.shadow}` }]}
              >
                <Icon name="send" size={19} color={t.onAccent} weight="bold" />
              </PressScale>
            </Animated.View>
          </View>
        </GlassGroup>
      </View>
    </Sticky>
  );
}

const styles = StyleSheet.create({
  sticky: { position: "absolute", left: 0, right: 0, bottom: 0 },
  row: { flexDirection: "row", alignItems: "flex-end", gap: Space[2] },
  fieldWrap: { flex: 1, borderRadius: 22 },
  field: { borderRadius: 22, minHeight: BUTTON, justifyContent: "center" },
  input: {
    minHeight: BUTTON,
    maxHeight: 128,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 11 : 10,
    paddingBottom: 10,
    textAlignVertical: "center",
  },
  sendSlot: { width: BUTTON, height: BUTTON },
  send: { width: BUTTON, height: BUTTON, borderRadius: BUTTON / 2, alignItems: "center", justifyContent: "center" },
  quick: { fontSize: 21, lineHeight: 26 },
});
