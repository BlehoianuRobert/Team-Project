package com.onlinerental.web;

import com.onlinerental.domain.User;
import com.onlinerental.service.ProductService;
import com.onlinerental.web.dto.InventoryDto;
import com.onlinerental.web.dto.InventoryRequest;
import com.onlinerental.web.dto.ProductDto;
import com.onlinerental.web.dto.ProductAiTaggingRequest;
import com.onlinerental.web.dto.ProductRequest;
import com.onlinerental.web.dto.ProductReviewDto;
import com.onlinerental.web.dto.ProductReviewSummaryDto;
import com.onlinerental.web.dto.ProviderDashboardDto;
import com.onlinerental.web.dto.ReviewUpsertRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<ProductDto> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) BigDecimal weightMin,
            @RequestParam(required = false) BigDecimal weightMax,
            @RequestParam(required = false) BigDecimal thicknessMin,
            @RequestParam(required = false) BigDecimal thicknessMax,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String search
    ) {
        return productService.listFiltered(
                category,
                brand,
                model,
                weightMin,
                weightMax,
                thicknessMin,
                thicknessMax,
                color,
                search
        );
    }

    @GetMapping("/filters/categories")
    public List<String> categories() {
        return productService.categories();
    }

    @GetMapping("/filters/brands")
    public List<String> brands(@RequestParam(required = false) String category) {
        return productService.brands(category);
    }

    @GetMapping("/filters/models")
    public List<String> models(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand
    ) {
        return productService.models(category, brand);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN','SUPEROWNER')")
    public List<ProductDto> myProducts(@AuthenticationPrincipal UserDetails principal) {
        return productService.myProducts(principal.getUsername());
    }

    @GetMapping("/provider-dashboard")
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN','SUPEROWNER')")
    public ProviderDashboardDto providerDashboard(@AuthenticationPrincipal UserDetails principal) {
        return productService.providerDashboard(principal.getUsername());
    }

    @GetMapping("/{id}")
    public ProductDto get(@PathVariable Long id) {
        return productService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN','SUPEROWNER')")
    public ProductDto create(@Valid @RequestBody ProductRequest req, @AuthenticationPrincipal UserDetails principal) {
        return productService.create(req, principal.getUsername());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN','SUPEROWNER')")
    public ProductDto update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        User actor = productService.requireUser(principal.getUsername());
        return productService.update(id, req, actor);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN','SUPEROWNER')")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails principal) {
        User actor = productService.requireUser(principal.getUsername());
        productService.delete(id, actor);
    }

    @PostMapping("/inventory")
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN','SUPEROWNER')")
    public InventoryDto addInventory(@Valid @RequestBody InventoryRequest req, @AuthenticationPrincipal UserDetails principal) {
        User actor = productService.requireUser(principal.getUsername());
        return productService.addInventory(req, actor);
    }

    @GetMapping("/{productId}/inventory/available")
    public List<InventoryDto> available(
            @PathVariable Long productId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return productService.availableInventory(productId, startDate, endDate);
    }

    @GetMapping("/{productId}/reviews")
    public List<ProductReviewDto> reviews(@PathVariable Long productId) {
        return productService.reviews(productId);
    }

    @GetMapping("/{productId}/reviews/summary")
    public ProductReviewSummaryDto reviewSummary(@PathVariable Long productId) {
        return productService.reviewSummary(productId);
    }

    @PostMapping("/{productId}/reviews")
    @PreAuthorize("isAuthenticated()")
    public ProductReviewDto upsertReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewUpsertRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return productService.upsertReview(productId, req, principal.getUsername());
    }

    @PostMapping("/{productId}/ai-tagging")
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN','SUPEROWNER')")
    public ProductDto aiTagging(
            @PathVariable Long productId,
            @RequestBody ProductAiTaggingRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        User actor = productService.requireUser(principal.getUsername());
        return productService.runAiTagging(productId, req, actor);
    }
}
