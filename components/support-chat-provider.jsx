"use client";

import dynamic from "next/dynamic";

// Dynamically import the SupportChat component with no SSR
const SupportChat = dynamic(() => import("./support-chat"), {
  ssr: false,
});

export default function SupportChatProvider() {
  return <SupportChat />;
} 