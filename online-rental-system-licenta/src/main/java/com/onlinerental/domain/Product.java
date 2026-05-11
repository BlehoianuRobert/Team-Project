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
@Table(name = "products")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "daily_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal dailyPrice;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(length = 100)
    private String brand;

    @Column(length = 100)
    private String model;

    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "ai_tags", columnDefinition = "TEXT")
    private String aiTags;

    @Column(name = "weight_kg", precision = 8, scale = 3)
    private BigDecimal weightKg;

    @Column(name = "thickness_mm", precision = 8, scale = 2)
    private BigDecimal thicknessMm;

    @Column(name = "color_detected", length = 128)
    private String colorDetected;

    @Column(name = "detected_brand", length = 128)
    private String detectedBrand;

    @Column(name = "detected_model", length = 128)
    private String detectedModel;

    @Column(name = "model_confidence", precision = 6, scale = 3)
    private BigDecimal modelConfidence;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt;
}
