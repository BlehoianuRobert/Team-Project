package com.onlinerental.web.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record RentalPhotoVerificationDto(
        Long id,
        String stage,
        BigDecimal damageScore,
        BigDecimal newDamageScore,
        BigDecimal modelMatchScore,
        String ocrText,
        Boolean powerOnDetected,
        Boolean errorCodesDetected,
        String errorCodes,
        String detectedBrand,
        String detectedModel,
        String serialNumberDetected,
        String verdict,
        boolean needsReview,
        String message,
        Instant createdAt
) {
}

