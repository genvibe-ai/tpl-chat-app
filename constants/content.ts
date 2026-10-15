/**
 * Chirpline: the brand, colours, people, sample chats, stories, automatic replies
 * and every line of copy live in this one file. Rebrand the app by editing the
 * values below; every screen reads from here.
 *
 * Portraits: assets/avatars/*.jpg (256x256 JPEG). Shared photos:
 * assets/photos/*.jpg (1200x800 JPEG). Keep real JPEG files; a renamed PNG
 * breaks the app on a phone.
 */
import type { ImageSourcePropType } from "react-native";

/* ------------------------------------------------------------------ brand */

export const brand = {
  name: "Chirpline",
  tagline: "Talk to your people.",
  version: "1.0",
  /** The round logo used for the app's own chat (assets/images/logo.png). */
  logo: require("../assets/images/logo.png") as ImageSourcePropType,
};

/* ----------------------------------------------------------------- colours */

/** Light and dark palettes. Settings > Appearance picks one (or follows the system). */
export const palette = {
  light: {
    bg: "#F6F4F1", // page background, warm paper
    surface: "#FFFFFF", // cards, incoming bubbles, the conversation panel
    panelEnd: "#F1EEEA", // bottom of the conversation panel
    label: "#1C1A18", // main text
    secondary: "#6B665F", // secondary text (AA on bg and surface)
    tertiary: "#ABA59E", // decorative only: grabbers, chevrons
    hairline: "rgba(28, 26, 24, 0.09)",
    pressed: "rgba(28, 26, 24, 0.05)",
    chip: "rgba(28, 26, 24, 0.06)",
    placeholder: "rgba(28, 26, 24, 0.42)",
    accent: "#D4422A", // Chirpline tomato: send, badges, rings, your bubbles
    onAccent: "#FFFFFF",
    accentText: "#B5341E", // accent-coloured words on the page ("typing…")
    accentSoft: "rgba(212, 66, 42, 0.11)",
    bubbleIn: "#FFFFFF",
    bubbleInText: "#1C1A18",
    bubbleOut: "#D4422A",
    bubbleOutEnd: "#BF3722", // your bubbles fade to this at the bottom
    bubbleOutText: "#FFFFFF",
    online: "#2E9F62", // the online dot
    onlineText: "#1E7A49", // "online" under a name (AA on the page)
    scrim: "rgba(24, 18, 14, 0.30)",
    shadow: "rgba(70, 42, 24, 0.10)",
    seenRing: "rgba(28, 26, 24, 0.16)",
    glass: "rgba(255, 255, 255, 0.80)", // glass where Liquid Glass is unavailable
    glassEdge: "rgba(28, 26, 24, 0.07)",
  },
  dark: {
    bg: "#0F0E0D",
    surface: "#1D1B19",
    panelEnd: "#141311",
    label: "#F5F2EE",
    secondary: "#A49E97",
    tertiary: "#5E5953",
    hairline: "rgba(245, 242, 238, 0.10)",
    pressed: "rgba(245, 242, 238, 0.06)",
    chip: "rgba(245, 242, 238, 0.09)",
    placeholder: "rgba(245, 242, 238, 0.42)",
    accent: "#D4422A",
    onAccent: "#FFFFFF",
    accentText: "#FF8B6E",
    accentSoft: "rgba(255, 128, 98, 0.16)",
    bubbleIn: "#26231F",
    bubbleInText: "#F5F2EE",
    bubbleOut: "#D4422A",
    bubbleOutEnd: "#BF3722",
    bubbleOutText: "#FFFFFF",
    online: "#3CBF78",
    onlineText: "#5CCF8F",
    scrim: "rgba(0, 0, 0, 0.50)",
    shadow: "rgba(0, 0, 0, 0.45)",
    seenRing: "rgba(245, 242, 238, 0.22)",
    glass: "rgba(38, 35, 32, 0.82)",
    glassEdge: "rgba(255, 255, 255, 0.08)",
  },
};

