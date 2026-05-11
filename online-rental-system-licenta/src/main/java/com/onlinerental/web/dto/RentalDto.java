package com.onlinerental.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record RentalDto(
        Long id,
        Long userId,
        String renterUsername,
        String renterName,
        String renterEmail,
        Long inventoryId,
        InventoryDto inventoryUnit,
        String productName,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate actualReturnDate,
        String status,
        BigDecimal totalPrice,
        BigDecimal depositAmount,
        boolean depositReturned,
        String itemCondition,
        String conditionNotes,
        Instant createdAt,
        String deliveryType,
        String awbNumber,
        String deliveryAddress,
        String deliveryPhone,
        String deliveryStatus,
        LocalDate estimatedDeliveryDate,
        LocalDate actualDeliveryDate,
        LocalDate pickupDate,
        boolean returnRequested,
        boolean flaggedForReview,
        BigDecimal aiComparisonScore,
        String aiPredictedCondition,
        Instant aiLastRunAt
) {
}
