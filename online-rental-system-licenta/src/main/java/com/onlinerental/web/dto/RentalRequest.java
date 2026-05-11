package com.onlinerental.web.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record RentalRequest(
        @NotNull Long inventoryId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        String deliveryType,
        String deliveryAddress,
        String deliveryPhone,
        Boolean twoDayDelivery
) {
}
