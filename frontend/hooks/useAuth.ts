"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

export interface AuthState {
  user: Record<string, any> | null;
}

export function useAuth(): AuthState {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ user: null });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    setAuth({
      user: user ? JSON.parse(user) : null,
    });
  }, [router]);

  return auth;
}