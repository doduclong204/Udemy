package com.education.udemy.controller;

import com.education.udemy.dto.response.dashboard.DashboardStatsResponse;
import com.education.udemy.service.DashboardService;
import com.education.udemy.util.annotation.ApiMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardController {

    DashboardService dashboardService;
    @GetMapping("/stats")
    @ApiMessage("Get dashboard stats success")
    public ResponseEntity<DashboardStatsResponse> getStats(
            @RequestParam Instant from,
            @RequestParam Instant to,
            @RequestParam(required = false) Instant compareFrom,
            @RequestParam(required = false) Instant compareTo,
            @RequestParam(defaultValue = "month") String rangeMode) {

        DashboardStatsResponse stats = dashboardService.getStats(
                from, to, compareFrom, compareTo, rangeMode);

        return ResponseEntity.ok(stats);
    }
}