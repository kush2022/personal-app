import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Life OS",
  description: "Your personal productivity companion",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Life OS",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.className} antialiased bg-[#020617] text-slate-100 min-h-screen relative overflow-x-hidden selection:bg-fuchsia-500/30 selection:text-fuchsia-100`}
      >
        {/* Dynamic Glassmorphic Background Objects */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px] mix-blend-screen animate-pulse duration-[10000ms]" />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-600/20 blur-[120px] mix-blend-screen animate-pulse duration-[12000ms]"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-[40%] left-[20%] w-[400px] h-[400px] rounded-full bg-cyan-600/15 blur-[100px] mix-blend-screen animate-pulse duration-[8000ms]"
            style={{ animationDelay: "4s" }}
          />
        </div>

        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            className:
              "bg-white/5 backdrop-blur-xl border border-white/10 text-slate-100 shadow-xl",
          }}
        />
      </body>
    </html>
  );
}
