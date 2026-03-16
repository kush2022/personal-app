"use client";

import { useEffect, useRef } from "react";
import { tasksStore, habitsStore } from "@/lib/store";
import { getTodayKey } from "@/lib/utils";

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
      tag,
      icon: "/favicon.ico",
    });
  } catch (error) {
    console.error("Notification error", error);
  }
}

export function useNotifications() {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (initialized.current) return;
    initialized.current = true;

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

    function checkTasks() {
      if (!canNotify()) return;
      const today = getTodayKey();
      const tasks = tasksStore.getAll();
      const notified = getDailyNotified();
      let changed = false;

      const dueTasks = tasks.filter(
        (t) => !t.done && t.dueDate && t.dueDate <= today,
      );
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

      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const reminderTasks = tasks.filter(
        (t) => t.reminderTime && t.reminderTime === currentTime,
      );
      for (const task of reminderTasks) {
        const key = `task_reminder_${task.id}`;
        if (!notified[key]) {
          sendNotification("Task Reminder ⏰", `${task.title} reminder`, key);
          notified[key] = Date.now();
          changed = true;
        }
      }

      if (changed) {
        saveDailyNotified(notified);
      }
    }

    function checkHabitReminders() {
      if (!canNotify()) return;
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const todayDow = now.getDay();
      const notified = getDailyNotified();
      let changed = false;

      const reminderHabits = habitsStore
        .getAll()
        .filter(
          (habit) =>
            habit.reminderTime &&
            habit.targetDays.includes(todayDow) &&
            habit.reminderTime === currentTime,
        );

      for (const habit of reminderHabits) {
        const key = `habit_reminder_${habit.id}`;
        if (!notified[key]) {
          sendNotification(
            `${habit.emoji} ${habit.name}`,
            `It's time for ${habit.name}`,
            key,
          );
          notified[key] = Date.now();
          changed = true;
        }
      }

      if (changed) {
        saveDailyNotified(notified);
      }
    }

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

    function checkIntervalHabits() {
      if (!canNotify()) return;
      const today = getTodayKey();
      const todayDow = new Date().getDay();
      const now = new Date();
      const nowMs = now.getTime();
      const hour = now.getHours();

      if (hour < 6 || hour >= 22) return;

      const notified = getDailyNotified();
      const intervalHabits = habitsStore
        .getAll()
        .filter((h) => h.intervalHours && h.targetDays.includes(todayDow));

      let changed = false;
      for (const habit of intervalHabits) {
        const intervalMs = habit.intervalHours! * 60 * 60 * 1000;
        const key = `interval_${habit.id}`;
        const lastFired = notified[key] ?? 0;

        if (nowMs - lastFired >= intervalMs) {
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
      if (changed) {
        saveDailyNotified(notified);
      }
    }

    function runChecks() {
      checkTasks();
      checkHabitReminders();
      checkRegularHabits();
      checkIntervalHabits();
    }

    runChecks();
    const interval = setInterval(runChecks, 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
