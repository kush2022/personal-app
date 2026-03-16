"use client";

import { useState, useCallback, useMemo } from "react";
import { tasksStore, type Task } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, CheckSquare, Circle, Filter, Tag } from "lucide-react";
import { formatDate, getTodayKey } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Filter = "all" | "pending" | "done" | "high" | "overdue";

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(() => tasksStore.getAll());
  const [filter, setFilter] = useState<Filter>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: "",
    priority: "medium" as Task["priority"],
    dueDate: "",
    tags: "",
  });

  const today = getTodayKey();
  const refresh = useCallback(() => setTasks(tasksStore.getAll()), []);

  const filtered = useMemo(() => {
    switch (filter) {
      case "pending":
        return tasks.filter((t) => !t.done);
      case "done":
        return tasks.filter((t) => t.done);
      case "high":
        return tasks.filter((t) => t.priority === "high");
      case "overdue":
        return tasks.filter((t) => !t.done && !!t.dueDate && t.dueDate < today);
      default:
        return tasks;
    }
  }, [tasks, filter, today]);

  const pending = tasks.filter((t) => !t.done).length;
  const overdue = tasks.filter(
    (t) => !t.done && !!t.dueDate && t.dueDate < today,
  ).length;

  function openNew() {
    setForm({ title: "", priority: "medium", dueDate: "", tags: "" });
    setEditTask(null);
    setIsOpen(true);
  }

  function openEdit(task: Task) {
    setForm({
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate || "",
      tags: task.tags.join(", "),
    });
    setEditTask(task);
    setIsOpen(true);
  }

  function handleSave() {
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const data = {
      title: form.title,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      tags,
      done: false,
    };
    if (editTask) {
      tasksStore.update(editTask.id, { ...data, done: editTask.done });
    } else {
      tasksStore.create(data);
    }
    refresh();
    setIsOpen(false);
  }

  function handleToggle(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    tasksStore.toggleDone(id);
    refresh();
  }

  function handleDelete(id: string) {
    tasksStore.delete(id);
    refresh();
    setIsOpen(false);
  }

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: "all", label: "All", count: tasks.length },
    { key: "pending", label: "Pending", count: pending },
    { key: "done", label: "Done" },
    { key: "high", label: "High priority" },
    ...(overdue > 0
      ? [{ key: "overdue" as Filter, label: "Overdue", count: overdue }]
      : []),
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between fade-up">
        <h1 className="font-display text-2xl font-semibold">Tasks</h1>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add task
        </Button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 fade-up fade-up-1 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            {f.label}
            {f.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] rounded-full px-1.5 py-0.5",
                  filter === f.key
                    ? "bg-primary-foreground/20"
                    : "bg-muted-foreground/20",
                )}
              >
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="text-center py-16 text-muted-foreground fade-up fade-up-2">
          <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg mb-1">No tasks yet</p>
          <p className="text-sm">Add your first task to get started.</p>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2 fade-up fade-up-2">
        {filtered.map((task, i) => (
          <TaskRow
            key={task.id}
            task={task}
            index={i}
            today={today}
            onToggle={handleToggle}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
        {filtered.length === 0 && tasks.length > 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No tasks match this filter.
          </p>
        )}
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
            <DialogTitle>{editTask ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="task-title">Task</Label>
              <Input
                id="task-title"
                placeholder="What needs to be done?"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="mt-1.5"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) =>
                    setForm((f) => ({
                      ...f,
                      priority: value as Task["priority"],
                    }))
                  }
                >
                  <SelectTrigger id="task-priority" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🔴 High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="task-tags" className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Tags
                <span className="font-normal text-muted-foreground">
                  (comma separated)
                </span>
              </Label>
              <Input
                id="task-tags"
                placeholder="work, urgent…"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            {editTask && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(editTask.id)}
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
                disabled={!form.title.trim()}
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

function TaskRow({
  task,
  index,
  today,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  index: number;
  today: string;
  onToggle: (id: string, e: React.MouseEvent) => void;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
}) {
  const isOverdue = !task.done && !!task.dueDate && task.dueDate < today;

  const priorityDot = {
    high: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
    medium: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]",
    low: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
  }[task.priority];

  return (
    <Card
      className={cn(
        "transition-all duration-300 group cursor-pointer",
        task.done
          ? "opacity-40"
          : "hover:border-white/20 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] hover:scale-[1.01]",
        isOverdue &&
          "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
      )}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => onEdit(task)}
    >
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-3">
          <button
            className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => onToggle(task.id, e)}
          >
            {task.done ? (
              <CheckSquare className="w-5 h-5 text-primary" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          <div className={cn("w-2 h-2 rounded-full shrink-0", priorityDot)} />
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                task.done && "line-through text-muted-foreground",
              )}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {task.dueDate && (
                <span
                  className={cn(
                    "text-[11px]",
                    isOverdue
                      ? "text-destructive font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {isOverdue ? "Overdue · " : ""}
                  {new Date(task.dueDate + "T00:00").toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )}
                </span>
              )}
              {task.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="earth"
                  className="text-[10px] py-0 px-1.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
