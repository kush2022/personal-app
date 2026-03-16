"use client";

import { useState, useCallback } from "react";
import { notesStore, type Note } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Edit2,
  Tag,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => notesStore.getAll());
  const [search, setSearch] = useState("");
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });

  const refresh = useCallback(() => setNotes(notesStore.getAll()), []);

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const pinned = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);

  function openNew() {
    setForm({ title: "", content: "", tags: "" });
    setEditNote(null);
    setIsNew(true);
  }

  function openEdit(note: Note) {
    setForm({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
    });
    setEditNote(note);
    setIsNew(false);
  }

  function handleSave() {
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (editNote) {
      notesStore.update(editNote.id, {
        title: form.title,
        content: form.content,
        tags,
      });
    } else {
      notesStore.create({
        title: form.title,
        content: form.content,
        tags,
        pinned: false,
      });
    }
    refresh();
    setEditNote(null);
    setIsNew(false);
  }

  function handleDelete(id: string) {
    notesStore.delete(id);
    refresh();
    setEditNote(null);
    setIsNew(false);
  }

  function togglePin(note: Note, e: React.MouseEvent) {
    e.stopPropagation();
    notesStore.update(note.id, { pinned: !note.pinned });
    refresh();
  }

  const isOpen = isNew || !!editNote;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between fade-up">
        <h1 className="font-display text-2xl font-semibold">Notes</h1>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="w-4 h-4" /> New note
        </Button>
      </div>

      {/* Search */}
      <div className="relative fade-up fade-up-1">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search notes…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Empty state */}
      {notes.length === 0 && (
        <div className="text-center py-16 text-muted-foreground fade-up fade-up-2">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg mb-1">No notes yet</p>
          <p className="text-sm">
            Tap "New note" to capture your first thought.
          </p>
        </div>
      )}

      {/* Pinned */}
      {pinned.length > 0 && (
        <section className="fade-up fade-up-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Pinned
          </p>
          <div className="space-y-2">
            {pinned.map((note, i) => (
              <NoteCard
                key={note.id}
                note={note}
                index={i}
                onEdit={openEdit}
                onPin={togglePin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {/* All notes */}
      {unpinned.length > 0 && (
        <section className="fade-up fade-up-3">
          {pinned.length > 0 && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              All notes
            </p>
          )}
          <div className="space-y-2">
            {unpinned.map((note, i) => (
              <NoteCard
                key={note.id}
                note={note}
                index={i}
                onEdit={openEdit}
                onPin={togglePin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Edit / Create Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(o) => {
          if (!o) {
            setEditNote(null);
            setIsNew(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{isNew ? "New note" : "Edit note"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                placeholder="Note title…"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                placeholder="Write your note here…"
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                className="mt-1.5 min-h-[200px] font-mono text-sm leading-relaxed"
              />
            </div>
            <div>
              <Label htmlFor="note-tags" className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Tags
                <span className="font-normal text-muted-foreground">
                  (comma separated)
                </span>
              </Label>
              <Input
                id="note-tags"
                placeholder="work, ideas, personal…"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 flex-row justify-between sm:justify-between">
            {editNote && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(editNote.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditNote(null);
                  setIsNew(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!form.title && !form.content}
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

function NoteCard({
  note,
  index,
  onEdit,
  onPin,
  onDelete,
}: {
  note: Note;
  index: number;
  onEdit: (n: Note) => void;
  onPin: (n: Note, e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:border-indigo-400 hover:shadow-[0_8px_32px_0_rgba(129,140,248,0.15)] hover:bg-white/[0.05] transition-all duration-300 group hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => onEdit(note)}
    >
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">
              {note.title || "Untitled"}
            </p>
            {note.content && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {note.content.slice(0, 120)}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-muted-foreground">
                {formatDate(note.updatedAt)}
              </span>
              {note.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} className="text-[10px] py-0 px-1.5">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              className="p-1 rounded hover:bg-muted transition-colors"
              onClick={(e) => onPin(note, e)}
              title={note.pinned ? "Unpin" : "Pin"}
            >
              {note.pinned ? (
                <PinOff className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <Pin className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            <button
              className="p-1 rounded hover:bg-muted transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
            >
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-rose-500/20 hover:text-rose-400 transition-colors text-slate-400"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