export type Palette = typeof palette.light;

/** The ring around an unseen story, drawn as a gradient. */
export const storyRing = ["#F6A53B", "#E2512E", "#C8336B"] as const;

/* ------------------------------------------------------------------ photos */

export type Photo = {
  source: ImageSourcePropType;
  width: number;
  height: number;
  alt: string;
};

/** Photos people share in chats and stories (assets/photos, 1200x800). */
export const photos = {
  coast: {
    source: require("../assets/photos/coast.jpg"),
    width: 1200,
    height: 800,
    alt: "A woman in a white dress looks over a whitewashed seaside village and pink bougainvillea at sunset",
  },
  market: {
    source: require("../assets/photos/market.jpg"),
    width: 1200,
    height: 800,
    alt: "A busy night market with red paper lanterns and food stalls grilling skewers",
  },
  aurora: {
    source: require("../assets/photos/aurora.jpg"),
    width: 1200,
    height: 800,
    alt: "Green northern lights over a small lit cabin in a snowy mountain valley",
  },
  hike: {
    source: require("../assets/photos/hike.jpg"),
    width: 1200,
    height: 800,
    alt: "Two hikers on a rocky ridge above blue lakes and jagged peaks",
  },
} satisfies Record<string, Photo>;
export type PhotoId = keyof typeof photos;

/** The photos offered by the + button in a chat, in order. */
export const recentPhotos: PhotoId[] = ["coast", "market", "aurora", "hike"];

/* ------------------------------------------------------------------ people */

export type Person = {
  id: string;
  name: string;
  first: string;
  /** A 256x256 portrait. People without one get their initials on `tint`. */
  avatar?: ImageSourcePropType;
  tint?: { bg: string; fg: string };
  /** The line under their name in New chat. */
  about: string;
  online?: boolean;
  /** Shown under the name in a chat when they are not online. */
  lastSeen?: string;
};

const portrait = {
  a1: require("../assets/avatars/av-1.jpg"),
  a2: require("../assets/avatars/av-2.jpg"),
  a3: require("../assets/avatars/av-3.jpg"),
  a4: require("../assets/avatars/av-4.jpg"),
  a5: require("../assets/avatars/av-5.jpg"),
  a6: require("../assets/avatars/av-6.jpg"),
  a7: require("../assets/avatars/av-7.jpg"),
  a8: require("../assets/avatars/av-8.jpg"),
} as Record<string, ImageSourcePropType>;

/** You: the profile screen, your story and your side of every chat. */
export const me = {
  id: "me",
  name: "Sam Rivera",
  first: "Sam",
  handle: "@samrivera",
  avatar: portrait.a3,
  about: "Coffee first, then everything else.",
  /** Tap your status on the profile screen to move to the next one. */
  statuses: ["☕️ Coffee first", "💻 Heads down", "🏃‍♀️ Out for a run", "🌙 Winding down"],
};

