import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import api from "../api/client";
import { Violation, ViolationSeverity, Worker } from "../types";
import { useAuth } from "./AuthContext";

export type NotificationKind = "violation" | "escalated" | "acknowledged";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  severity: ViolationSeverity;
  title: string;
  message: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 8000;
const TOAST_DURATION_MS = 6000;
const MAX_VISIBLE_TOASTS = 4;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const knownStatusRef = useRef<Map<string, string>>(new Map());
  const initializedRef = useRef(false);
  const seqRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (item: Omit<AppNotification, "id">) => {
      seqRef.current += 1;
      const id = `${Date.now()}-${seqRef.current}`;
      setNotifications((prev) => [{ ...item, id }, ...prev].slice(0, MAX_VISIBLE_TOASTS));
      const timer = window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const poll = useCallback(async () => {
    try {
      const { data } = await api.get("/violations", { params: { limit: 30 } });
      const violations: Violation[] = data.violations || [];

      if (!initializedRef.current) {
        violations.forEach((v) => knownStatusRef.current.set(v._id, v.status));
        initializedRef.current = true;
        return;
      }

      // Oldest-first so toasts appear in the order events actually happened.
      [...violations].reverse().forEach((v) => {
        const worker = v.worker as Worker;
        const workerLabel = worker?.name ? `${worker.name} (${worker.workerId})` : "A worker";
        const prevStatus = knownStatusRef.current.get(v._id);

        if (prevStatus === undefined) {
          push({
            kind: "violation",
            severity: v.severity,
            title: "New PPE violation",
            message: `${workerLabel} · missing ${v.ppeType} · ${v.department}`,
          });
        } else if (prevStatus !== v.status && v.status === "escalated") {
          push({
            kind: "escalated",
            severity: v.severity,
            title: "Violation escalated to alert",
            message: `${workerLabel} · missing ${v.ppeType} · unacknowledged too long`,
          });
        }

        knownStatusRef.current.set(v._id, v.status);
      });
    } catch {
      // Background polling failures should stay silent rather than interrupt the UI.
    }
  }, [push]);

  useEffect(() => {
    // Reset tracking state on login/logout/account switch so we don't
    // carry stale IDs across sessions or toast a backlog on first load.
    initializedRef.current = false;
    knownStatusRef.current.clear();
    setNotifications([]);
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current.clear();

    if (!user) return;

    poll();
    const interval = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <NotificationContext.Provider value={{ notifications, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
