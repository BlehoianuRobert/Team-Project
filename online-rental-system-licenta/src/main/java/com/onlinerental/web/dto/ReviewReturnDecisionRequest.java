package com.onlinerental.web.dto;

import jakarta.validation.constraints.NotBlank;

public record ReviewReturnDecisionRequest(
        @NotBlank String condition,
        String notes,
        boolean markCompleted
) {
}
