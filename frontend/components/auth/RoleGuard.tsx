"use client";

import { ReactNode } from "react";

interface Props {
  roles: string[];
  children: ReactNode;
}

export default function RoleGuard({ roles, children }: Props) {
  if (typeof window === "undefined") return null;

  let user = null;

  try {
    const stored = localStorage.getItem("user");
    user = stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }

  if (!user?.rol) return null;

  if (!roles.includes(user.rol)) return null;

  return <>{children}</>;
}