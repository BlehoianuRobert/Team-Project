package com.onlinerental.web;

import com.onlinerental.service.PaymentService;
import com.onlinerental.web.dto.ApiResponse;
import com.onlinerental.web.dto.PaymentIntentRequest;
import com.onlinerental.web.dto.PaymentIntentResponse;
import com.stripe.exception.StripeException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    @PreAuthorize("isAuthenticated()")
    public PaymentIntentResponse createIntent(
            @Valid @RequestBody PaymentIntentRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) throws StripeException {
        return paymentService.createIntent(req, principal.getUsername());
    }

    @PostMapping("/confirm/{paymentIntentId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse confirm(
            @PathVariable String paymentIntentId,
            @AuthenticationPrincipal UserDetails principal
    ) throws StripeException {
        return paymentService.confirm(paymentIntentId, principal.getUsername());
    }
}
