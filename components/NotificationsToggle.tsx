"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationsToggle() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
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
    } else {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        new Notification("Notifications Enabled!", {
          body: "You will now receive reminders for pending tasks and habits.",
        });
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
