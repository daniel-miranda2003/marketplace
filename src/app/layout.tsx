import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import ThemeRegistry from "@/theme/ThemeRegistry";
import QueryProvider from "@/providers/QueryProvider";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kroma",
  description: "Marketplace de moda con análisis de color por IA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${jakartaSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeRegistry>
          <QueryProvider>{children}</QueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
