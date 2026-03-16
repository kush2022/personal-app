"use client";

import { useState, useCallback, useMemo } from "react";
import { gratitudeStore, type GratitudeEntry } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getTodayKey, formatDate } from "@/lib/utils";

const EMPTY_ITEMS: [string, string, string] = ["", "", ""];

export function Gratitude() {
  const today = getTodayKey();
  const [items, setItems] = useState<[string, string, string]>(() => {
    const entry = gratitudeStore.getByDate(today);
    return entry?.items ?? EMPTY_ITEMS;
  });
  const [reflection, setReflection] = useState(() => {
    const entry = gratitudeStore.getByDate(today);
    return entry?.reflection ?? "";
  });

  const entries = useMemo(() => gratitudeStore.getAll(), []);
  const hasEntry = items.some((item) => item.trim().length > 0) || !!reflection.trim();

  const refresh = useCallback(() => {
    const entry = gratitudeStore.getByDate(today);
    setItems(entry?.items ?? EMPTY_ITEMS);
    setReflection(entry?.reflection ?? "");
  }, [today]);

  function handleSave() {
    if (!hasEntry) return;
    gratitudeStore.upsert(today, items, reflection.trim());
    refresh();
  }

  const recent = entries.slice(0, 5);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between fade-up">
        <div>
          <p className="text-xs text-muted-foreground">{formatDate(today)}</p>
          <h1 className="font-display text-2xl font-semibold">Gratitude</h1>
        </div>
        <Button size="sm" onClick={handleSave} disabled={!hasEntry}>
          Save
        </Button>
      </div>

      <Card className="fade-up fade-up-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">3 things I’m grateful for</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((value, idx) => (
            <div key={idx}>
              <Label htmlFor={`gratitude-item-${idx}`} className="text-xs">
                {idx + 1}
              </Label>
              <Input
                id={`gratitude-item-${idx}`}
                value={value}
                onChange={(e) =>
                  setItems((prev) => {
                    const next: [string, string, string] = [...prev] as [
                      string,
                      string,
                      string,
                    ];
                    next[idx] = e.target.value;
                    return next;
                  })
                }
                className="mt-1"
                placeholder={
                  idx === 0
                    ? "A small win, a person, or a moment"
                    : "Another thing you appreciate"
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="fade-up fade-up-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reflection</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What made today meaningful? What did you learn?"
            className="min-h-[140px]"
          />
        </CardContent>
      </Card>

      {recent.length > 0 && (
        <section className="fade-up fade-up-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Recent entries
          </h2>
          <div className="space-y-2">
            {recent.map((entry: GratitudeEntry) => (
              <Card key={entry.date}>
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.date)}
                  </p>
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    {entry.items.filter(Boolean).map((item, i) => (
                      <li key={`${entry.date}-${i}`}>{item}</li>
                    ))}
                  </ul>
                  {entry.reflection && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {entry.reflection}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
