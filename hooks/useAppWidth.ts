import { useWindowDimensions } from "react-native";
import { MAX_APP_WIDTH } from "@/constants/theme";

/** The app's width: the phone's, or a centred column in a wide browser window. */
export function useAppWidth() {
  const { width } = useWindowDimensions();
  return Math.min(width, MAX_APP_WIDTH);
}
