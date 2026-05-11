package com.onlinerental.web.dto;

import java.util.List;

public record UserResponse(
        Long id,
        String username,
        String email,
        String firstName,
        String lastName,
        boolean verified,
        List<String> roles
) {
}
