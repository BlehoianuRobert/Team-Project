package com.onlinerental.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProfilePatchRequest(
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
