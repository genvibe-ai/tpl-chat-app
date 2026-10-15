import { Redirect } from "expo-router";

/** Unknown links open Chats. */
export default function NotFound() {
  return <Redirect href="/" />;
}
