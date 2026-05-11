package com.onlinerental.web.dto;

import java.time.Instant;

public record InventoryDto(
        Long id,
        String serialNumber,
        String status,
        Long productId,
        ProductDto product,
        Instant createdAt,
        Instant updatedAt
) {
}
