"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
    },

    {
      href: "/proyectos",
      label: "Proyectos",
    },

    {
      href: "/clientes",
      label: "Clientes",
    },

    {
      href: "/user-stories",
      label: "User Stories",
    },

    {
      href: "/recursos",
      label: "Recursos",
    },

    {
      href: "/contextos",
      label: "Contextos",
    },

    {
      href: "/prd",
      label: "PRD",
    },

    {
      href: "/roadmap",
      label: "Roadmap",
    },

    {
      href: "/usuarios",
      label: "Usuarios",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-black mb-8">
          Agile IA
        </h1>

        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-lg transition ${
                pathname === link.href
                  ? "bg-blue-600"
                  : "hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}