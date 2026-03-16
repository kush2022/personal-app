"use client";

import { useEffect, useRef } from "react";
import { tasksStore, habitsStore } from "@/lib/store";
import { getTodayKey } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function canNotify(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

function sendNotification(title: string, body: string, tag?: string) {
  if (!canNotify()) return;
  try {
    new Notification(title, {
      body,
      tag, // deduplicates: same tag replaces previous
      icon: "/favicon.ico",
    });
  } catch (e) {
    console.error("Notification error", e);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (initialized.current) return;
    initialized.current = true;

    // ── Helper: get daily-scoped notified tracker ──
    function getDailyNotified(): Record<string, number> {
      const today = getTodayKey();
      const raw = localStorage.getItem(`lifeos:notified:${today}`);
      return raw ? JSON.parse(raw) : {};
    }

    function saveDailyNotified(notified: Record<string, number>) {
      const today = getTodayKey();
      localStorage.setItem(
        `lifeos:notified:${today}`,
        JSON.stringify(notified),
      );
    }

    // ── 1. Task reminders ─────────────────────────────────────────────────────
    function checkTasks() {
      if (!canNotify()) return;
      const today = getTodayKey();
      const tasks = tasksStore.getAll();
      const notified = getDailyNotified();

      const dueTasks = tasks.filter(
        (t) => !t.done && t.dueDate && t.dueDate <= today,
      );
      let changed = false;
      for (const task of dueTasks) {
        const key = `task_${task.id}`;
        if (!notified[key]) {
          sendNotification(
            "Task Reminder ✅",
            `📌 Pending: ${task.title}`,
            key,
          );
          notified[key] = Date.now();
          changed = true;
        }
      }
      if (changed) saveDailyNotified(notified);
    }

    // ── 2. Regular habit reminders (evening) ─────────────────────────────────
    function checkRegularHabits() {
      if (!canNotify()) return;
      const today = getTodayKey();
      const todayDow = new Date().getDay();
      const now = new Date();
      const notified = getDailyNotified();

      const pending = habitsStore
        .getAll()
        .filter(
          (h) =>
            !h.intervalHours &&
            h.targetDays.includes(todayDow) &&
            !h.completions[today],
        );

      if (
        now.getHours() >= 17 &&
        pending.length > 0 &&
        !notified["habits_evening"]
      ) {
        sendNotification(
          "Evening Habit Reminder 🌿",
          `You still have ${pending.length} habit${pending.length > 1 ? "s" : ""} left for today. Keep your streak going!`,
          "habits_evening",
        );
        notified["habits_evening"] = Date.now();
        saveDailyNotified(notified);
      }
    }

    // ── 3. Interval-based habit reminders ────────────────────────────────────
    function checkIntervalHabits() {
      if (!canNotify()) return;
      const today = getTodayKey();
      const todayDow = new Date().getDay();
      const now = new Date();
      const nowMs = now.getTime();
      const hour = now.getHours();

      // Only fire between 6 AM and 10 PM
      if (hour < 6 || hour >= 22) return;

      const notified = getDailyNotified();
      const intervalHabits = habitsStore
        .getAll()
        .filter((h) => h.intervalHours && h.targetDays.includes(todayDow));

      let changed = false;
      for (const habit of intervalHabits) {
        const intervalMs = habit.intervalHours! * 60 * 60 * 1000;
        const key = `interval_${habit.id}`;
        const lastFired = notified[key] ?? 0; // 0 means never fired today

        if (nowMs - lastFired >= intervalMs) {
          // Tailor the body message to the habit
          let body = `Time for: ${habit.emoji} ${habit.name}`;
          if (habit.name.toLowerCase().includes("pray")) {
            body = `🙏 It's time to pray. Take a moment to connect with God.`;
          } else if (habit.name.toLowerCase().includes("social media")) {
            body = `📵 Step away from social media. You've got life to live! 💪`;
          }

          sendNotification(
            `${habit.emoji} ${habit.name}`,
            body,
            `habit_interval_${habit.id}`,
          );
          notified[key] = nowMs;
          changed = true;
        }
      }
      if (changed) saveDailyNotified(notified);
    }

    // ── Main check ────────────────────────────────────────────────────────────
    function runChecks() {
      checkTasks();
      checkRegularHabits();
      checkIntervalHabits();
    }

    // Run immediately, then every 60 seconds
    runChecks();
    const interval = setInterval(runChecks, 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
