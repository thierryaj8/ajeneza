"use client";
import { apiUrl, isSameOriginApi } from "@/lib/api-url";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Cookieless page-view beacon. Sends only the path and referrer; honours Do Not Track. */
export function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (navigator.doNotTrack === "1") return;
    const body = JSON.stringify({ path: pathname, referrer: document.referrer || undefined });
    const blob = new Blob([body], { type: "application/json" });
    if (!isSameOriginApi || !navigator.sendBeacon?.(apiUrl("/track"), blob)) {
      fetch(apiUrl("/track"), { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true, credentials: "include" }).catch(() => {});
    }
  }, [pathname]);
  return null;
}
