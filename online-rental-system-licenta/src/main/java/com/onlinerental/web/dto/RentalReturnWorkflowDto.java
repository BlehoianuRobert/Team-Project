package com.onlinerental.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record RentalReturnWorkflowDto(
        int minRequiredReturnPhotos,
        long baselinePhotoCount,
        long returnPhotoCount,
        boolean returnRequested,
        boolean flaggedForReview,
        BigDecimal aiComparisonScore,
        String aiPredictedCondition,
        Instant aiLastRunAt,
        List<RentalImageDto> baselinePhotos,
        List<RentalImageDto> returnPhotos,
        RentalAiComparisonDto latestComparison,
        RentalPhotoVerificationDto latestBaselineVerification,
        RentalPhotoVerificationDto latestReturnVerification
) {
}
