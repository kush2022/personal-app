import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "data", "subscriptions.json");

type SubscriptionPayload = {
  subscription: unknown;
};

async function readSubscriptions(): Promise<unknown[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeSubscriptions(subs: unknown[]) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(subs, null, 2));
}

export async function POST(req: Request) {
  const body = (await req.json()) as SubscriptionPayload;
  if (!body?.subscription) {
    return NextResponse.json({ error: "Missing subscription" }, { status: 400 });
  }

  const subs = await readSubscriptions();
  const serialized = JSON.stringify(body.subscription);
  const exists = subs.some((s) => JSON.stringify(s) === serialized);
  if (!exists) {
    subs.unshift(body.subscription);
    await writeSubscriptions(subs);
  }

  return NextResponse.json({ ok: true });
}
