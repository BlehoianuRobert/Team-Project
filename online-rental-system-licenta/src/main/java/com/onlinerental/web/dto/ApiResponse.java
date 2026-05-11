package com.onlinerental.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse(boolean success, String message, Map<String, String> errors) {

    public static ApiResponse ok(String message) {
        return new ApiResponse(true, message, null);
    }

    public static ApiResponse fail(String message) {
        return new ApiResponse(false, message, null);
    }

    public static ApiResponse fail(String message, Map<String, String> errors) {
        return new ApiResponse(false, message, errors);
    }
}
