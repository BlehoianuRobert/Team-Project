package com.onlinerental.web.dto;

import java.math.BigDecimal;

public record ProductFinancialStatsDto(
        long productId,
        String productName,
        String category,
        String brand,
        String model,
        long rentalCount,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal netProfit
) {
}
