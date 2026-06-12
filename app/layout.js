import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ed1t.jp",
  description: "趣味でWeb開発。アマチュア高校生エディター。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ed1t.jp",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon_128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon_192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon_192.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
