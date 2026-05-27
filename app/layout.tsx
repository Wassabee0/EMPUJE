import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Empuje beta",
  description: "Oportunidades privadas y revisadas para emprendedores, autónomos y pequeños negocios en España.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
