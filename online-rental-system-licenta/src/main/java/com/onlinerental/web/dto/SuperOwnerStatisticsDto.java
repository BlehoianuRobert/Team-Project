package com.onlinerental.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record SuperOwnerStatisticsDto(
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal totalNetProfit,
        long totalRentals,
        List<ProductFinancialStatsDto> products
) {
}
