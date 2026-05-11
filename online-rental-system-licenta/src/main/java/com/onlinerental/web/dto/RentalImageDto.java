package com.onlinerental.web.dto;

import java.time.Instant;

public record RentalImageDto(
        Long id,
        String imageUrl,
        Instant createdAt,
        String uploadedBy
) {
}