export const people: Person[] = [
  { id: "mira", name: "Mira Ellis", first: "Mira", avatar: portrait.a7, about: "Somewhere sunny", online: true },
  { id: "amara", name: "Amara Okafor", first: "Amara", avatar: portrait.a1, about: "Sunday Hike Club captain", online: true },
  { id: "rohan", name: "Rohan Mehta", first: "Rohan", avatar: portrait.a6, about: "Making music, mostly at night", online: true },
  { id: "dad", name: "Dad", first: "Dad", avatar: portrait.a4, about: "Family", lastSeen: "last seen today at 8:31 AM" },
  { id: "zara", name: "Zara Haddad", first: "Zara", avatar: portrait.a5, about: "Product designer", lastSeen: "last seen today at 7:52 AM" },
  { id: "kenji", name: "Kenji Park", first: "Kenji", avatar: portrait.a2, about: "Photographer", lastSeen: "last seen yesterday at 11:40 PM" },
  { id: "marcus", name: "Marcus Bell", first: "Marcus", avatar: portrait.a8, about: "Run club, Tuesdays and Thursdays", lastSeen: "last seen Monday" },
  { id: "nia", name: "Nia Bennett", first: "Nia", tint: { bg: "#E8E0F6", fg: "#5A3E99" }, about: "Podcast producer", lastSeen: "last seen Saturday" },
  { id: "lucas", name: "Lucas Moreau", first: "Lucas", tint: { bg: "#DCEFE4", fg: "#2D6A4A" }, about: "Tennis, coffee, repeat", lastSeen: "last seen Sunday" },
  { id: "elena", name: "Elena Rossi", first: "Elena", tint: { bg: "#FBE3D3", fg: "#9A4A1F" }, about: "Cooks for everyone", lastSeen: "last seen recently" },
  { id: "omar", name: "Omar Farouk", first: "Omar", tint: { bg: "#DDE9F7", fg: "#2F5A8F" }, about: "Architect", lastSeen: "last seen recently" },
  { id: "priya", name: "Priya Nair", first: "Priya", tint: { bg: "#F7EDC9", fg: "#7A5C0E" }, about: "Book club host", lastSeen: "last seen recently" },
  { id: "iris", name: "Iris Calloway", first: "Iris", tint: { bg: "#F6DDE4", fg: "#8E2F4C" }, about: "Plants and pottery", lastSeen: "last seen recently" },
  // The app's own chat. Not listed in New chat.
  { id: "chirpline", name: "Chirpline Team", first: "Chirpline", avatar: brand.logo, about: "Tips and news", online: true },
];

/** People New chat suggests first. */
export const suggested = ["mira", "rohan", "zara", "kenji"];

/** Ids New chat never lists (the app's own chat). */
export const hiddenContacts = ["chirpline"];

/* ------------------------------------------------------------------- chats */

export type Reaction = { emoji: string; from: string };

export type Message = {
  id: string;
  /** "me" or a person id. */
  from: string;
  text?: string;
  photo?: PhotoId;
  /** The day it was sent: "Today", "Yesterday", "Tuesday"… */
  day: string;
  time: string;
  reactions?: Reaction[];
};

export type ChatSeed = {
  /** For a one-to-one chat, use the person's id. */
  id: string;
  /** One person id for a one-to-one chat, several for a group. */
  people: string[];
  /** Groups only. */
  title?: string;
  emoji?: string;
  pinned?: boolean;
  muted?: boolean;
  /** How many of the latest messages are unread. */
  unread?: number;
  /** The inbox time label for the latest sample message. */
  time: string;
  messages: Message[];
};

