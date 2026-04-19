import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/slices/authSlice';
import { addNotification } from '@/redux/slices/notificationSlice';
import type { AppDispatch } from '@/redux/store';

const SSE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/sse/subscribe`;
const RECONNECT_DELAY_MIN = 2000;
const RECONNECT_DELAY_MAX = 30000;

function parseSseBlock(block: string): { name: string; data: string } | null {
  let name = '';
  const dataLines: string[] = [];

  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      name = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (!name || dataLines.length === 0) return null;
  return { name, data: dataLines.join('\n') };
}

export function useNotificationSSE() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const abortRef = useRef<AbortController | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopped = useRef(false);
  const reconnectDelay = useRef(RECONNECT_DELAY_MIN);
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  useEffect(() => {
    if (!isAuthenticated) {
      stopped.current = true;
      abortRef.current?.abort();
      abortRef.current = null;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      return;
    }

    stopped.current = false;
    reconnectDelay.current = RECONNECT_DELAY_MIN;

    async function connect() {
      if (stopped.current) return;

      const token = localStorage.getItem('access_token');
      if (!token) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(SSE_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
          signal: controller.signal,
        });

        if (response.status === 401) {
          stopped.current = true;
          return;
        }

        if (!response.ok || !response.body) {
          throw new Error(`SSE connect failed: ${response.status}`);
        }

        reconnectDelay.current = RECONNECT_DELAY_MIN;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          if (stopped.current) {
            reader.cancel();
            break;
          }

          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split('\n\n');
          buffer = blocks.pop() ?? '';

          for (const block of blocks) {
            const trimmed = block.trim();
            if (!trimmed) continue;

            const parsed = parseSseBlock(trimmed);
            if (!parsed) continue;

            if (parsed.name === 'notification' && parsed.data) {
              try {
                const payload = JSON.parse(parsed.data);
                dispatchRef.current(addNotification(payload));
              } catch {
              }
            }
          }
        }

        if (!stopped.current) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MIN);
        }

      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (!stopped.current) {
          reconnectTimer.current = setTimeout(connect, reconnectDelay.current);
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, RECONNECT_DELAY_MAX);
        }
      }
    }

    connect();

    return () => {
      stopped.current = true;
      abortRef.current?.abort();
      abortRef.current = null;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [isAuthenticated]);
}