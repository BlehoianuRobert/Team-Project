package com.onlinerental.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public final class PricingUtil {

    private PricingUtil() {
    }

    public static int rentalDaysInclusive(LocalDate start, LocalDate end) {
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        return (int) Math.max(days, 1);
    }

    /**
     * Shared pricing rule used by API calculations.
     */
    public static BigDecimal totalPrice(BigDecimal dailyPrice, int days, BigDecimal productDiscountPercent) {
        BigDecimal subtotal = dailyPrice.multiply(BigDecimal.valueOf(days));
        BigDecimal pd = productDiscountPercent != null ? productDiscountPercent : BigDecimal.ZERO;
        BigDecimal productDiscountAmount = BigDecimal.ZERO;
        if (pd.compareTo(BigDecimal.ZERO) > 0) {
            productDiscountAmount = subtotal.multiply(pd).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        BigDecimal afterProduct = subtotal.subtract(productDiscountAmount);

        BigDecimal durationRate = BigDecimal.ZERO;
        if (days > 30) {
            durationRate = new BigDecimal("0.20");
        } else if (days > 7) {
            durationRate = new BigDecimal("0.10");
        }
        BigDecimal durationDiscount = afterProduct.multiply(durationRate).setScale(2, RoundingMode.HALF_UP);
        return afterProduct.subtract(durationDiscount).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal depositFor(BigDecimal totalPrice) {
        return totalPrice.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
    }
}
