# Notice

Parlo is based on [Liquid Glass Chat UI](https://github.com/Appllama/liquid-glass-chat-ui) by Appllama
(MIT License), © 2026 Appllama. The original license text is kept in [LICENSE-UPSTREAM](LICENSE-UPSTREAM).

## What changed

- The two upstream cookbooks were merged into one app and rebranded as Parlo, with its own palette (warm paper
  and tomato red, light and dark), app icon, splash and logo.
- Kept and adapted from upstream: the story row that folds into the title, the story viewer, the floating
  composer with the send swap, the typing indicator, sample replies, search and filters, heart reactions,
  photo pinch-zoom and the native Liquid Glass surfaces.
- New: pinned and recent sections, unread counts, long-press chat actions (pin, mute, read/unread), joined
  bubble runs, photo captions, big emoji, six reactions with a lifted message, read receipts, text stories,
  tap/hold story navigation, a full-screen photo viewer, a profile and settings screen, and New chat with
  suggested people and an empty-chat state.
- The Skia portrait and photo lenses were replaced with plain-view glass avatars, so nothing needs Skia.
- MMKV (and Nitro modules) were replaced with AsyncStorage; only changes made on the device are saved.
- iOS-only effects live in `*.ios.tsx` files with Android and web fallbacks, so the app runs in Expo Go and
  in a browser. Alerts and iOS action sheets were replaced with in-app sheets and toasts.
- Brand, colours, people, sample chats, stories, replies and all copy moved into `constants/content.ts`.
- Upstream branding, documentation, tests, scripts, prompts, screenshots and every upstream portrait and
  photo were removed.

## Fonts, icons and images

- Fonts: system fonts only.
- Icons: SF Symbols on iOS (drawn by the system, not bundled) and Material Symbols on Android and the web
  (Apache License 2.0, bundled by `expo-symbols` through `@expo-google-fonts/material-symbols`).
- Emoji are the device's own.
- Images in `assets/avatars` and `assets/photos`: AI-generated for GenVibe.
- The Parlo icon, splash and logo in `assets/images` were drawn for this template.

## Fictional content

Parlo is a fictional brand. The people, their names, portraits, messages, stories, places and numbers are
fictional, and any resemblance to real people is a coincidence. Messages never leave the device; replies are
generated locally from `constants/content.ts`.

## Licenses

Dependencies keep their own licenses. Parts of the project scaffold come from the Expo project template:

```
The MIT License (MIT)

Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
