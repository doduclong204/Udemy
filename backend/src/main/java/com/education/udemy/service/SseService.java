package com.education.udemy.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
public class SseService {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final AtomicLong eventIdCounter = new AtomicLong(0);

    public SseEmitter subscribe(String username) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitter.onCompletion(() -> emitters.remove(username));
        emitter.onTimeout(() -> emitters.remove(username));
        emitter.onError((e) -> emitters.remove(username));

        emitters.put(username, emitter);

        try {
            emitter.send(SseEmitter.event()
                    .id(String.valueOf(eventIdCounter.incrementAndGet()))
                    .name("connected")
                    .data("ok"));
        } catch (IOException e) {
            emitters.remove(username);
        }

        return emitter;
    }

    public void sendToUser(String username, Object data) {
        SseEmitter emitter = emitters.get(username);
        if (emitter == null) return;
        try {
            emitter.send(SseEmitter.event()
                    .id(String.valueOf(eventIdCounter.incrementAndGet()))
                    .name("notification")
                    .data(data));
        } catch (IOException e) {
            emitters.remove(username);
        }
    }

    public void sendToUsers(Iterable<String> usernames, Object data) {
        for (String username : usernames) {
            sendToUser(username, data);
        }
    }

    @Scheduled(fixedDelay = 25000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;
        emitters.forEach((username, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name("heartbeat").data("ping"));
            } catch (IOException e) {
                log.debug("SSE client disconnected, removing emitter for: {}", username);
                emitters.remove(username);
            }
        });
    }
}