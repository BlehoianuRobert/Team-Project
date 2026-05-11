package com.onlinerental.web.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record RentalAiComparisonDto(
        Long id,
        BigDecimal score,
        String predictedCondition,
        boolean needsReview,
        String status,
        String message,
        Instant createdAt,
        String triggeredBy
) {
}
