package com.onlinerental.web.dto;

import java.math.BigDecimal;

public record DeviceIncomeMetricDto(
        Long productId,
        String productName,
        BigDecimal totalRevenue,
        long rentalCount
) {
}

