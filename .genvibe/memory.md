## What this app is
Parlo, a friendly messaging app (fictional brand) on Expo SDK 57 + Expo Router. Runs in Expo Go on iPhone and Android and in the web preview. Chats are local sample data: sending adds your message, then a typing indicator and a pretend reply (lib/replies.ts). No server, accounts or analytics.

## Built so far
- Chats (app/index.tsx): story row that folds into the title on scroll, search (names and message text), All/Unread/Groups chips, pinned and recent chats, unread badges, typing previews; long-press a chat to pin, mute or mark read/unread.
- Conversation (app/chat/[id].tsx): joined bubbles, photos, big emoji, reactions (long-press bar, double-tap ❤️), read receipts, typing dots, floating composer with photo tray and quick 👋, chat menu.
- Photo viewer (app/photo.tsx), story viewer (photo and text stories), Profile & settings (app/profile.tsx), New chat (app/new.tsx).

## Design
Warm paper #F6F4F1, ink #1C1A18, Parlo tomato #D4422A (your bubbles, badges, send), story ring #F6A53B→#E2512E→#C8336B; dark mode bg #0F0E0D. System font. Bubbles radius 22 (8 where they join), cards 24, conversation panel 40, buttons are circles. Glass surfaces float over content; springs and enter animations in lib/motion.ts.

## Structure
- constants/content.ts: THE source of brand, palettes, people and portraits, photos, sample chats, stories, pretend replies and all copy.
- constants/theme.ts: radii, spacing, type ramp.
- app/: routes. components/inbox, thread, stories, photo, profile, newchat, ui (Glass, GlassButton, Avatar, Icon, ActionSheet, Toast…).
- lib/: store.ts (zustand + AsyncStorage; saves only local changes), chats.ts (samples + local), replies.ts, stories.ts, theme.ts, motion.ts, haptics.ts, pointer.ts.
- assets/avatars (256px JPEG), assets/photos (1200x800 JPEG), assets/images (icon, splash, logo).

## User preferences & rules
- Edit constants/content.ts first; never hard-code copy, colours or sample data in components.
- Keep the design system (theme.ts, palettes, Glass, PressScale, Avatar).
- Liquid Glass stays in *.ios.tsx files (Glass, GlassGroup); keep the Android and web fallbacks.
- Expo Go only: no MMKV, Skia, dev-client or custom native modules; add packages with npx expo install. Images must be real JPEG/PNG.
- Web: use lib/pointer.ts styles for box-none and the predefined animations in lib/motion.ts.
- Do not set ios.bundleIdentifier or android.package.

## Open issues & next ideas
- Replace lib/replies.ts with a real backend (for example Supabase realtime).
- Photo picker, voice notes, group creation, push notifications.
