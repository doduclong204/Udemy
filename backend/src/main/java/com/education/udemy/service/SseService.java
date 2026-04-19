package com.education.udemy.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.SmartLifecycle;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
public class SseService implements SmartLifecycle {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final AtomicLong eventIdCounter = new AtomicLong(0);
    private volatile boolean running = false;

    public SseEmitter subscribe(String username) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitter.onCompletion(() -> emitters.remove(username));
        emitter.onTimeout(() -> emitters.remove(username));
        emitter.onError((e) -> emitters.remove(username));

        SseEmitter old = emitters.put(username, emitter);
        if (old != null) {
            try { old.complete(); } catch (Exception ignored) {}
        }

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
                    .data(data, MediaType.APPLICATION_JSON));
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
        emitters.entrySet().removeIf(entry -> {
            try {
                entry.getValue().send(SseEmitter.event().name("heartbeat").data("ping"));
                return false;
            } catch (IOException e) {
                log.debug("SSE client disconnected, removing emitter for: {}", entry.getKey());
                return true;
            }
        });
    }

    @Override
    public void start() {
        log.info("SseService started");
        running = true;
    }

    @Override
    public void stop() {
        int count = emitters.size();
        log.info("SseService stopping, closing {} emitter(s)", count);

        emitters.forEach((username, emitter) -> {
            try { emitter.complete(); } catch (Exception ignored) {}
        });
        emitters.clear();

        if (count > 0) {
            try { Thread.sleep(300); } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        running = false;
        log.info("SseService stopped");
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    @Override
    public int getPhase() {
        return Integer.MAX_VALUE;
    }
}