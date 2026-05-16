import "./globals.css";

import { ReactNode } from "react";

import { AuthProvider } from "@/context/AuthContext";

import { Toaster } from "sonner";

export const metadata = {
  title: "Agile IA",
  description:
    "Sistema inteligente de gestión ágil con IA",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="es">
      <body className="bg-gray-100 text-gray-900">
        <AuthProvider>
          {children}

          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3000}
          />
        </AuthProvider>
      </body>
    </html>
  );
}