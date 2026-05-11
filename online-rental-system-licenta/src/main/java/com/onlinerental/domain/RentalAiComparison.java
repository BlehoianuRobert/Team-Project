package com.onlinerental.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "rental_ai_comparisons")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentalAiComparison {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rental_id", nullable = false)
    private Rental rental;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "triggered_by", nullable = false)
    private User triggeredBy;

    @Column(name = "score", precision = 6, scale = 3)
    private BigDecimal score;

    @Column(name = "predicted_condition", length = 64)
    private String predictedCondition;

    @Column(name = "needs_review", nullable = false)
    @Builder.Default
    private boolean needsReview = false;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "raw_response", columnDefinition = "TEXT")
    private String rawResponse;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
