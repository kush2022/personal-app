"use client";

import { useEffect, useState, useCallback } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Notes } from "@/components/Notes";
import { Tasks } from "@/components/Tasks";
import { Habits } from "@/components/Habits";
import { Expenses } from "@/components/Expenses";
import { Gratitude } from "@/components/Gratitude";
import { NotificationsToggle } from "@/components/NotificationsToggle";
import { useNotifications } from "@/hooks/useNotifications";
import { seedDefaultHabits } from "@/lib/store";
import { SplashScreen } from "@/components/SplashScreen";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Flame,
  Wallet,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab =
  | "dashboard"
  | "notes"
  | "tasks"
  | "habits"
  | "gratitude"
  | "expenses";

const TABS = [
  { key: "dashboard" as Tab, label: "Home", icon: LayoutDashboard },
  { key: "notes" as Tab, label: "Notes", icon: FileText },
  { key: "tasks" as Tab, label: "Tasks", icon: CheckSquare },
  { key: "habits" as Tab, label: "Habits", icon: Flame },
  { key: "gratitude" as Tab, label: "Gratitude", icon: Heart },
  { key: "expenses" as Tab, label: "Expenses", icon: Wallet },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);
  useNotifications();

  // Seed default habits & register service worker
  useEffect(() => {
    seedDefaultHabits();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onDone={hideSplash} />}
      <div
        className="flex flex-col min-h-screen max-w-lg mx-auto"
        style={{
          opacity: showSplash ? 0 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/[0.02] backdrop-blur-2xl border-b border-white/10 px-4 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-display font-semibold text-lg tracking-tight bg-gradient-to-r from-indigo-300 via-white to-purple-300 bg-clip-text text-transparent">
              LifeOS
            </span>
            <NotificationsToggle />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 pt-5 overflow-y-auto pb-24">
          {tab === "dashboard" && <Dashboard />}
          {tab === "notes" && <Notes />}
          {tab === "tasks" && <Tasks />}
          {tab === "habits" && <Habits />}
          {tab === "gratitude" && <Gratitude />}
          {tab === "expenses" && <Expenses />}
        </main>

        {/* Bottom navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/[0.04] backdrop-blur-2xl border-t border-white/10 z-40 shadow-[0_-8px_32px_0_rgba(0,0,0,0.3)]">
          <div className="flex">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-all duration-300",
                  tab === key
                    ? "text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.5)]"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    tab === key && "scale-110",
                  )}
                  strokeWidth={tab === key ? 2.5 : 1.75}
                />
                {label}
                {tab === key && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
