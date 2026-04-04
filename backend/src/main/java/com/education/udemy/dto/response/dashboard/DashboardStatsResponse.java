package com.education.udemy.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardStatsResponse {

    PeriodStats current;
    PeriodStats compare;

    long totalStudents;
    long totalCourses;
    double avgRating;

    List<ChartPoint>   chartData;
    List<TopCourse>    topCourses;
    List<RecentOrder>  recentOrders;


    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PeriodStats {
        BigDecimal revenue;
        long       orderCount;
        long       completedCount;
        long       pendingCount;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChartPoint {
        String     label;
        BigDecimal revenue;
        long       orders;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TopCourse {
        String     id;
        String     title;
        String     thumbnail;
        long       students;
        BigDecimal revenue;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecentOrder {
        String     id;
        String     orderCode;
        String     createdBy;
        BigDecimal finalAmount;
        String     paymentStatus;
        Instant    createdAt;
    }
}