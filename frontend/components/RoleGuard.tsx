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
  const [mounted, setMounted] =
    useState(false);

  const [allowed, setAllowed] =
    useState(false);

  useEffect(() => {
    setMounted(true);

    const userString =
      localStorage.getItem("user");

    if (!userString) {
      setAllowed(false);
      return;
    }

    try {
      const user = JSON.parse(userString);

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
  }, [roles]);

  
  if (!mounted) {
    return null;
  }


  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}