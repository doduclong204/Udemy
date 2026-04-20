package com.education.udemy.dto.response.stats;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderStatsResponse {
    BigDecimal totalRevenue;
    long completedCount;
    long pendingCount;
    long refundedCount;
}