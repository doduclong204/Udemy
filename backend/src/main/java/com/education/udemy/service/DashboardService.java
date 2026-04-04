package com.education.udemy.service;

import com.education.udemy.dto.response.dashboard.DashboardStatsResponse;
import com.education.udemy.dto.response.dashboard.DashboardStatsResponse.*;
import com.education.udemy.entity.Order;
import com.education.udemy.repository.CourseRepository;
import com.education.udemy.repository.OrderRepository;
import com.education.udemy.repository.ReviewRepository;
import com.education.udemy.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardService {

    OrderRepository  orderRepository;
    UserRepository   userRepository;
    CourseRepository courseRepository;
    ReviewRepository reviewRepository;

    static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");


    public DashboardStatsResponse getStats(
            Instant from, Instant to,
            Instant compareFrom, Instant compareTo,
            String rangeMode) {

        PeriodStats current = buildPeriodStats(from, to);

        PeriodStats compare = (compareFrom != null && compareTo != null)
                ? buildPeriodStats(compareFrom, compareTo)
                : null;

        List<ChartPoint> chartData = buildChartData(from, to, rangeMode);

        List<TopCourse> topCourses = buildTopCourses(from, to, 5);

        List<RecentOrder> recentOrders = buildRecentOrders(from, to);

        long   totalStudents = userRepository.count();
        long   totalCourses  = courseRepository.count();
        double avgRating     = safeAvg(reviewRepository.findAverageRating());

        return DashboardStatsResponse.builder()
                .current(current)
                .compare(compare)
                .totalStudents(totalStudents)
                .totalCourses(totalCourses)
                .avgRating(avgRating)
                .chartData(chartData)
                .topCourses(topCourses)
                .recentOrders(recentOrders)
                .build();
    }


    private PeriodStats buildPeriodStats(Instant from, Instant to) {
        BigDecimal revenue        = orderRepository.sumRevenueByRange(from, to);
        long       orderCount     = orderRepository.countOrdersByRange(from, to);
        long       completedCount = orderRepository.countCompletedByRange(from, to);
        long       pendingCount   = orderRepository.countPendingByRange(from, to);

        return PeriodStats.builder()
                .revenue(revenue != null ? revenue : BigDecimal.ZERO)
                .orderCount(orderCount)
                .completedCount(completedCount)
                .pendingCount(pendingCount)
                .build();
    }

    private List<ChartPoint> buildChartData(Instant from, Instant to, String rangeMode) {
        List<Object[]> rows;

        if ("day".equals(rangeMode)) {
            rows = orderRepository.chartByHour(from, to);
            return mapChartRows(rows, bucket -> {
                int hour = ((Number) bucket).intValue();
                return String.format("%02d:00", hour);
            });
        }

        if ("year".equals(rangeMode) || "custom_long".equals(rangeMode)) {
            rows = orderRepository.chartByMonth(from, to);
            return mapChartRows(rows, bucket -> {
                String[] parts = bucket.toString().split("-");
                return "T" + Integer.parseInt(parts[1]);
            });
        }

        rows = orderRepository.chartByDay(from, to);
        return mapChartRows(rows, bucket -> {
            LocalDate date = LocalDate.parse(bucket.toString());
            if ("week".equals(rangeMode)) {
                String[] dayNames = {"CN", "T2", "T3", "T4", "T5", "T6", "T7"};
                return dayNames[date.getDayOfWeek().getValue() % 7] + " " + date.getDayOfMonth();
            }
            return String.valueOf(date.getDayOfMonth());
        });
    }

    @FunctionalInterface
    interface BucketFormatter {
        String format(Object bucket);
    }

    private List<ChartPoint> mapChartRows(List<Object[]> rows, BucketFormatter fmt) {
        List<ChartPoint> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(ChartPoint.builder()
                    .label(fmt.format(row[0]))
                    .revenue(new BigDecimal(row[1].toString()))
                    .orders(((Number) row[2]).longValue())
                    .build());
        }
        return result;
    }

    private List<TopCourse> buildTopCourses(Instant from, Instant to, int limit) {
        List<Object[]> rows = orderRepository.topCoursesByRevenue(from, to, limit);
        List<TopCourse> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(TopCourse.builder()
                    .id(row[0].toString())
                    .title(row[1].toString())
                    .thumbnail(row[2] != null ? row[2].toString() : null)
                    .students(((Number) row[3]).longValue())
                    .revenue(new BigDecimal(row[4].toString()))
                    .build());
        }
        return result;
    }

    private List<RecentOrder> buildRecentOrders(Instant from, Instant to) {
        List<Order> orders = orderRepository.findRecentOrders(from, to, PageRequest.of(0, 5));
        List<RecentOrder> result = new ArrayList<>();
        for (Order o : orders) {
            result.add(RecentOrder.builder()
                    .id(o.getId())
                    .orderCode(o.getOrderCode())
                    .createdBy(o.getCreatedBy())
                    .finalAmount(o.getFinalAmount())
                    .paymentStatus(o.getPaymentStatus().name())
                    .createdAt(o.getCreatedAt())
                    .build());
        }
        return result;
    }

    private double safeAvg(Double val) {
        return val != null ? Math.round(val * 10.0) / 10.0 : 0.0;
    }
}