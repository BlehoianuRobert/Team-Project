package com.onlinerental.web.dto;

import java.math.BigDecimal;

public record MonthlyIncomeDto(
        String month,
        BigDecimal income
) {
}

