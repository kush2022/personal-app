"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VAPID_PUBLIC_KEY } from "@/lib/push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function ensurePushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription }),
  });
}

export function NotificationsToggle() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      if (Notification.permission === "granted") {
        ensurePushSubscription().catch(console.error);
      }
    }
  }, []);

  const toggle = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    if (permission === "granted") {
      alert(
        "Notifications are already enabled. You can manage them in your browser settings.",
      );
      await ensurePushSubscription();
    } else {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        new Notification("Notifications Enabled!", {
          body: "You will now receive reminders for pending tasks and habits.",
        });
        ensurePushSubscription().catch(console.error);
      }
    }
  };

  if (permission === "denied") return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      title={
        permission === "granted"
          ? "Notifications enabled"
          : "Enable notifications"
      }
      className="rounded-full w-9 h-9 opacity-80 hover:opacity-100 transition-opacity ml-auto"
    >
      {permission === "granted" ? (
        <Bell className="w-5 h-5 text-indigo-400" />
      ) : (
        <BellOff className="w-4 h-4 text-slate-400" />
      )}
    </Button>
  );
}
