package com.onlinerental.web.dto;

import jakarta.validation.constraints.NotBlank;

public record ConditionCheckRequest(
        @NotBlank String condition,
        String notes
) {
}
