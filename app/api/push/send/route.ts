import { NextResponse } from "next/server";
import webpush from "web-push";
import { promises as fs } from "fs";
import path from "path";
import {
  VAPID_PRIVATE_KEY,
  VAPID_PUBLIC_KEY,
  VAPID_SUBJECT,
} from "@/lib/push";

const FILE_PATH = path.join(process.cwd(), "data", "subscriptions.json");

type SendPayload = {
  title?: string;
  body?: string;
};

async function readSubscriptions(): Promise<any[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeSubscriptions(subs: any[]) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(subs, null, 2));
}

export async function POST(req: Request) {
  const { title, body } = (await req.json()) as SendPayload;

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const subs = await readSubscriptions();
  const payload = JSON.stringify({
    title: title || "LifeOS",
    body: body || "Test notification",
  });

  const validSubs: any[] = [];
  const results = await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload);
        validSubs.push(sub);
        return { ok: true };
      } catch (err: any) {
        if (err?.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
          return { ok: false, removed: true };
        }
        validSubs.push(sub);
        return { ok: false, removed: false };
      }
    }),
  );

  await writeSubscriptions(validSubs);

  return NextResponse.json({ ok: true, results });
}
