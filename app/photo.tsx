import { Redirect, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { PhotoViewer } from "@/components/photo/PhotoViewer";
import { chatInfo, messagesFor } from "@/lib/chats";
import { useStore } from "@/lib/store";

/** A shared photo: /photo?chat=<chat id>&message=<message id>. */
export default function PhotoRoute() {
  const { chat, message } = useLocalSearchParams<{ chat: string; message: string }>();
  const info = useMemo(() => chatInfo(chat), [chat]);
  const local = useStore((state) => (chat ? state.chats[chat] : undefined));
  const found = useMemo(
    () => (info ? messagesFor(info, local).find((m) => m.id === message && m.photo) : undefined),
    [info, local, message],
  );
  if (!info || !found) return <Redirect href="/" />;
  return <PhotoViewer info={info} message={found} />;
}
