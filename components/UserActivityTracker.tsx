"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function UserActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/user/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, event: "page_view" }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
