"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

interface Props {
  roles: string[];
  children: ReactNode;
}

export default function RoleGuard({
  roles,
  children,
}: Props) {
  const [allowed, setAllowed] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        setAllowed(false);
        return;
      }

      const user =
        JSON.parse(storedUser);

      const rol =
        typeof user.rol === "object"
          ? user.rol?.nombre
          : user.rol;

      setAllowed(
        roles.includes(rol)
      );
    } catch {
      setAllowed(false);
    }

  }, []);

  if (!mounted) {
    return null;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}