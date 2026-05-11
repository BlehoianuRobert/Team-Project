package com.onlinerental.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.onlinerental.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AiComparisonService {

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;

    public AiCompareResult compare(Long rentalId, List<String> baselineImageUrls, List<String> returnImageUrls) {
        return compare(rentalId, baselineImageUrls, returnImageUrls, null);
    }

    public AiCompareResult compare(
            Long rentalId,
            List<String> baselineImageUrls,
            List<String> returnImageUrls,
            String rentedProductContext
    ) {
        AppProperties.Ai ai = appProperties.getAi();
        if (ai.getCompareUrl() == null || ai.getCompareUrl().isBlank()) {
            return new AiCompareResult(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    false,
                    "SKIPPED",
                    "Serviciul AI nu este configurat.",
                    null
            );
        }

        List<String> normalizedBaselineUrls = normalizeImageUrlsStatic(baselineImageUrls, ai.getImageBaseUrl());
        List<String> normalizedReturnUrls = normalizeImageUrlsStatic(returnImageUrls, ai.getImageBaseUrl());

        Map<String, Object> payload = new HashMap<>();
        payload.put("rentalId", rentalId);
        payload.put("baselineImageUrls", normalizedBaselineUrls);
        payload.put("returnImageUrls", normalizedReturnUrls);
        if (rentedProductContext != null && !rentedProductContext.isBlank()) {
            payload.put("rentedProductContext", rentedProductContext.trim());
        }

        try {
            RestTemplate rt = new RestTemplateBuilder()
                    .setConnectTimeout(Duration.ofMillis(ai.getConnectTimeoutMs()))
                    .setReadTimeout(Duration.ofMillis(ai.getReadTimeoutMs()))
                    .build();
            ResponseEntity<Map<String, Object>> resp = callAi(rt, ai.getCompareUrl(), normalizedBaselineUrls, normalizedReturnUrls, payload);
            Map<?, ?> body = Objects.requireNonNullElse(resp.getBody(), Map.of());
            String raw = safeJson(body);

            BigDecimal score = toBigDecimal(firstNonNull(body, "score", "damageScore", "similarityScore", "esthetic_score", "shape_score", "overall_score"));
            BigDecimal newDamageScore = toBigDecimal(firstNonNull(body, "newDamageScore", "new_damage_score", "damage_delta"));
            BigDecimal modelMatchScore = toBigDecimal(firstNonNull(body, "modelMatchScore", "model_match_score", "matchScore", "similarity"));
            String predicted = toStringValue(firstNonNull(body, "predictedCondition", "condition", "verdict", "classification", "status", "decision"));
            String ocrText = toStringValue(firstNonNull(body, "ocrText", "ocr_text", "detected_text", "text"));
            Boolean powerOnDetected = toNullableBoolean(firstNonNull(body, "powerOnDetected", "power_on_detected", "screen_on"));
            Boolean errorCodesDetected = toNullableBoolean(firstNonNull(body, "errorCodesDetected", "error_codes_detected", "has_error_codes"));
            String errorCodes = toStringValue(firstNonNull(body, "errorCodes", "error_codes"));
            String detectedBrand = toStringValue(firstNonNull(body, "detectedBrand", "brand"));
            String detectedModel = toStringValue(firstNonNull(body, "detectedModel", "model", "deviceModel"));
            String serialNumber = toStringValue(firstNonNull(body, "serialNumberDetected", "serial_number", "serial"));
            boolean needsReview = toBoolean(firstNonNull(body, "needsReview", "flagged"))
                    || (score != null && score.compareTo(BigDecimal.valueOf(ai.getReviewThreshold())) >= 0)
                    || (newDamageScore != null && newDamageScore.compareTo(BigDecimal.valueOf(ai.getReviewThreshold())) >= 0)
                    || (modelMatchScore != null && modelMatchScore.compareTo(BigDecimal.valueOf(0.55)) < 0);
            String message = toStringValue(firstNonNull(body, "message", "detail", "statusMessage"));
            if (message == null || message.isBlank()) {
                message = "Comparare AI finalizată.";
            }
            return new AiCompareResult(
                    score,
                    newDamageScore,
                    modelMatchScore,
                    predicted,
                    ocrText,
                    powerOnDetected,
                    errorCodesDetected,
                    errorCodes,
                    detectedBrand,
                    detectedModel,
                    serialNumber,
                    needsReview,
                    "SUCCESS",
                    message,
                    raw
            );
        } catch (RestClientException ex) {
            return new AiCompareResult(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    false,
                    "FAILED",
                    "Serviciul AI nu a răspuns: " + ex.getMessage(),
                    null
            );
        }
    }

    @SuppressWarnings("unchecked")
    private ResponseEntity<Map<String, Object>> callAi(
            RestTemplate rt,
            String compareUrl,
            List<String> baselineUrls,
            List<String> returnUrls,
            Map<String, Object> jsonPayload
    ) {
        String url = Objects.requireNonNull(compareUrl);
        if (!url.contains("/analyze/")) {
            return rt.postForEntity(
                    url,
                    new HttpEntity<>(jsonPayload, jsonHeaders()),
                    (Class<Map<String, Object>>) (Class<?>) Map.class
            );
        }

        List<String> sourceUrls = !returnUrls.isEmpty() ? returnUrls : baselineUrls;
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        int idx = 0;
        for (String imageUrl : sourceUrls) {
            if (imageUrl == null || imageUrl.isBlank()) {
                continue;
            }
            try {
                byte[] bytes = rt.getForObject(imageUrl, byte[].class);
                if (bytes == null || bytes.length == 0) {
                    continue;
                }
                final String fileName = "photo-" + (++idx) + ".jpg";
                body.add("photos", new ByteArrayResource(bytes) {
                    @Override
                    public String getFilename() {
                        return fileName;
                    }
                });
            } catch (Exception ignored) {
                // Ignore a single failed image fetch and continue with the remaining images.
            }
        }
        if (idx == 0) {
            throw new RestClientException("Nu s-au putut încărca imaginile pentru analiza AI.");
        }
        body.add("product_description", "");
        ResponseEntity<Map<String, Object>> resp = rt.postForEntity(
                url,
                new HttpEntity<>(body, multipartHeaders()),
                (Class<Map<String, Object>>) (Class<?>) Map.class
        );
        HttpStatusCode status = resp.getStatusCode();
        if (status.value() >= 400) {
            throw new RestClientException("AI răspuns HTTP " + status.value());
        }
        return resp;
    }

    private static HttpHeaders jsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private static HttpHeaders multipartHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        return headers;
    }

    private static Object firstNonNull(Map<?, ?> body, String... keys) {
        for (String k : keys) {
            Object v = body.get(k);
            if (v != null) {
                return v;
            }
        }
        return null;
    }

    private String safeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return String.valueOf(value);
        }
    }

    private static String toStringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number n) {
            return BigDecimal.valueOf(n.doubleValue());
        }
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static boolean toBoolean(Object value) {
        if (value instanceof Boolean b) {
            return b;
        }
        if (value == null) {
            return false;
        }
        return "true".equalsIgnoreCase(String.valueOf(value));
    }

    private static Boolean toNullableBoolean(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Boolean b) {
            return b;
        }
        return "true".equalsIgnoreCase(String.valueOf(value));
    }

    static List<String> normalizeImageUrlsStatic(List<String> imageUrls, String imageBaseUrl) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return List.of();
        }
        if (imageBaseUrl == null || imageBaseUrl.isBlank()) {
            return imageUrls;
        }
        String base = imageBaseUrl.endsWith("/") ? imageBaseUrl.substring(0, imageBaseUrl.length() - 1) : imageBaseUrl;
        return imageUrls.stream()
                .map(url -> {
                    if (url == null || url.isBlank()) {
                        return url;
                    }
                    if (url.startsWith("http://") || url.startsWith("https://")) {
                        return url;
                    }
                    return url.startsWith("/") ? base + url : base + "/" + url;
                })
                .toList();
    }

    public record AiCompareResult(
            BigDecimal score,
            BigDecimal newDamageScore,
            BigDecimal modelMatchScore,
            String predictedCondition,
            String ocrText,
            Boolean powerOnDetected,
            Boolean errorCodesDetected,
            String errorCodes,
            String detectedBrand,
            String detectedModel,
            String serialNumberDetected,
            boolean needsReview,
            String status,
            String message,
            String rawResponse
    ) {
    }
}
