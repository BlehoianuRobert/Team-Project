package com.onlinerental.web.dto;

public record ProfileResponse(
        String username,
        String email,
        String firstName,
        String lastName,
        String addressLine1,
        String addressLine2,
        String city,
        String postalCode,
        String country,
        String phone,
        String billingFullName
) {}
