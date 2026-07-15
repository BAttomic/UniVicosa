"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function QrRefresh() {
  const router = useRouter();

  useEffect(() => {
    const ms = 30_000;
    const timer = setInterval(() => router.refresh(), ms);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
