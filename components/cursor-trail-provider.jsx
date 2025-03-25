"use client";

import dynamic from "next/dynamic";

// Dynamically import the CursorTrail component with no SSR
const CursorTrail = dynamic(() => import("./cursor-trail"), {
  ssr: false,
});

export default function CursorTrailProvider() {
  return <CursorTrail />;
} 