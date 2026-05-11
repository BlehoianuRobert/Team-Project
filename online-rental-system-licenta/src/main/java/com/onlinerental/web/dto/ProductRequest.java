package com.onlinerental.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank String name,
        @NotBlank String description,
        @NotNull @DecimalMin("0.01") BigDecimal dailyPrice,
        @NotBlank String category,
        String brand,
        String model,
        String imageUrl,
        BigDecimal discountPercent
) {
}
