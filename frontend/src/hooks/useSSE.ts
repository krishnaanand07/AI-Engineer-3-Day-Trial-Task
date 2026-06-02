'use client';

import { useState, useCallback } from 'react';

// ============================================================
// useSSE — Custom React hook for SSE event streaming
// ============================================================

export interface SSEEvent {
  type: string;
  stage?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface UseSSEReturn {
  events: SSEEvent[];
  isConnected: boolean;
  error: string | null;
  connect: (jobId: string) => void;
  disconnect: () => void;
}

export function useSSE(backendUrl: string): UseSSEReturn {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsConnected(false);
  }, [eventSource]);

  const connect = useCallback((jobId: string) => {
    // Close existing connection
    if (eventSource) {
      eventSource.close();
    }

    setEvents([]);
    setError(null);
    setIsConnected(true);

    const url = `${backendUrl}/api/generate/${jobId}/stream`;
    const es = new EventSource(url);

    const eventTypes = [
      'stage_start',
      'stage_complete',
      'stage_failed',
      'repair_attempt',
      'generation_complete',
      'generation_failed',
    ];

    for (const type of eventTypes) {
      es.addEventListener(type, (event: MessageEvent) => {
        try {
          const parsed: SSEEvent = JSON.parse(event.data);
          setEvents((prev) => [...prev, parsed]);

          // Close on terminal events
          if (type === 'generation_complete' || type === 'generation_failed') {
            setTimeout(() => {
              es.close();
              setIsConnected(false);
            }, 500);
          }
        } catch {
          console.error('Failed to parse SSE event:', event.data);
        }
      });
    }

    es.onerror = () => {
      setError('SSE connection error');
      setIsConnected(false);
      es.close();
    };

    setEventSource(es);
  }, [backendUrl, eventSource]);

  return { events, isConnected, error, connect, disconnect };
}
