# Chirpline

A friendly messaging app for iPhone and Android, built with Expo SDK 57 and Expo Router. Stories fold into
the title as you scroll; chats are pinned, searchable and filterable; conversations have photos, reactions,
read receipts and a typing indicator; your messages get a (pretend) reply.

Runs in the Expo Go app (SDK 57) on iPhone and Android, and in the browser.

```bash
yarn install
yarn dev        # starts Expo with a tunnel; scan the QR code with Expo Go
```

## Screens

- **Chats**: story row, search (names and message text), All / Unread / Groups, pinned and recent chats with
  unread badges. Long-press a chat to pin, mute or mark it.
- **Conversation**: bubbles, photos, big emoji, reactions (long-press, or double-tap for ❤️), read receipts,
  typing dots and a floating composer with recent photos and a quick 👋.
- **Photo viewer**: pinch or double-tap to zoom, swipe down to close.
- **Stories**: photo and text stories; tap to step through, hold to pause.
- **Profile & settings**: status, appearance (System / Light / Dark), read receipts, previews, typing
  indicators, haptics, reset.
- **New chat**: suggested people and everyone A–Z.

## Make it yours

Everything brand-related lives in `constants/content.ts`: the app name, colours (light and dark), people and
their portraits, sample chats, stories, the automatic replies and every line of copy. Portraits are in
`assets/avatars/`, shared photos in `assets/photos/` (real JPEG files).

On iOS 26 and later the buttons, composer and sheets use native Liquid Glass; Android, the web and older
iPhones get frosted or solid surfaces instead (see the `*.ios.tsx` files in `components/ui/`).

Chats are sample data saved on the device (AsyncStorage). There is no server, account or analytics; connect
a backend by replacing `lib/replies.ts`.

Based on Liquid Glass Chat UI by Appllama (MIT). See [NOTICE.md](NOTICE.md).
