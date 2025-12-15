import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Calculadora de Dosis - Q-Spain",
  description: "Calculadora de dosis para péptidos y HGH. Calcula volúmenes y concentraciones.",
  manifest: "/dosificacionpeptidos/manifest.json",
  icons: {
    icon: [
      { url: "/dosificacionpeptidos/favicon.ico" },
      { url: "/dosificacionpeptidos/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/dosificacionpeptidos/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/dosificacionpeptidos/apple-touch-icon.png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Q-Spain Dosis",
  },
};

export const viewport: Viewport = {
  themeColor: "#06b6d4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
