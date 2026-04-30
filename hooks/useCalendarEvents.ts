import { useState, useEffect, useCallback } from "react";
import { StorageEngine } from "@/lib/storage-engine";
import { CalendarEvent } from "@/lib/types";

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Load from StorageEngine
  const loadFromEngine = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await StorageEngine.loadCalendars();
      setEvents(stored || []);
    } catch (error) {
      console.error("Failed to load calendar events:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromEngine();

    // Listen for cloud/backup restores
    window.addEventListener("opfs-data-restored", loadFromEngine);
    return () => window.removeEventListener("opfs-data-restored", loadFromEngine);
  }, [loadFromEngine]);

  // 2. Helper to sync React state to OPFS
  const syncEvents = useCallback((updated: CalendarEvent[]) => {
    setEvents(updated);
    StorageEngine.saveCalendarDebounced(updated);
  }, []);

  const createEvent = useCallback((event: Omit<CalendarEvent, "id" | "createdAt">): CalendarEvent => {
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => {
      const updated = [...prev, newEvent];
      StorageEngine.saveCalendarDebounced(updated);
      return updated;
    });
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) => {
      const updated = prev.map((event) => event.id === id ? { ...event, ...updates } : event);
      StorageEngine.saveCalendarDebounced(updated);
      return updated;
    });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const updated = prev.filter((event) => event.id !== id);
      StorageEngine.saveCalendarDebounced(updated);
      return updated;
    });
  }, []);

  const getEventsForDate = useCallback(
    (date: Date) => {
      const dateStr = date.toISOString().split("T")[0];
      return events.filter((event) => event.date.split("T")[0] === dateStr);
    },
    [events]
  );

  const getEventsForMonth = useCallback(
    (year: number, month: number) => {
      return events.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
      });
    },
    [events]
  );

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventsForMonth,
  };
};