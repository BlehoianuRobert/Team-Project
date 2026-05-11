package com.onlinerental.web;

import com.onlinerental.domain.InventoryUnit;
import com.onlinerental.domain.Product;
import com.onlinerental.domain.Rental;
import com.onlinerental.web.dto.InventoryDto;
import com.onlinerental.web.dto.ProductDto;
import com.onlinerental.web.dto.RentalDto;

public final class DtoMapper {

    private DtoMapper() {
    }

    public static ProductDto toProductDto(Product p) {
        if (p == null) {
            return null;
        }
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getDailyPrice(),
                p.getCategory(),
                p.getBrand(),
                p.getModel(),
                p.getImageUrl(),
                p.getDiscountPercent(),
                p.getAiTags(),
                p.getWeightKg(),
                p.getThicknessMm(),
                p.getColorDetected(),
                p.getDetectedBrand(),
                p.getDetectedModel(),
                p.getModelConfidence(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    public static InventoryDto toInventoryDto(InventoryUnit i, boolean includeProduct) {
        if (i == null) {
            return null;
        }
        ProductDto pd = includeProduct && i.getProduct() != null ? toProductDto(i.getProduct()) : null;
        Long pid = i.getProduct() != null ? i.getProduct().getId() : null;
        return new InventoryDto(
                i.getId(),
                i.getSerialNumber(),
                i.getStatus().name(),
                pid,
                pd,
                i.getCreatedAt(),
                i.getUpdatedAt()
        );
    }

    public static RentalDto toRentalDto(Rental r) {
        var u = r.getUser();
        var inv = r.getInventory();
        Product p = inv != null ? inv.getProduct() : null;
        String productName = p != null ? p.getName() : null;
        InventoryDto invDto = inv != null ? toInventoryDto(inv, true) : null;
        return new RentalDto(
                r.getId(),
                u.getId(),
                u.getUsername(),
                u.getFirstName() + " " + u.getLastName(),
                u.getEmail(),
                inv != null ? inv.getId() : null,
                invDto,
                productName,
                r.getStartDate(),
                r.getEndDate(),
                r.getActualReturnDate(),
                r.getStatus().name(),
                r.getTotalPrice(),
                r.getDepositAmount(),
                r.isDepositReturned(),
                r.getItemCondition().name(),
                r.getConditionNotes(),
                r.getCreatedAt(),
                r.getDeliveryType() != null ? r.getDeliveryType().name() : null,
                r.getAwbNumber(),
                r.getDeliveryAddress(),
                r.getDeliveryPhone(),
                r.getDeliveryStatus() != null ? r.getDeliveryStatus().name() : null,
                r.getEstimatedDeliveryDate(),
                r.getActualDeliveryDate(),
                r.getPickupDate(),
                r.isReturnRequested(),
                r.isFlaggedForReview(),
                r.getAiComparisonScore(),
                r.getAiPredictedCondition(),
                r.getAiLastRunAt()
        );
    }
}
