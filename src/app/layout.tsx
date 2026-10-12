import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "@/app/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Nabang",
  description: "Nabang - Aplikasi tabungan dan keuangan pribadi.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={fontSans.variable} lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased text-foreground bg-background">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
