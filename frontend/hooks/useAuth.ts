"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

export function useAuth() {
  const router =
    useRouter();

  useEffect(() => {
    // evita error SSR
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const token =
      localStorage.getItem(
        "token"
      );

    // por si no existe token
    if (!token) {
      router.push("/login");
    }
  }, [router]);
}