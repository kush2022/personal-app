"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { notesStore, tasksStore, habitsStore } from "@/lib/store";
import { getTodayKey, getLast7Days, getDayOfWeek } from "@/lib/utils";
import { FileText, CheckSquare, Flame, TrendingUp } from "lucide-react";

export function Dashboard() {
  const notes = notesStore.getAll();
  const tasks = tasksStore.getAll();
  const habits = habitsStore.getAll();
  const today = getTodayKey();
  const todayDate = new Date();
  const todayDow = todayDate.getDay();

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const overdue = tasks.filter(
      (t) => !t.done && t.dueDate && t.dueDate < today,
    ).length;
    return {
      total,
      done,
      overdue,
      pct: total ? Math.round((done / total) * 100) : 0,
    };
  }, [tasks, today]);

  const habitStats = useMemo(() => {
    const todayHabits = habits.filter((h) => h.targetDays.includes(todayDow));
    const doneToday = todayHabits.filter((h) => h.completions[today]).length;
    const topStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
    return { todayHabits: todayHabits.length, doneToday, topStreak };
  }, [habits, today, todayDow]);

  const last7 = getLast7Days();

  const weekActivity = last7.map((dateKey) => {
    const d = new Date(dateKey);
    const dow = d.getDay();
    const notesCount = notes.filter((n) =>
      n.createdAt.startsWith(dateKey),
    ).length;
    const tasksCount = tasks.filter(
      (t) => t.done && t.updatedAt.startsWith(dateKey),
    ).length;
    const habitsCount = habits.filter(
      (h) => h.targetDays.includes(dow) && h.completions[dateKey],
    ).length;
    return {
      dateKey,
      label: getDayOfWeek(d),
      notesCount,
      tasksCount,
      habitsCount,
      total: notesCount + tasksCount + habitsCount,
    };
  });

  const maxActivity = Math.max(...weekActivity.map((d) => d.total), 1);

  const recentNotes = notes.slice(0, 3);
  const pendingTasks = tasks.filter((t) => !t.done).slice(0, 5);

  return (
    <div className="space-y-6 pb-8">
      {/* Greeting */}
      <div className="fade-up">
        <p className="text-muted-foreground text-sm">
          {todayDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="font-display text-3xl font-semibold mt-1">
          {getGreeting()}
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 fade-up fade-up-1">
        <StatCard
          icon={<FileText className="w-4 h-4" />}
          label="Notes"
          value={notes.length}
          sub={`${notes.filter((n) => n.pinned).length} pinned`}
          color="earth"
        />
        <StatCard
          icon={<CheckSquare className="w-4 h-4" />}
          label="Tasks"
          value={`${taskStats.done}/${taskStats.total}`}
          sub={
            taskStats.overdue > 0
              ? `${taskStats.overdue} overdue`
              : "All on track"
          }
          color={taskStats.overdue > 0 ? "warm" : "sage"}
        />
        <StatCard
          icon={<Flame className="w-4 h-4" />}
          label="Habits today"
          value={`${habitStats.doneToday}/${habitStats.todayHabits}`}
          sub={`Best streak: ${habitStats.topStreak}d`}
          color="earth"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Task progress"
          value={`${taskStats.pct}%`}
          sub="completion rate"
          color="sage"
        />
      </div>

      {/* Task progress bar */}
      {tasks.length > 0 && (
        <Card className="fade-up fade-up-2">
          <CardContent className="pt-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Overall task completion
              </span>
              <span className="text-sm text-muted-foreground">
                {taskStats.pct}%
              </span>
            </div>
            <Progress value={taskStats.pct} />
          </CardContent>
        </Card>
      )}

      {/* Week activity */}
      <Card className="fade-up fade-up-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Week at a glance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1.5 h-20">
            {weekActivity.map((day, i) => (
              <div
                key={day.dateKey}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full flex flex-col gap-0.5 justify-end"
                  style={{ height: 60 }}
                >
                  {day.total > 0 && (
                    <div
                      className="w-full rounded-[4px] transition-all duration-500 bg-indigo-400/80 shadow-[0_0_12px_rgba(129,140,248,0.5)] border border-indigo-300/30"
                      style={{
                        height: `${(day.total / maxActivity) * 60}px`,
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  )}
                  {day.total === 0 && (
                    <div
                      className="w-full rounded-sm bg-muted"
                      style={{ height: 4 }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] ${day.dateKey === today ? "font-semibold text-primary" : "text-muted-foreground"}`}
                >
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent notes */}
      {recentNotes.length > 0 && (
        <div className="fade-up fade-up-3">
          <h2 className="font-display text-base font-semibold mb-3">
            Recent notes
          </h2>
          <div className="space-y-2">
            {recentNotes.map((note) => (
              <Card key={note.id} className="cursor-default">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {note.title || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {note.content.replace(/<[^>]+>/g, "").slice(0, 80)}
                      </p>
                    </div>
                    {note.pinned && (
                      <Badge variant="earth" className="shrink-0">
                        Pinned
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending tasks */}
      {pendingTasks.length > 0 && (
        <div className="fade-up fade-up-4">
          <h2 className="font-display text-base font-semibold mb-3">
            Pending tasks
          </h2>
          <div className="space-y-1.5">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-lg"
              >
                <div
                  className={`w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor] ${
                    task.priority === "high"
                      ? "bg-rose-400 text-rose-400"
                      : task.priority === "medium"
                        ? "bg-indigo-400 text-indigo-400"
                        : "bg-emerald-400 text-emerald-400"
                  }`}
                />
                <span className="text-sm flex-1 truncate text-slate-100">
                  {task.title}
                </span>
                {task.dueDate && (
                  <span
                    className={`text-xs shrink-0 ${task.dueDate < today ? "text-rose-400 font-medium drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]" : "text-slate-400"}`}
                  >
                    {new Date(task.dueDate + "T00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length === 0 && tasks.length === 0 && habits.length === 0 && (
        <div className="text-center py-16 text-muted-foreground fade-up">
          <p className="font-display text-xl mb-2">Welcome to LifeOS 🌿</p>
          <p className="text-sm">
            Start by adding some notes, tasks, or habits.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: "earth" | "sage" | "warm";
}) {
  const bg = {
    earth:
      "bg-indigo-500/10 border-indigo-500/20 shadow-[0_4px_24px_rgba(99,102,241,0.15)]",
    sage: "bg-emerald-500/10 border-emerald-500/20 shadow-[0_4px_24px_rgba(16,185,129,0.15)]",
    warm: "bg-rose-500/10 border-rose-500/20 shadow-[0_4px_24px_rgba(244,63,94,0.15)]",
  }[color];
  const text = {
    earth: "text-indigo-200 drop-shadow-[0_0_8px_rgba(199,210,254,0.3)]",
    sage: "text-emerald-200 drop-shadow-[0_0_8px_rgba(167,243,208,0.3)]",
    warm: "text-rose-200 drop-shadow-[0_0_8px_rgba(254,205,211,0.3)]",
  }[color];
  return (
    <div
      className={`rounded-2xl border backdrop-blur-xl p-4 transition-all hover:scale-[1.02] ${bg}`}
    >
      <div className={`flex items-center gap-1.5 mb-2 ${text}`}>
        {icon}
        <span className="text-xs font-medium tracking-wide opacity-90">
          {label}
        </span>
      </div>
      <p
        className={`font-display text-2xl font-semibold tracking-tight ${text}`}
      >
        {value}
      </p>
      <p className="text-[11px] text-slate-300/70 mt-1">{sub}</p>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning ☀️";
  if (h < 17) return "Good afternoon 🌤";
  return "Good evening 🌙";
}
