"use client";

import { useState, useCallback, useMemo } from "react";
import { expensesStore, type Expense, type ExpenseCategory } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select } from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Wallet,
  TrendingDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTodayKey } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: {
  label: ExpenseCategory;
  emoji: string;
  color: string;
  glow: string;
}[] = [
  {
    label: "Food & Drink",
    emoji: "🍽️",
    color: "bg-orange-500/20 border-orange-500/30 text-orange-300",
    glow: "rgba(249,115,22,0.5)",
  },
  {
    label: "Transport",
    emoji: "🚗",
    color: "bg-sky-500/20 border-sky-500/30 text-sky-300",
    glow: "rgba(14,165,233,0.5)",
  },
  {
    label: "Shopping",
    emoji: "🛍️",
    color: "bg-pink-500/20 border-pink-500/30 text-pink-300",
    glow: "rgba(236,72,153,0.5)",
  },
  {
    label: "Health",
    emoji: "💊",
    color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    glow: "rgba(52,211,153,0.5)",
  },
  {
    label: "Entertainment",
    emoji: "🎬",
    color: "bg-purple-500/20 border-purple-500/30 text-purple-300",
    glow: "rgba(168,85,247,0.5)",
  },
  {
    label: "Bills & Utilities",
    emoji: "⚡",
    color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-300",
    glow: "rgba(234,179,8,0.5)",
  },
  {
    label: "Other",
    emoji: "📦",
    color: "bg-slate-500/20 border-slate-500/30 text-slate-300",
    glow: "rgba(148,163,184,0.5)",
  },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getCatDef(cat: ExpenseCategory) {
  return CATEGORIES.find((c) => c.label === cat) ?? CATEGORIES[6];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Expenses() {
  const today = getTodayKey();
  const nowDate = new Date();

  const [expenses, setExpenses] = useState<Expense[]>(() =>
    expensesStore.getAll(),
  );
  const [viewYear, setViewYear] = useState(nowDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(nowDate.getMonth()); // 0-indexed

  const [isOpen, setIsOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState({
    amount: "",
    category: "Food & Drink" as ExpenseCategory,
    description: "",
    date: today,
  });

  const refresh = useCallback(() => setExpenses(expensesStore.getAll()), []);

  // ── Filtering ───────────────────────────────────────────────────────────────
  const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(monthStr)),
    [expenses, monthStr],
  );

  const monthTotal = useMemo(
    () => monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses],
  );

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of monthExpenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return CATEGORIES.map((c) => ({ ...c, total: map[c.label] ?? 0 }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [monthExpenses]);

  const maxCat = byCategory[0]?.total ?? 1;

  // ── Navigation ──────────────────────────────────────────────────────────────
  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }
  const isCurrentMonth =
    viewYear === nowDate.getFullYear() && viewMonth === nowDate.getMonth();

  // ── Dialog ──────────────────────────────────────────────────────────────────
  function openNew() {
    setForm({
      amount: "",
      category: "Food & Drink",
      description: "",
      date: today,
    });
    setEditExpense(null);
    setIsOpen(true);
  }

  function openEdit(exp: Expense) {
    setForm({
      amount: String(exp.amount),
      category: exp.category,
      description: exp.description,
      date: exp.date,
    });
    setEditExpense(exp);
    setIsOpen(true);
  }

  function handleSave() {
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) return;
    const data = {
      amount: amt,
      category: form.category,
      description: form.description,
      date: form.date,
    };
    if (editExpense) {
      expensesStore.update(editExpense.id, data);
    } else {
      expensesStore.create(data);
    }
    refresh();
    setIsOpen(false);
  }

  function handleDelete(id: string) {
    expensesStore.delete(id);
    refresh();
    setIsOpen(false);
  }

  // ── Grouped by date for the list ─────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of monthExpenses) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [monthExpenses]);

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between fade-up">
        <h1 className="font-display text-2xl font-semibold">Expenses</h1>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add expense
        </Button>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between fade-up fade-up-1">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-300"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-sm text-slate-200 tracking-wide">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-300 disabled:opacity-30 disabled:cursor-default"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Monthly total card */}
      <Card className="fade-up fade-up-1">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.2)] shrink-0">
              <Wallet className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
                Total spent
              </p>
              <p className="font-display text-3xl font-bold text-white tracking-tight mt-0.5">
                KES{" "}
                {monthTotal.toLocaleString("en-KE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {monthExpenses.length} transactions this month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <Card className="fade-up fade-up-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" /> By Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byCategory.map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </span>
                  <span className="font-semibold text-white tabular-nums">
                    KES{" "}
                    {cat.total.toLocaleString("en-KE", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${(cat.total / maxCat) * 100}%`,
                      background: `linear-gradient(to right, ${cat.glow.replace("0.5", "0.8")}, ${cat.glow.replace("0.5", "0.4")})`,
                      boxShadow: `0 0 8px ${cat.glow}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {monthExpenses.length === 0 && (
        <div className="text-center py-16 text-slate-400 fade-up fade-up-2">
          <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg mb-1 text-slate-300">
            No expenses logged
          </p>
          <p className="text-sm">
            Tap "Add expense" to start tracking your spending.
          </p>
        </div>
      )}

      {/* Expense list grouped by date */}
      {grouped.map(([date, entries]) => {
        const label =
          date === today
            ? "Today"
            : date ===
                (() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 1);
                  return d.toISOString().split("T")[0];
                })()
              ? "Yesterday"
              : new Date(date + "T00:00").toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });

        const dayTotal = entries.reduce((s, e) => s + e.amount, 0);

        return (
          <div key={date} className="fade-up fade-up-3 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {label}
              </span>
              <span className="text-xs text-slate-400 tabular-nums">
                KES{" "}
                {dayTotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {entries.map((exp) => {
              const cat = getCatDef(exp.category);
              return (
                <button
                  key={exp.id}
                  onClick={() => openEdit(exp)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-2xl border backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] text-left",
                    "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.2)]",
                  )}
                >
                  <span className="text-xl shrink-0">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate">
                      {exp.description || exp.category}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {exp.category}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white tabular-nums shrink-0">
                    KES{" "}
                    {exp.amount.toLocaleString("en-KE", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </button>
              );
            })}
          </div>
        );
      })}

      {/* Add / Edit Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(o) => {
          if (!o) setIsOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editExpense ? "Edit expense" : "New expense"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Amount */}
            <div>
              <Label htmlFor="exp-amount">Amount (KES)</Label>
              <Input
                id="exp-amount"
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="mt-1.5 text-lg font-semibold"
                autoFocus
                min="0"
                step="any"
              />
            </div>

            {/* Category chips */}
            <div>
              <Label>Category</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() =>
                      setForm((f) => ({ ...f, category: cat.label }))
                    }
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] font-medium transition-all duration-200",
                      form.category === cat.label
                        ? `${cat.color} scale-105 shadow-lg`
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
                    )}
                  >
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="text-center leading-tight">
                      {cat.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="exp-desc">
                Description{" "}
                <span className="text-slate-500 font-normal">(optional)</span>
              </Label>
              <Input
                id="exp-desc"
                placeholder="e.g. Lunch at Java, Uber ride…"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="exp-date">Date</Label>
              <Input
                id="exp-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            {editExpense && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(editExpense.id)}
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
                disabled={!form.amount || parseFloat(form.amount) <= 0}
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
