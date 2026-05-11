package com.onlinerental.service;

import com.onlinerental.config.AppProperties;
import com.onlinerental.domain.Rental;
import com.onlinerental.domain.RentalStatus;
import com.onlinerental.web.dto.ApiResponse;
import com.onlinerental.web.dto.PaymentIntentRequest;
import com.onlinerental.web.dto.PaymentIntentResponse;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final AppProperties appProperties;
    private final RentalService rentalService;
    private final InvoiceService invoiceService;
    private final EmailService emailService;

    @PostConstruct
    void stripeKey() {
        String key = appProperties.getStripe().getSecretKey();
        if (key != null && !key.isBlank()) {
            Stripe.apiKey = key;
        }
    }

    @Transactional
    public PaymentIntentResponse createIntent(PaymentIntentRequest req, String username) throws StripeException {
        if (appProperties.getStripe().getSecretKey() == null || appProperties.getStripe().getSecretKey().isBlank()) {
            throw new IllegalStateException("Stripe nu este configurat (STRIPE_SECRET_KEY).");
        }
        Rental rental = rentalService.requireRentalForPayment(req.rentalId(), username);
        if (rental.getStatus() != RentalStatus.PENDING) {
            throw new IllegalArgumentException("Această rezervare nu așteaptă plată.");
        }
        long amountMinor = req.amount().multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountMinor)
                .setCurrency("ron")
                .putMetadata("rentalId", String.valueOf(rental.getId()))
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                )
                .build();
        PaymentIntent pi = PaymentIntent.create(params);
        rentalService.attachPaymentIntent(rental.getId(), pi.getId());
        return new PaymentIntentResponse(pi.getClientSecret(), pi.getId());
    }

    @Transactional
    public ApiResponse confirm(String paymentIntentId, String username) throws StripeException {
        if (appProperties.getStripe().getSecretKey() == null || appProperties.getStripe().getSecretKey().isBlank()) {
            throw new IllegalStateException("Stripe nu este configurat.");
        }
        PaymentIntent pi = PaymentIntent.retrieve(paymentIntentId);
        if (!"succeeded".equalsIgnoreCase(pi.getStatus())) {
            return ApiResponse.fail("Plata nu este finalizată.");
        }
        Rental rental = rentalService.requireRentalByPaymentIntentForUser(paymentIntentId, username);
        rentalService.confirmPaid(paymentIntentId);
        byte[] pdf = invoiceService.generateInvoicePdf(rental, paymentIntentId);
        boolean invoiceSent = emailService.sendPaymentInvoiceEmail(rental.getUser(), rental, paymentIntentId, pdf);
        if (invoiceSent) {
            return ApiResponse.ok("Plată confirmată. Factura a fost trimisă pe email.");
        }
        return ApiResponse.ok("Plată confirmată. Factura nu a putut fi trimisă automat, te rog contactează suport.");
    }
}
