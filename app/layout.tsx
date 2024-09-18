import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { PHProvider } from "@/providers/PHProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hemant",
  description: "Aesthetic, minimalistic, and responsive portfolio website.",
  openGraph: {
    title: "Hemant",
    description: "not the only website ever",
    type: "website",
    url: "https://hemant.lol",
    images: "/dread.png",
  },
  twitter: {
    images: "/dread.png",
    card: "summary",
  },
  themeColor: "#EED1C6",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <PHProvider>
      <html lang={locale} suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </PHProvider>
  );
}
