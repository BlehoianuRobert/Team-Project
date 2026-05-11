package com.onlinerental.web.dto;

import java.time.Instant;

public record ProductReviewDto(
        Long id,
        Long productId,
        Long userId,
        String username,
        int rating,
        String comment,
        Instant createdAt,
        Instant updatedAt
) {
}
