import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { QAResponse } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface QAWebSocketPayload {
  type: 'NEW_QUESTION' | 'NEW_ANSWER';
  lectureId: string;
  courseId: string;
  data: QAResponse;
  questionId?: string;
}

interface UseQAWebSocketOptions {
  lectureId: string | undefined;
  onNewQuestion: (question: QAResponse) => void;
  onNewAnswer: (questionId: string, answer: QAResponse) => void;
}

export function useQAWebSocket({
  lectureId,
  onNewQuestion,
  onNewAnswer,
}: UseQAWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!lectureId) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/qa/${lectureId}`, (message) => {
          try {
            const payload: QAWebSocketPayload = JSON.parse(message.body);
            if (payload.type === 'NEW_QUESTION') {
              onNewQuestion(payload.data);
            } else if (payload.type === 'NEW_ANSWER' && payload.questionId) {
              onNewAnswer(payload.questionId, payload.data);
            }
          } catch {
          }
        });
      },
      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureId]);
}