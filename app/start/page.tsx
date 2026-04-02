// app/start/page.tsx — short link: tevatha.com/start → Watchtower
import { redirect } from "next/navigation";

export default function StartPage() {
  redirect("/watchtower");
}
