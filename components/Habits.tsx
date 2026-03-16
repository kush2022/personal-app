"use client";

import { useState, useCallback } from "react";
import { habitsStore, type Habit } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Flame, CheckCircle2, Circle } from "lucide-react";
import { getTodayKey, getLast7Days } from "@/lib/utils";
import { cn } from "@/lib/utils";

const COLORS = [
  {
    label: "Indigo",
    value: "earth",
    bg: "bg-indigo-500/20",
    ring: "ring-indigo-400",
    text: "text-indigo-400",
    fill: "#818cf8",
  },
  {
    label: "Emerald",
    value: "sage",
    bg: "bg-emerald-500/20",
    ring: "ring-emerald-400",
    text: "text-emerald-400",
    fill: "#34d399",
  },
  {
    label: "Rose",
    value: "warm",
    bg: "bg-rose-500/20",
    ring: "ring-rose-400",
    text: "text-rose-400",
    fill: "#fb7185",
  },
  {
    label: "Amber",
    value: "stone",
    bg: "bg-amber-500/20",
    ring: "ring-amber-400",
    text: "text-amber-400",
    fill: "#fbbf24",
  },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DEFAULT_EMOJIS = [
  "🌅",
  "🏃",
  "📚",
  "💧",
  "🧘",
  "✍️",
  "🥗",
  "😴",
  "🎯",
  "💪",
];

export function Habits() {
  const [habits, setHabits] = useState<Habit[]>(() => habitsStore.getAll());
  const [isOpen, setIsOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [form, setForm] = useState({
    name: "",
    emoji: "🌅",
    color: "earth",
    targetDays: [1, 2, 3, 4, 5] as number[],
  });

  const today = getTodayKey();
  const todayDow = new Date().getDay();
  const last7 = getLast7Days();
  const refresh = useCallback(() => setHabits(habitsStore.getAll()), []);

  function openNew() {
    setForm({
      name: "",
      emoji: "🌅",
      color: "earth",
      targetDays: [1, 2, 3, 4, 5],
    });
    setEditHabit(null);
    setIsOpen(true);
  }

  function openEdit(habit: Habit) {
    setForm({
      name: habit.name,
      emoji: habit.emoji,
      color: habit.color,
      targetDays: habit.targetDays,
    });
    setEditHabit(habit);
    setIsOpen(true);
  }

  function handleSave() {
    if (editHabit) {
      habitsStore.update(editHabit.id, {
        name: form.name,
        emoji: form.emoji,
        color: form.color,
        targetDays: form.targetDays,
      });
    } else {
      habitsStore.create({
        name: form.name,
        emoji: form.emoji,
        color: form.color,
        targetDays: form.targetDays,
      });
    }
    refresh();
    setIsOpen(false);
  }

  function handleToggle(habitId: string) {
    habitsStore.toggle(habitId, today);
    refresh();
  }

  function handleDelete(id: string) {
    habitsStore.delete(id);
    refresh();
    setIsOpen(false);
  }

  function toggleDay(dow: number) {
    setForm((f) => ({
      ...f,
      targetDays: f.targetDays.includes(dow)
        ? f.targetDays.filter((d) => d !== dow)
        : [...f.targetDays, dow].sort(),
    }));
  }

  const todayHabits = habits.filter((h) => h.targetDays.includes(todayDow));
  const completedToday = todayHabits.filter((h) => h.completions[today]).length;
  const totalToday = todayHabits.length;
  const pct =
    totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between fade-up">
        <h1 className="font-display text-2xl font-semibold">Habits</h1>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="w-4 h-4" /> New habit
        </Button>
      </div>

      {/* Today summary ring */}
      {habits.length > 0 && (
        <Card className="fade-up fade-up-1">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-5">
              <RingProgress pct={pct} size={72} />
              <div>
                <p className="font-display text-xl font-semibold">
                  {completedToday}/{totalToday} today
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {pct === 100
                    ? "All habits done! 🎉"
                    : totalToday === 0
                      ? "No habits scheduled"
                      : `${totalToday - completedToday} remaining`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {habits.length === 0 && (
        <div className="text-center py-16 text-muted-foreground fade-up fade-up-2">
          <span className="text-4xl block mb-3">🌱</span>
          <p className="font-display text-lg mb-1">No habits yet</p>
          <p className="text-sm">
            Build consistent routines, one day at a time.
          </p>
        </div>
      )}

      {/* Habit cards */}
      <div className="space-y-3 fade-up fade-up-2">
        {habits.map((habit, i) => {
          const colorDef =
            COLORS.find((c) => c.value === habit.color) || COLORS[0];
          const isScheduledToday = habit.targetDays.includes(todayDow);
          const isDoneToday = habit.completions[today];

          return (
            <Card
              key={habit.id}
              className={cn(
                "transition-all duration-300 hover:scale-[1.01]",
                isDoneToday &&
                  isScheduledToday &&
                  "border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.1)]",
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardContent className="py-4 px-4">
                <div className="flex items-start gap-3">
                  {/* Check button */}
                  <button
                    onClick={() => isScheduledToday && handleToggle(habit.id)}
                    disabled={!isScheduledToday}
                    className={cn(
                      "shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all",
                      isScheduledToday &&
                        !isDoneToday &&
                        `${colorDef.bg} hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:opacity-80 border border-white/5`,
                      isDoneToday &&
                        "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]",
                      !isScheduledToday &&
                        "bg-white/5 opacity-40 cursor-default",
                    )}
                  >
                    {habit.emoji}
                  </button>

                  {/* Info */}
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => openEdit(habit)}
                  >
                    <div className="flex items-center gap-2 cursor-pointer">
                      <p className="font-medium text-sm">{habit.name}</p>
                      {habit.intervalHours && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-1.5 py-0.5 rounded-full backdrop-blur-sm font-medium">
                          🔔 every {habit.intervalHours}h
                        </span>
                      )}
                      {habit.streak > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-rose-400 font-semibold drop-shadow-[0_0_6px_rgba(251,113,133,0.4)]">
                          <Flame className="w-3 h-3" />
                          {habit.streak}d
                        </span>
                      )}
                      {isDoneToday && isScheduledToday && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                      )}
                    </div>

                    {/* 7-day grid */}
                    <div className="flex items-center gap-1 mt-2">
                      {last7.map((dateKey) => {
                        const d = new Date(dateKey);
                        const dow = d.getDay();
                        const scheduled = habit.targetDays.includes(dow);
                        const done = habit.completions[dateKey];
                        const isToday = dateKey === today;
                        return (
                          <div
                            key={dateKey}
                            className="flex flex-col items-center gap-0.5"
                          >
                            <div
                              className={cn(
                                "w-5 h-5 rounded-sm transition-colors",
                                !scheduled && "bg-white/5 opacity-30",
                                scheduled &&
                                  done &&
                                  `${colorDef.bg} border border-white/10 shadow-[0_0_8px_rgba(255,255,255,0.1)]`,
                                scheduled &&
                                  !done &&
                                  isToday &&
                                  `border-2 ${colorDef.ring}`,
                                scheduled && !done && !isToday && "bg-white/5",
                              )}
                            />
                            <span
                              className={cn(
                                "text-[9px]",
                                isToday
                                  ? "font-bold text-primary"
                                  : "text-muted-foreground",
                              )}
                            >
                              {DAYS[dow].charAt(0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(o) => {
          if (!o) setIsOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editHabit ? "Edit habit" : "New habit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Emoji picker */}
            <div>
              <Label>Emoji</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {DEFAULT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setForm((f) => ({ ...f, emoji }))}
                    className={cn(
                      "w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors",
                      form.emoji === emoji
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "bg-muted hover:bg-secondary",
                    )}
                  >
                    {emoji}
                  </button>
                ))}
                <Input
                  placeholder="✏️"
                  value={DEFAULT_EMOJIS.includes(form.emoji) ? "" : form.emoji}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, emoji: e.target.value || "🌅" }))
                  }
                  className="w-16 text-center px-1"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="habit-name">Habit name</Label>
              <Input
                id="habit-name"
                placeholder="e.g. Morning run, Read 30 min…"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-1.5"
                autoFocus
              />
            </div>

            {/* Color */}
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      c.bg,
                      form.color === c.value
                        ? `ring-2 ring-offset-2 ${c.ring}`
                        : "opacity-60 hover:opacity-100",
                    )}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Target days */}
            <div>
              <Label>Repeat on</Label>
              <div className="flex gap-1.5 mt-1.5">
                {DAYS.map((day, dow) => (
                  <button
                    key={dow}
                    onClick={() => toggleDay(dow)}
                    className={cn(
                      "flex-1 py-1.5 rounded-md text-xs font-medium transition-colors",
                      form.targetDays.includes(dow)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {day.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            {editHabit && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(editHabit.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!form.name.trim() || form.targetDays.length === 0}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RingProgress({ pct, size }: { pct: number; size: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={6}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}
