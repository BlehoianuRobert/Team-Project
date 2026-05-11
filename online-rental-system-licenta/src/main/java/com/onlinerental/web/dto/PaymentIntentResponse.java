package com.onlinerental.web.dto;

public record PaymentIntentResponse(String clientSecret, String paymentIntentId) {
}
