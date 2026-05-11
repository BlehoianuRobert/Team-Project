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
import java.time.LocalDate;

@Entity
@Table(name = "rentals")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inventory_id", nullable = false)
    private InventoryUnit inventory;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "actual_return_date")
    private LocalDate actualReturnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private RentalStatus status = RentalStatus.PENDING;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "deposit_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal depositAmount = BigDecimal.ZERO;

    @Column(name = "deposit_returned", nullable = false)
    @Builder.Default
    private boolean depositReturned = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_condition", nullable = false, length = 32)
    @Builder.Default
    private ItemCondition itemCondition = ItemCondition.PENDING_CHECK;

    @Column(name = "condition_notes", columnDefinition = "TEXT")
    private String conditionNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", length = 32)
    private DeliveryType deliveryType;

    @Column(name = "awb_number", length = 128)
    private String awbNumber;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "delivery_phone", length = 64)
    private String deliveryPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", length = 32)
    private DeliveryStatus deliveryStatus;

    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    @Column(name = "actual_delivery_date")
    private LocalDate actualDeliveryDate;

    @Column(name = "pickup_date")
    private LocalDate pickupDate;

    @Column(name = "two_day_delivery")
    private Boolean twoDayDelivery;

    @Column(name = "stripe_payment_intent_id", length = 255)
    private String stripePaymentIntentId;

    @Column(name = "return_requested", nullable = false)
    @Builder.Default
    private boolean returnRequested = false;

    @Column(name = "return_requested_at")
    private Instant returnRequestedAt;

    @Column(name = "return_requested_by")
    private Long returnRequestedBy;

    @Column(name = "flagged_for_review", nullable = false)
    @Builder.Default
    private boolean flaggedForReview = false;

    @Column(name = "ai_comparison_score", precision = 6, scale = 3)
    private BigDecimal aiComparisonScore;

    @Column(name = "ai_predicted_condition", length = 64)
    private String aiPredictedCondition;

    @Column(name = "ai_last_run_at")
    private Instant aiLastRunAt;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
