import { useColorScheme } from "react-native";
import { palette, type Palette } from "@/constants/content";
import { useStore } from "./store";

export type Scheme = "light" | "dark";

/** Settings > Appearance, or the system's choice when it is set to System. */
export function useScheme(): Scheme {
  const system = useColorScheme();
  const preference = useStore((state) => state.settings.appearance);
  if (preference !== "system") return preference;
  return system === "dark" ? "dark" : "light";
}

export function useTheme(): Palette {
  return palette[useScheme()];
}
