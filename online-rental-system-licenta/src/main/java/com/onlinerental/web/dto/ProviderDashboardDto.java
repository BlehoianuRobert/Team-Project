package com.onlinerental.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProviderDashboardDto(
        BigDecimal totalIncome,
        long totalRentals,
        List<DeviceIncomeMetricDto> devices,
        List<MonthlyIncomeDto> monthly
) {
}

