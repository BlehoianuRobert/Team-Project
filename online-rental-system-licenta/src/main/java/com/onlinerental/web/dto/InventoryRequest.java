package com.onlinerental.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InventoryRequest(
        @NotNull Long productId,
        @NotBlank String serialNumber
) {
}
