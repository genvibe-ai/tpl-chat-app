/**
 * A bottom sheet of actions (pin, mute, mark as read…). Rendered inside the
 * screen rather than in a Modal, so it works the same on every platform.
 * The Android back button closes it.
 */
import { useEffect } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Space, Type } from "@/constants/theme";
import { haptics } from "@/lib/haptics";
import { motion } from "@/lib/motion";
import { useTheme } from "@/lib/theme";
import { Glass, useNativeGlass } from "./Glass";
import { Icon, type IconName } from "./Icon";

export type SheetAction = { label: string; icon: IconName; onPress: () => void; destructive?: boolean };

export function ActionSheet({
  open,
  title,
  actions,
  cancelLabel,
  onClose,
}: {
  open: boolean;
  title?: string;
  actions: SheetAction[];
  cancelLabel: string;
  onClose: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const native = useNativeGlass();
  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [open, onClose]);
  if (!open) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 50 }]}>
      <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(140)} style={StyleSheet.absoluteFill}>
        <Pressable
          aria-label={cancelLabel}
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: t.scrim }]}
        />
      </Animated.View>
      <Animated.View
        entering={motion.sheetIn}
        exiting={motion.sheetOut}
        style={{
          position: "absolute",
          left: Space[3],
          right: Space[3],
          bottom: Math.max(insets.bottom, Space[3]),
          gap: Space[2],
        }}
      >
        <View style={{ borderRadius: 28, boxShadow: native ? undefined : `0 12px 36px ${t.shadow}` }}>
          <Glass style={{ borderRadius: 28, paddingVertical: Space[2] }}>
            {title ? (
              <Text
                numberOfLines={1}
                style={[Type.caption, { color: t.secondary, textAlign: "center", paddingVertical: Space[2] }]}
              >
                {title}
              </Text>
            ) : null}
            {actions.map((action, index) => (
              <Pressable
                key={action.label}
                role="button"
                aria-label={action.label}
                onPress={() => {
                  haptics.select();
                  onClose();
                  action.onPress();
                }}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: pressed ? t.pressed : "transparent",
                    borderTopWidth: index === 0 && !title ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: t.hairline,
                  },
                ]}
              >
                <Icon name={action.icon} size={20} color={action.destructive ? t.accentText : t.label} />
                <Text style={[Type.body, { color: action.destructive ? t.accentText : t.label }]}>{action.label}</Text>
              </Pressable>
            ))}
          </Glass>
        </View>
        <Pressable
          role="button"
          aria-label={cancelLabel}
          onPress={onClose}
          style={({ pressed }) => [{ borderRadius: 24, opacity: pressed ? 0.85 : 1 }]}
        >
          <View style={{ borderRadius: 24, backgroundColor: t.surface, paddingVertical: 15, alignItems: "center" }}>
            <Text style={[Type.body, { color: t.label, fontWeight: "600" }]}>{cancelLabel}</Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
});
