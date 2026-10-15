/**
 * iOS: native Liquid Glass (iOS 26+) through expo-glass-effect. The system
 * draws the material, its rim and its shadow. Keep glass out of parents that
 * fade (opacity < 1 turns the effect off until the fade ends).
 * Older iOS and Reduce Transparency get the frosted fallback.
 */
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect";
import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import { useScheme } from "@/lib/theme";
import { GlassFallback, type GlassProps } from "./GlassFallback";

export type { GlassProps };

const available = (() => {
  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    return false;
  }
})();

/** True where the system can draw Liquid Glass and transparency is not reduced. */
export function useNativeGlass() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (!available) return;
    AccessibilityInfo.isReduceTransparencyEnabled()
      .then(setReduce)
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setReduce);
    return () => subscription.remove();
  }, []);
  return available && !reduce;
}

export function Glass(props: GlassProps) {
  const native = useNativeGlass();
  const scheme = useScheme();
  if (!native) return <GlassFallback {...props} />;
  const { style, effect = "regular", tint, interactive = false, children } = props;
  return (
    <GlassView
      colorScheme={scheme}
      glassEffectStyle={effect}
      tintColor={tint}
      isInteractive={interactive}
      style={[{ borderCurve: "continuous" }, style]}
    >
      {children}
    </GlassView>
  );
}
