import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/slices/authSlice';
import { addNotification } from '@/redux/slices/notificationSlice';
import type { AppDispatch } from '@/redux/store';

const SSE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/sse/subscribe`;
const RECONNECT_DELAY = 5000;

export function useNotificationSSE() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopped = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      stopped.current = true;
      esRef.current?.close();
      esRef.current = null;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      return;
    }

    stopped.current = false;

    function connect() {
      if (stopped.current) return;

      const token = localStorage.getItem('access_token');
      if (!token) return;

      const es = new EventSource(`${SSE_URL}?token=${encodeURIComponent(token)}`);
      esRef.current = es;

      es.addEventListener('notification', (e) => {
        try {
          dispatch(addNotification(JSON.parse(e.data)));
        } catch {
          // ignore
        }
      });

      es.onerror = () => {
        es.close();
        esRef.current = null;
        if (!stopped.current) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };
    }

    connect();

    return () => {
      stopped.current = true;
      esRef.current?.close();
      esRef.current = null;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [isAuthenticated, dispatch]);
}