/** The sample inbox, newest first. Pinned chats float to the top. */
export const chats: ChatSeed[] = [
  {
    id: "mira",
    people: ["mira"],
    pinned: true,
    unread: 2,
    time: "9:41 AM",
    messages: [
      { id: "m1", from: "mira", day: "Yesterday", time: "7:02 PM", text: "Landed! The island is ridiculous. Everything is white and blue and smells like lemons" },
      { id: "m2", from: "me", day: "Yesterday", time: "7:15 PM", text: "I hate you (affectionately)", reactions: [{ emoji: "😂", from: "mira" }] },
      { id: "m3", from: "mira", day: "Yesterday", time: "7:16 PM", text: "You're coming next year. No excuses." },
      { id: "m4", from: "mira", day: "Today", time: "9:40 AM", photo: "coast", text: "Our terrace at golden hour. I'm never coming back 🌅" },
      { id: "m5", from: "mira", day: "Today", time: "9:41 AM", text: "Okay, maybe for your birthday. Save me a slice 🎂" },
    ],
  },
  {
    id: "hike-club",
    people: ["amara", "kenji", "rohan", "mira"],
    title: "Sunday Hike Club",
    emoji: "🥾",
    pinned: true,
    unread: 3,
    time: "9:12 AM",
    messages: [
      { id: "h1", from: "amara", day: "Yesterday", time: "6:30 PM", text: "Sunday plan: the ridge loop. 11 km, one very steep bit 🥾" },
      { id: "h2", from: "rohan", day: "Yesterday", time: "6:34 PM", text: "Define \"very steep\"" },
      { id: "h3", from: "amara", day: "Yesterday", time: "6:35 PM", text: "You'll survive. There's a bakery at the end.", reactions: [{ emoji: "😂", from: "kenji" }] },
      { id: "h4", from: "me", day: "Yesterday", time: "6:41 PM", text: "I'll bring the big thermos ☕️", reactions: [{ emoji: "❤️", from: "amara" }] },
      { id: "h5", from: "amara", day: "Today", time: "9:02 AM", photo: "hike", text: "Last time's view, as a reminder of why we do this" },
      { id: "h6", from: "kenji", day: "Today", time: "9:10 AM", text: "Meet at the trailhead at 7?" },
      { id: "h7", from: "rohan", day: "Today", time: "9:12 AM", text: "7 is a crime. 7:30 and I'm bringing pastries 🥐" },
    ],
  },
  {
    id: "dad",
    people: ["dad"],
    pinned: true,
    time: "8:30 AM",
    messages: [
      { id: "d1", from: "dad", day: "Today", time: "8:12 AM", text: "Did you get home okay last night?" },
      { id: "d2", from: "me", day: "Today", time: "8:20 AM", text: "Yes! Asleep the second I sat down 😴" },
      { id: "d3", from: "dad", day: "Today", time: "8:30 AM", text: "Good. Call me Sunday, your aunt wants to hear all about the new job", reactions: [{ emoji: "❤️", from: "me" }] },
    ],
  },
  {
    id: "rohan",
    people: ["rohan"],
    unread: 1,
    time: "8:05 AM",
    messages: [
      { id: "r1", from: "me", day: "Yesterday", time: "5:48 PM", text: "How's the mix coming along?" },
      { id: "r2", from: "rohan", day: "Yesterday", time: "6:10 PM", text: "Close. I rebuilt the drums on track 4 from scratch." },
      { id: "r3", from: "rohan", day: "Today", time: "8:05 AM", text: "Sending it tonight. Be honest about the bass 🎧" },
    ],
  },
  {
    id: "zara",
    people: ["zara"],
    time: "Yesterday",
    messages: [
      { id: "z1", from: "zara", day: "Yesterday", time: "9:20 PM", photo: "market", text: "Night market crawl. Found the dumpling stall everyone keeps talking about 🏮" },
      { id: "z2", from: "me", day: "Yesterday", time: "9:24 PM", text: "STOP. Is it as good as they say?" },
      { id: "z3", from: "zara", day: "Yesterday", time: "9:25 PM", text: "Better. I'm going back tomorrow.", reactions: [{ emoji: "😮", from: "me" }] },
      { id: "z4", from: "me", day: "Yesterday", time: "9:26 PM", text: "Save me a dumpling 🥟" },
    ],
  },
  {
    id: "kenji",
    people: ["kenji"],
    time: "Yesterday",
    messages: [
      { id: "k1", from: "kenji", day: "Yesterday", time: "11:02 PM", photo: "aurora", text: "Stayed up until 2 for this. Worth every minute." },
      { id: "k2", from: "me", day: "Yesterday", time: "11:10 PM", text: "Kenji. This is unreal 🤯", reactions: [{ emoji: "🙏", from: "kenji" }] },
      { id: "k3", from: "kenji", day: "Yesterday", time: "11:24 PM", text: "Printing it big for the studio wall." },
    ],
  },
  {
    id: "chirpline",
    people: ["chirpline"],
    time: "Yesterday",
    messages: [
      { id: "p1", from: "chirpline", day: "Yesterday", time: "10:00 AM", text: "Welcome to Chirpline 👋" },
      { id: "p2", from: "chirpline", day: "Yesterday", time: "10:00 AM", text: "Pull down on Chats to see who posted a story today." },
      { id: "p3", from: "chirpline", day: "Yesterday", time: "10:01 AM", text: "Long-press any message to react, or double-tap it for a quick ❤️" },
      { id: "p4", from: "chirpline", day: "Yesterday", time: "10:01 AM", text: "Messages here stay on your phone. Say hi to anyone and see what happens." },
    ],
  },
  {
    id: "maple-court",
    people: ["marcus", "nia", "lucas"],
    title: "Maple Court Neighbors",
    emoji: "🏡",
    muted: true,
    unread: 4,
    time: "Tue",
    messages: [
      { id: "n1", from: "marcus", day: "Tuesday", time: "6:02 PM", text: "Good news: the elevator is fixed! 🎉" },
      { id: "n2", from: "nia", day: "Tuesday", time: "6:05 PM", text: "Finally. My calves thank you." },
      { id: "n3", from: "lucas", day: "Tuesday", time: "6:11 PM", text: "Whose bike is in the lobby? Asking for my shins." },
      { id: "n4", from: "marcus", day: "Tuesday", time: "6:14 PM", text: "Mine, sorry! Moving it tonight 🚲" },
    ],
  },
  {
    id: "marcus",
    people: ["marcus"],
    time: "Mon",
    messages: [
      { id: "c1", from: "marcus", day: "Monday", time: "7:45 AM", text: "Great run this morning. Same time Thursday? 🏃‍♂️" },
      { id: "c2", from: "me", day: "Monday", time: "8:02 AM", text: "Same time. I'm getting faster, admit it" },
      { id: "c3", from: "marcus", day: "Monday", time: "8:03 AM", text: "You're getting louder. Close enough.", reactions: [{ emoji: "😂", from: "me" }] },
    ],
  },
  {
    id: "nia",
    people: ["nia"],
    time: "Sat",
    messages: [
      { id: "b1", from: "nia", day: "Saturday", time: "4:12 PM", text: "We should pitch the podcast as a series, not a one-off." },
      { id: "b2", from: "nia", day: "Saturday", time: "4:12 PM", text: "Call Thursday?" },
      { id: "b3", from: "me", day: "Saturday", time: "4:30 PM", text: "Thursday after 5 works 👍" },
    ],
  },
  {
    id: "lucas",
    people: ["lucas"],
    time: "Fri",
    messages: [
      { id: "l1", from: "lucas", day: "Friday", time: "12:20 PM", text: "Court's booked for 7 🎾" },
      { id: "l2", from: "me", day: "Friday", time: "12:31 PM", text: "Bringing the good balls this time" },
      { id: "l3", from: "lucas", day: "Friday", time: "12:32 PM", text: "Bold of you to assume you'll hit them" },
    ],
  },
];

