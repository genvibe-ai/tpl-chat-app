import type { PropsWithChildren } from "react";
import { Pressable, type Role, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { haptics } from "@/lib/haptics";
import { EASE_OUT, PRESS_MS } from "@/lib/motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** A pressable that dips a little under the finger. Feedback lands on press-in. */
export function PressScale({
  children,
  label,
  onPress,
  onLongPress,
  style,
  scaleTo = 0.94,
  hitSlop = 6,
  disabled = false,
  role = "button",
  selected,
  checked,
  haptic = true,
  testID,
}: PropsWithChildren<{
  label: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  hitSlop?: number;
  disabled?: boolean;
  role?: Role;
  selected?: boolean;
  checked?: boolean;
  haptic?: boolean;
  testID?: string;
}>) {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <AnimatedPressable
      role={role}
      aria-label={label}
      aria-selected={selected}
      aria-checked={checked}
      aria-disabled={disabled}
      testID={testID}
      hitSlop={hitSlop}
      disabled={disabled}
      onPressIn={() => {
        if (!reduced) scale.set(withTiming(scaleTo, { duration: PRESS_MS, easing: EASE_OUT }));
      }}
      onPressOut={() => scale.set(withTiming(1, { duration: 220, easing: EASE_OUT }))}
      onPress={() => {
        if (haptic) haptics.select();
        onPress?.();
      }}
      onLongPress={
        onLongPress
          ? () => {
              haptics.medium();
              onLongPress();
            }
          : undefined
      }
      style={[style, animated]}
    >
      {children}
    </AnimatedPressable>
  );
}
