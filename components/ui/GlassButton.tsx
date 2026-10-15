import type { ReactNode } from "react";
import { useTheme } from "@/lib/theme";
import { Glass, useNativeGlass } from "./Glass";
import { Icon, type IconName } from "./Icon";
import { PressScale } from "./PressScale";

/** A round glass button with one icon (bar buttons, close, attach). */
export function GlassButton({
  icon,
  label,
  onPress,
  size = 44,
  iconSize = 18,
  iconColor,
  tint,
  effect = "regular",
  shadow = true,
  children,
  testID,
}: {
  icon?: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  iconSize?: number;
  iconColor?: string;
  tint?: string;
  effect?: "regular" | "clear";
  shadow?: boolean;
  children?: ReactNode;
  testID?: string;
}) {
  const t = useTheme();
  // Liquid Glass draws its own shadow; elsewhere a soft one seats the button.
  const native = useNativeGlass();
  return (
    <PressScale
      label={label}
      onPress={onPress}
      scaleTo={0.9}
      testID={testID}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        boxShadow: native || !shadow ? undefined : `0 6px 18px ${t.shadow}`,
      }}
    >
      <Glass
        interactive
        effect={effect}
        tint={tint}
        style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}
      >
        {children ?? (icon ? <Icon name={icon} size={iconSize} color={iconColor} weight="semibold" /> : null)}
      </Glass>
    </PressScale>
  );
}
