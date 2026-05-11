package com.onlinerental.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "rental_photo_verifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentalPhotoVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rental_id", nullable = false)
    private Rental rental;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private HandoverStage stage;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "triggered_by", nullable = false)
    private User triggeredBy;

    @Column(name = "damage_score", precision = 6, scale = 3)
    private BigDecimal damageScore;

    @Column(name = "new_damage_score", precision = 6, scale = 3)
    private BigDecimal newDamageScore;

    @Column(name = "model_match_score", precision = 6, scale = 3)
    private BigDecimal modelMatchScore;

    @Column(name = "ocr_text", columnDefinition = "TEXT")
    private String ocrText;

    @Column(name = "power_on_detected")
    private Boolean powerOnDetected;

    @Column(name = "error_codes_detected")
    private Boolean errorCodesDetected;

    @Column(name = "error_codes", columnDefinition = "TEXT")
    private String errorCodes;

    @Column(name = "detected_brand", length = 128)
    private String detectedBrand;

    @Column(name = "detected_model", length = 128)
    private String detectedModel;

    @Column(name = "serial_number_detected", length = 255)
    private String serialNumberDetected;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private VerificationVerdict verdict = VerificationVerdict.REVIEW_REQUIRED;

    @Column(name = "needs_review", nullable = false)
    @Builder.Default
    private boolean needsReview = false;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "raw_response", columnDefinition = "TEXT")
    private String rawResponse;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}

