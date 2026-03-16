"use client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  reminderTime?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  targetDays: number[]; // 0=Sun … 6=Sat
  completions: Record<string, boolean>; // "YYYY-MM-DD" -> true
  createdAt: string;
  streak: number;
  intervalHours?: number; // if set, notify every N hours (e.g. 1 for prayer, 2 for social media)
  intervalSeconds?: number; // if set, notify every N seconds (dev/test)
  isDefault?: boolean; // marks a system-seeded habit
  reminderTime?: string;
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | "Food & Drink"
  | "Transport"
  | "Shopping"
  | "Health"
  | "Entertainment"
  | "Bills & Utilities"
  | "Other";

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // "YYYY-MM-DD"
  createdAt: string;
}

export interface GratitudeEntry {
  date: string; // "YYYY-MM-DD"
  items: [string, string, string];
  reflection: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Keys ────────────────────────────────────────────────────────────────────

const KEYS = {
  notes: "lifeos:notes",
  tasks: "lifeos:tasks",
  habits: "lifeos:habits",
  expenses: "lifeos:expenses",
  gratitude: "lifeos:gratitude",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export const notesStore = {
  getAll(): Note[] {
    return load<Note[]>(KEYS.notes, []);
  },
  save(notes: Note[]) {
    save(KEYS.notes, notes);
  },

  create(data: Omit<Note, "id" | "createdAt" | "updatedAt">): Note {
    const note: Note = {
      ...data,
      id: uid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const notes = notesStore.getAll();
    notes.unshift(note);
    notesStore.save(notes);
    return note;
  },

  update(id: string, data: Partial<Note>): Note | null {
    const notes = notesStore.getAll();
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    notes[idx] = {
      ...notes[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    notesStore.save(notes);
    return notes[idx];
  },

  delete(id: string) {
    const notes = notesStore.getAll().filter((n) => n.id !== id);
    notesStore.save(notes);
  },
};

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasksStore = {
  getAll(): Task[] {
    return load<Task[]>(KEYS.tasks, []);
  },
  save(tasks: Task[]) {
    save(KEYS.tasks, tasks);
  },

  create(data: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
    const task: Task = {
      ...data,
      id: uid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const tasks = tasksStore.getAll();
    tasks.unshift(task);
    tasksStore.save(tasks);
    return task;
  },

  update(id: string, data: Partial<Task>): Task | null {
    const tasks = tasksStore.getAll();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = {
      ...tasks[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    tasksStore.save(tasks);
    return tasks[idx];
  },

  delete(id: string) {
    const tasks = tasksStore.getAll().filter((t) => t.id !== id);
    tasksStore.save(tasks);
  },

  toggleDone(id: string) {
    const tasks = tasksStore.getAll();
    const task = tasks.find((t) => t.id === id);
    if (task) tasksStore.update(id, { done: !task.done });
  },
};

// ─── Habits ──────────────────────────────────────────────────────────────────

export const habitsStore = {
  getAll(): Habit[] {
    return load<Habit[]>(KEYS.habits, []);
  },
  save(habits: Habit[]) {
    save(KEYS.habits, habits);
  },

  create(
    data: Omit<Habit, "id" | "createdAt" | "streak" | "completions">,
  ): Habit {
    const habit: Habit = {
      ...data,
      id: uid(),
      createdAt: new Date().toISOString(),
      completions: {},
      streak: 0,
    };
    const habits = habitsStore.getAll();
    habits.unshift(habit);
    habitsStore.save(habits);
    return habit;
  },

  toggle(id: string, dateKey: string) {
    const habits = habitsStore.getAll();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    habit.completions[dateKey] = !habit.completions[dateKey];
    habit.streak = habitsStore.calcStreak(habit);
    habitsStore.save(habits);
  },

  calcStreak(habit: Habit): number {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();
      if (!habit.targetDays.includes(dayOfWeek)) continue;
      if (habit.completions[key]) streak++;
      else break;
    }
    return streak;
  },

  delete(id: string) {
    const habits = habitsStore.getAll().filter((h) => h.id !== id);
    habitsStore.save(habits);
  },

  update(id: string, data: Partial<Habit>) {
    const habits = habitsStore.getAll();
    const idx = habits.findIndex((h) => h.id === id);
    if (idx === -1) return;
    habits[idx] = { ...habits[idx], ...data };
    habitsStore.save(habits);
  },
};

// ─── Seed Default Habits ──────────────────────────────────────────────────────

const SEED_KEY = "lifeos:defaults:seeded:v2";

export function seedDefaultHabits() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_KEY)) return; // already seeded

  const allDays = [0, 1, 2, 3, 4, 5, 6];

  const defaults: Omit<Habit, "id" | "createdAt" | "streak" | "completions">[] =
    [
      {
        name: "Pray",
        emoji: "🙏",
        color: "earth", // maps to indigo in the glass theme
        targetDays: allDays,
        intervalHours: 1, // remind every 1 hour
        isDefault: true,
      },
      {
        name: "Social Media Detox",
        emoji: "📵",
        color: "warm", // maps to rose in the glass theme
        targetDays: allDays,
        intervalHours: 2, // remind every 2 hours
        isDefault: true,
      },
      {
        name: "Push Test (30s)",
        emoji: "🔔",
        color: "stone",
        targetDays: allDays,
        intervalSeconds: 30,
        isDefault: true,
      },
    ];

  for (const d of defaults) {
    habitsStore.create(d);
  }

  localStorage.setItem(SEED_KEY, "1");
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const expensesStore = {
  getAll(): Expense[] {
    return load<Expense[]>(KEYS.expenses, []);
  },
  save(expenses: Expense[]) {
    save(KEYS.expenses, expenses);
  },

  create(data: Omit<Expense, "id" | "createdAt">): Expense {
    const expense: Expense = {
      ...data,
      id: uid(),
      createdAt: new Date().toISOString(),
    };
    const expenses = expensesStore.getAll();
    expenses.unshift(expense);
    expensesStore.save(expenses);
    return expense;
  },

  update(id: string, data: Partial<Expense>): Expense | null {
    const expenses = expensesStore.getAll();
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    expenses[idx] = { ...expenses[idx], ...data };
    expensesStore.save(expenses);
    return expenses[idx];
  },

  delete(id: string) {
    const expenses = expensesStore.getAll().filter((e) => e.id !== id);
    expensesStore.save(expenses);
  },
};

export const gratitudeStore = {
  getAll(): GratitudeEntry[] {
    return load<GratitudeEntry[]>(KEYS.gratitude, []);
  },
  save(entries: GratitudeEntry[]) {
    save(KEYS.gratitude, entries);
  },
  getByDate(date: string): GratitudeEntry | undefined {
    return gratitudeStore.getAll().find((e) => e.date === date);
  },
  upsert(date: string, items: [string, string, string], reflection: string) {
    const entries = gratitudeStore.getAll();
    const idx = entries.findIndex((e) => e.date === date);
    const now = new Date().toISOString();
    if (idx === -1) {
      entries.unshift({
        date,
        items,
        reflection,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      entries[idx] = { ...entries[idx], items, reflection, updatedAt: now };
    }
    gratitudeStore.save(entries);
  },
};