/* ----------------------------------------------------------------- stories */

export type Story = {
  /** Whose story it is (a person id, or "me"). */
  person: string;
  ago: string;
  /** Sample stories you have already watched. */
  seen?: boolean;
  /** Your own story only: how many people watched it. */
  views?: number;
} & ({ photo: PhotoId; caption?: string } | { text: string; colors: readonly [string, string] });

/** Your own story, first in the row. */
export const myStory: Story = {
  person: "me",
  ago: "1h",
  views: 14,
  text: "Back from the coast. Already planning the next trip 🌊",
  colors: ["#E2512E", "#C8336B"],
};

/** Stories in the row after yours. Unseen ones are listed before seen ones. */
export const stories: Story[] = [
  { person: "mira", ago: "2h", photo: "coast", caption: "Golden hour, every hour" },
  { person: "zara", ago: "5h", photo: "market", caption: "Dumpling stall, round two 🥟" },
  { person: "rohan", ago: "6h", text: "Mixing track 4 tonight. Headphones on, world off 🎧", colors: ["#2C2A6E", "#7F44D9"] },
  { person: "kenji", ago: "9h", photo: "aurora", caption: "2 AM, -14°, zero regrets" },
  { person: "amara", ago: "12h", photo: "hike", caption: "Sunday's route, scouted", seen: true },
  { person: "marcus", ago: "20h", text: "5K before breakfast. Who's joining Thursday? 🏃‍♂️", colors: ["#0E7A63", "#58C08D"], seen: true },
];

