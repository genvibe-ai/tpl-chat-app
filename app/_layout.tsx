import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, type PropsWithChildren } from "react";
import { Appearance, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { StoryHost } from "@/components/stories/StoryViewer";
import { ToastHost } from "@/components/ui/Toast";
import { palette } from "@/constants/content";
import { MAX_APP_WIDTH } from "@/constants/theme";
import { useHydrated, useStore } from "@/lib/store";
import { useScheme } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

/** In a wide browser window the app is a centred phone-width column. */
function AppFrame({ children, background }: PropsWithChildren<{ background: string }>) {
  if (Platform.OS !== "web") return <>{children}</>;
  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: background }}>
      <View
        style={{ flex: 1, width: "100%", maxWidth: MAX_APP_WIDTH, overflow: "hidden", boxShadow: "0 0 48px rgba(40, 28, 20, 0.08)" }}
      >
        {children}
      </View>
    </View>
  );
}

export default function RootLayout() {
  const hydrated = useHydrated();
  const scheme = useScheme();
  const preference = useStore((state) => state.settings.appearance);
  const t = palette[scheme];

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  // Native pieces (keyboard, sheets, Liquid Glass) follow Settings > Appearance too.
  useEffect(() => {
    if (Platform.OS !== "web") Appearance.setColorScheme(preference === "system" ? "unspecified" : preference);
    SystemUI.setBackgroundColorAsync(t.bg).catch(() => {});
  }, [preference, t.bg]);

  // Saved chats load in a moment; show the real inbox, not a sample that then changes.
  if (!hydrated) return null;

  const nav = scheme === "dark" ? DarkTheme : DefaultTheme;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: t.bg }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider>
          <ThemeProvider
            value={{
              ...nav,
              colors: { ...nav.colors, background: t.bg, card: t.bg, primary: t.accent, text: t.label, border: t.hairline },
            }}
          >
            <StatusBar style={scheme === "dark" ? "light" : "dark"} />
            <AppFrame background={t.panelEnd}>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="chat/[id]" />
                <Stack.Screen name="new" options={{ presentation: "modal" }} />
                <Stack.Screen name="profile" options={{ presentation: "modal" }} />
                <Stack.Screen
                  name="photo"
                  options={{ presentation: "fullScreenModal", animation: "fade", contentStyle: { backgroundColor: "#050505" } }}
                />
              </Stack>
              <StoryHost />
              <ToastHost />
            </AppFrame>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
