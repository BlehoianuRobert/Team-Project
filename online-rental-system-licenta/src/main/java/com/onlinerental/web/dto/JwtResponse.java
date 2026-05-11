package com.onlinerental.web.dto;

public record JwtResponse(
        String token,
        String type,
        Long id,
        String username,
        String email,
        String role
) {
}