/** How long one story stays on screen, in milliseconds. */
export const storyDuration = 6000;

/* ---------------------------------------------------------------- replies */

/**
 * Chirpline has no server: when you send a message, the other person "types" for
 * a moment and answers with one of these. Keyword replies win, then the
 * person's own lines (in order), then `anyone`.
 */
export const replies = {
  byPerson: {
    mira: ["Ha! I knew you'd say that 😄", "Okay but seriously, come next year.", "Sending you sunsets until you book a flight 🌅", "Miss you! Call tonight?"],
    amara: ["Love it 🙌", "See you at the trailhead!", "Bring layers, it's windy up there 🧥"],
    rohan: ["Ha, okay. Give me a minute.", "Say more 👀", "That's exactly what I was thinking.", "Deal. I'll sort the rest."],
    dad: ["Okay kiddo ❤️", "Did you eat?", "Proud of you.", "Call me when you can!"],
    zara: ["Obviously 😌", "Come with me tomorrow?", "Ha! Yes."],
    kenji: ["Agreed.", "Bringing the camera 📸", "Ha. Fair."],
    marcus: ["We'll see on Thursday 😉", "Stretch first!"],
    nia: ["Perfect, invite coming your way.", "Yes! Let's do it."],
    lucas: ["We'll see about that 🎾", "Loser buys coffee."],
    chirpline: ["Thanks for saying hi! Try a long-press on this message 😉", "Tip: tap + to share one of your recent photos."],
  } as Record<string, string[]>,
  anyone: ["Ha, okay. Give me a minute.", "Say more 👀", "That's exactly what I was thinking.", "Deal!", "Send me the details and I'm in."],
  keywords: [
    { words: ["hi", "hey", "hello", "hiya", "yo"], replies: ["Hey you! 👋", "Hi! How's your day going?"] },
    { words: ["thanks", "thank", "thx", "ty"], replies: ["Anytime 😊", "Of course!"] },
    { words: ["haha", "lol", "lmao", "😂"], replies: ["😂😂", "Stop, I'm crying"] },
    { words: ["love", "miss"], replies: ["❤️❤️", "Miss you too!"] },
    { words: ["coffee", "lunch", "dinner"], replies: ["Yes please. When?", "Only if you're buying ☕️"] },
  ],
  /** When you share a photo. */
  photo: ["Okay, where is THIS? 😍", "Wow. Send me more!", "Saving this one."],
  /** When your message is only emoji. */
  emoji: ["😄", "🫶", "👋👋"],
  /** The reaction they leave on photos you share. */
  photoReaction: "😍",
  /** Timing, in milliseconds. */
  timing: { startTyping: 650, perCharacter: 26, shortest: 1100, longest: 2600 },
};

/* ------------------------------------------------------------------- copy */

/** The quick reactions offered on a long-press. */
export const reactions = ["❤️", "😂", "👍", "😮", "😢", "🙏"];

/** The emoji the round button sends when the message field is empty. */
export const quickEmoji = "👋";

