"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuppliersHotelsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/hotels");
  }, [router]);

  return null;
}