/** "9:41 AM". Used for messages sent in the app. */
export function formatTime(date: Date) {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? "AM" : "PM"}`;
}

/** Everything the app says. Functions fill in names and numbers. */
export const copy = {
  inbox: {
    title: "Chats",
    search: "Search",
    clearSearch: "Clear search",
    filters: { all: "All", unread: "Unread", groups: "Groups" },
    pinned: "Pinned",
    recent: "Recent",
    results: "Results",
    you: "You",
    photo: "Photo",
    typing: "typing…",
    previewHidden: "New message",
    yourStory: "Your story",
    newChat: "New chat",
    profile: "Your profile",
    showStories: "Show stories",
    unreadLabel: (count: number) => `${count} unread`,
    noResults: { title: "No chats found", body: "Try a name or a few words from a message." },
    caughtUp: { title: "You're all caught up", body: "New messages land here first." },
    noGroups: { title: "No groups yet", body: "Start one with a few of your people." },
    rowMenu: {
      pin: "Pin chat",
      unpin: "Unpin chat",
      read: "Mark as read",
      unread: "Mark as unread",
      mute: "Mute notifications",
      unmute: "Unmute notifications",
      cancel: "Cancel",
    },
  },
  thread: {
    back: "Back",
    online: "online",
    typing: "typing…",
    groupTyping: (name: string) => `${name} is typing…`,
    members: (names: string[]) => `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`,
    menu: "Chat options",
    read: "Read",
    delivered: "Delivered",
    daySeparator: (day: string, time: string) => `${day} ${time}`,
    emptyTitle: (name: string) => `Say hi to ${name}`,
    emptyBody: "Messages you send here stay on this device.",
    /** One-tap openers in a brand-new chat. */
    starters: ["👋", "Hey! How are you?", "Coffee this week?"],
    openPhoto: "Open photo",
    reactWith: (emoji: string) => `React with ${emoji}`,
    removeReaction: "Remove your reaction",
    closeReactions: "Close reactions",
    options: {
      pin: "Pin chat",
      unpin: "Unpin chat",
      mute: "Mute notifications",
      unmute: "Unmute notifications",
      clear: "Clear new messages",
      cancel: "Cancel",
    },
    notFound: "This chat isn't here anymore.",
    goBack: "Back to Chats",
  },
  composer: {
    placeholder: "Message",
    attach: "Share a photo",
    closeAttach: "Close photos",
    photosTitle: "Recent photos",
    sendPhoto: "Send photo",
    send: "Send",
    quick: (emoji: string) => `Send ${emoji}`,
  },
  photo: {
    close: "Close photo",
    from: (name: string) => name,
    react: "Love this photo",
    unreact: "Remove your ❤️",
    reply: "Reply",
  },
  story: {
    yours: "Your story",
    reply: (name: string) => `Reply to ${name}…`,
    close: "Close story",
    like: "Like story",
    unlike: "Unlike story",
    seenBy: (count: number) => `Seen by ${count}`,
    open: (name: string) => `${name}'s story`,
    next: "Next story",
  },
  profile: {
    title: "Profile",
    close: "Close profile",
    statusHint: "Tap to change your status",
    appearance: "Appearance",
    appearanceOptions: { system: "System", light: "Light", dark: "Dark" },
    chats: "Chats",
    readReceipts: "Read receipts",
    readReceiptsHint: "Show when your messages were read",
    previews: "Message previews",
    previewsHint: "Show the latest message in Chats",
    typing: "Typing indicators",
    typingHint: "See when someone is writing",
    feel: "Feel",
    haptics: "Haptics",
    hapticsHint: "A light tap when things happen",
    data: "Sample data",
    reset: "Reset sample chats",
    resetHint: "Removes messages you sent, reactions and pins.",
    resetConfirm: "Reset",
    resetCancel: "Cancel",
    about: (name: string, version: string) => `${name} ${version}`,
    privacyNote: "Everything in this preview stays on your device.",
  },
  newChat: {
    title: "New chat",
    close: "Close new chat",
    search: "Search people",
    suggested: "Suggested",
    everyone: "All contacts",
    empty: "No one by that name.",
  },
  toasts: {
    pinned: "Chat pinned",
    unpinned: "Chat unpinned",
    muted: "Notifications muted",
    unmuted: "Notifications on",
    markedRead: "Marked as read",
    markedUnread: "Marked as unread",
    cleared: "New messages cleared",
    reset: "Sample chats restored",
  },
};
