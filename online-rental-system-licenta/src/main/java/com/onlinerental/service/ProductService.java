package com.onlinerental.service;

import com.onlinerental.domain.InventoryStatus;
import com.onlinerental.domain.InventoryUnit;
import com.onlinerental.domain.Product;
import com.onlinerental.domain.Rental;
import com.onlinerental.domain.RentalStatus;
import com.onlinerental.domain.User;
import com.onlinerental.repository.InventoryUnitRepository;
import com.onlinerental.repository.ProductRepository;
import com.onlinerental.repository.ProductReviewRepository;
import com.onlinerental.repository.RentalRepository;
import com.onlinerental.repository.UserRepository;
import com.onlinerental.web.DtoMapper;
import com.onlinerental.web.dto.InventoryDto;
import com.onlinerental.web.dto.InventoryRequest;
import com.onlinerental.web.dto.ProductDto;
import com.onlinerental.web.dto.ProductAiTaggingRequest;
import com.onlinerental.web.dto.ProductRequest;
import com.onlinerental.web.dto.ProductReviewDto;
import com.onlinerental.web.dto.ProductReviewSummaryDto;
import com.onlinerental.web.dto.ProviderDashboardDto;
import com.onlinerental.web.dto.DeviceIncomeMetricDto;
import com.onlinerental.web.dto.MonthlyIncomeDto;
import com.onlinerental.web.dto.ReviewUpsertRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final List<RentalStatus> RENTAL_STATUSES_BLOCKING_CALENDAR = List.of(
            RentalStatus.PENDING,
            RentalStatus.CONFIRMED,
            RentalStatus.ACTIVE,
            RentalStatus.OVERDUE);

    private final ProductRepository productRepository;
    private final InventoryUnitRepository inventoryUnitRepository;
    private final ProductReviewRepository productReviewRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final AiComparisonService aiComparisonService;

    public List<ProductDto> listFiltered(String category, String brand, String model) {
        return listFiltered(category, brand, model, null, null, null, null, null, null);
    }

    public List<ProductDto> listFiltered(
            String category,
            String brand,
            String model,
            BigDecimal weightMin,
            BigDecimal weightMax,
            BigDecimal thicknessMin,
            BigDecimal thicknessMax,
            String color,
            String search
    ) {
        String c = emptyToNull(category);
        String b = emptyToNull(brand);
        String m = emptyToNull(model);
        return productRepository.findWithFilters(
                        c,
                        b,
                        m,
                        weightMin,
                        weightMax,
                        thicknessMin,
                        thicknessMax,
                        emptyToNull(color),
                        emptyToNull(search)
                ).stream()
                .map(DtoMapper::toProductDto)
                .toList();
    }

    public List<String> categories() {
        return productRepository.findDistinctCategories();
    }

    public List<String> brands(String category) {
        return productRepository.findDistinctBrands(emptyToNull(category));
    }

    public List<String> models(String category, String brand) {
        return productRepository.findDistinctModels(emptyToNull(category), emptyToNull(brand));
    }

    public ProductDto getById(Long id) {
        return DtoMapper.toProductDto(productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produs inexistent")));
    }

    @Transactional
    public ProductDto create(ProductRequest req, String ownerUsername) {
        User owner = userRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new IllegalArgumentException("Utilizator inexistent"));
        Product p = Product.builder()
                .owner(owner)
                .name(req.name())
                .description(req.description())
                .dailyPrice(req.dailyPrice())
                .category(req.category())
                .brand(req.brand())
                .model(req.model())
                .imageUrl(req.imageUrl())
                .discountPercent(req.discountPercent() != null ? req.discountPercent() : BigDecimal.ZERO)
                .build();
        return DtoMapper.toProductDto(productRepository.save(p));
    }

    @Transactional
    public ProductDto update(Long id, ProductRequest req, User actor) {
        Product p = productRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Produs inexistent"));
        assertCanManageProduct(actor, p);
        p.setName(req.name());
        p.setDescription(req.description());
        p.setDailyPrice(req.dailyPrice());
        p.setCategory(req.category());
        p.setBrand(req.brand());
        p.setModel(req.model());
        p.setImageUrl(req.imageUrl());
        p.setDiscountPercent(req.discountPercent() != null ? req.discountPercent() : BigDecimal.ZERO);
        p.setUpdatedAt(Instant.now());
        return DtoMapper.toProductDto(productRepository.save(p));
    }

    @Transactional
    public void delete(Long id, User actor) {
        Product p = productRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Produs inexistent"));
        assertCanManageProduct(actor, p);
        productRepository.delete(p);
    }

    @Transactional
    public InventoryDto addInventory(InventoryRequest req, User actor) {
        Product p = productRepository.findById(req.productId())
                .orElseThrow(() -> new IllegalArgumentException("Produs inexistent"));
        assertCanManageProduct(actor, p);
        if (inventoryUnitRepository.existsByProductIdAndSerialNumber(req.productId(), req.serialNumber())) {
            throw new IllegalArgumentException("Serie deja înregistrată pentru acest produs");
        }
        InventoryUnit unit = InventoryUnit.builder()
                .product(p)
                .serialNumber(req.serialNumber())
                .status(InventoryStatus.AVAILABLE)
                .build();
        return DtoMapper.toInventoryDto(inventoryUnitRepository.save(unit), true);
    }

    public List<InventoryDto> availableInventory(Long productId, LocalDate rangeStart, LocalDate rangeEnd) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Produs inexistent"));
        if (rangeStart == null || rangeEnd == null || rangeStart.isAfter(rangeEnd)) {
            return inventoryUnitRepository.findByProduct(p).stream()
                    .filter(u -> isUnitListedForRentalCalendar(u.getStatus()))
                    .map(u -> DtoMapper.toInventoryDto(u, false))
                    .toList();
        }
        return inventoryUnitRepository.findByProduct(p).stream()
                .filter(u -> isInventoryAvailableForRentalRange(u, rangeStart, rangeEnd))
                .map(u -> DtoMapper.toInventoryDto(u, false))
                .toList();
    }

    private static boolean isUnitListedForRentalCalendar(InventoryStatus s) {
        return s != InventoryStatus.LOST
                && s != InventoryStatus.MAINTENANCE
                && s != InventoryStatus.PENDING_RETURN;
    }

    private boolean isInventoryAvailableForRentalRange(InventoryUnit u, LocalDate start, LocalDate end) {
        InventoryStatus s = u.getStatus();
        if (!isUnitListedForRentalCalendar(s)) {
            return false;
        }
        long overlaps = rentalRepository.countBlockingRentalsOverlapping(
                u.getId(), start, end, RENTAL_STATUSES_BLOCKING_CALENDAR);
        return overlaps == 0;
    }

    public List<ProductDto> myProducts(String username) {
        User u = userRepository.findByUsername(username).orElseThrow();
        return productRepository.findByOwner(u).stream().map(DtoMapper::toProductDto).toList();
    }

    public ProviderDashboardDto providerDashboard(String username) {
        User owner = userRepository.findByUsername(username).orElseThrow();
        List<Rental> rentals = rentalRepository.findByProductOwnerWithDetails(owner);

        Map<Long, List<Rental>> groupedByProduct = rentals.stream()
                .filter(this::isRevenueRental)
                .collect(Collectors.groupingBy(r -> r.getInventory().getProduct().getId()));

        List<DeviceIncomeMetricDto> deviceMetrics = groupedByProduct.entrySet().stream()
                .map(entry -> {
                    Product product = entry.getValue().get(0).getInventory().getProduct();
                    BigDecimal revenue = entry.getValue().stream()
                            .map(Rental::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new DeviceIncomeMetricDto(
                            product.getId(),
                            product.getName(),
                            revenue,
                            entry.getValue().size()
                    );
                })
                .toList();

        Map<String, BigDecimal> monthly = rentals.stream()
                .filter(this::isRevenueRental)
                .collect(Collectors.groupingBy(
                        r -> r.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate().withDayOfMonth(1).toString(),
                        Collectors.mapping(Rental::getTotalPrice, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        BigDecimal totalIncome = deviceMetrics.stream()
                .map(DeviceIncomeMetricDto::totalRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalRentals = deviceMetrics.stream().mapToLong(DeviceIncomeMetricDto::rentalCount).sum();

        List<MonthlyIncomeDto> monthlyDtos = monthly.entrySet().stream()
                .map(e -> new MonthlyIncomeDto(e.getKey(), e.getValue()))
                .sorted((a, b) -> a.month().compareTo(b.month()))
                .toList();

        return new ProviderDashboardDto(totalIncome, totalRentals, deviceMetrics, monthlyDtos);
    }

    @Transactional(readOnly = true)
    public List<ProductReviewDto> reviews(Long productId) {
        Product p = productRepository.findById(productId).orElseThrow(() -> new IllegalArgumentException("Produs inexistent"));
        return productReviewRepository.findByProductOrderByCreatedAtDesc(p).stream()
                .map(r -> new ProductReviewDto(
                        r.getId(),
                        p.getId(),
                        r.getUser().getId(),
                        r.getUser().getUsername(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt(),
                        r.getUpdatedAt()
                ))
                .toList();
    }

    public ProductReviewSummaryDto reviewSummary(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new IllegalArgumentException("Produs inexistent");
        }
        Double avg = productReviewRepository.averageRatingByProductId(productId);
        long count = productReviewRepository.countByProductId(productId);
        return new ProductReviewSummaryDto(productId, avg != null ? avg : 0.0, count);
    }

    @Transactional
    public ProductReviewDto upsertReview(Long productId, ReviewUpsertRequest req, String username) {
        Product p = productRepository.findById(productId).orElseThrow(() -> new IllegalArgumentException("Produs inexistent"));
        User u = userRepository.findByUsername(username).orElseThrow();
        var existing = productReviewRepository.findByProductAndUser(p, u);
        var review = existing.orElseGet(() -> com.onlinerental.domain.ProductReview.builder()
                .product(p)
                .user(u)
                .build());
        review.setRating(req.rating());
        review.setComment(req.comment());
        review.setUpdatedAt(Instant.now());
        var saved = productReviewRepository.save(review);
        return new ProductReviewDto(
                saved.getId(),
                p.getId(),
                u.getId(),
                u.getUsername(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
    }

    public void assertCanManageProduct(User actor, Product p) {
        boolean superOrAdmin =
                actor.getRoles().contains("ROLE_ADMIN") || actor.getRoles().contains("ROLE_SUPEROWNER");
        boolean vendorOwner =
                actor.getRoles().contains("ROLE_VENDOR") && p.getOwner() != null
                        && p.getOwner().getId().equals(actor.getId());
        if (!superOrAdmin && !vendorOwner) {
            throw new IllegalStateException("Nu poți modifica acest produs.");
        }
    }

    public User requireUser(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("Utilizator inexistent"));
    }

    @Transactional
    public ProductDto runAiTagging(Long productId, ProductAiTaggingRequest req, User actor) {
        Product p = productRepository.findById(productId).orElseThrow(() -> new IllegalArgumentException("Produs inexistent"));
        assertCanManageProduct(actor, p);
        List<String> imageUrls = req != null && req.imageUrls() != null ? req.imageUrls() : List.of();
        if (imageUrls.isEmpty()) {
            throw new IllegalArgumentException("Trimite minim o imagine pentru AI tagging.");
        }
        AiComparisonService.AiCompareResult result = aiComparisonService.compare(productId, imageUrls, imageUrls);

        List<String> tags = new ArrayList<>();
        if (p.getCategory() != null) tags.add(p.getCategory());
        if (p.getBrand() != null) tags.add(p.getBrand());
        if (p.getModel() != null) tags.add(p.getModel());
        if (req != null && req.searchHint() != null && !req.searchHint().isBlank()) tags.add(req.searchHint().trim());
        if (result.predictedCondition() != null) tags.add(result.predictedCondition());
        if (result.detectedBrand() != null) tags.add(result.detectedBrand());
        if (result.detectedModel() != null) tags.add(result.detectedModel());

        p.setDetectedBrand(firstNonBlank(result.detectedBrand(), p.getDetectedBrand(), p.getBrand()));
        p.setDetectedModel(firstNonBlank(result.detectedModel(), p.getDetectedModel(), p.getModel()));
        p.setModelConfidence(result.modelMatchScore());
        p.setAiTags(String.join(", ", tags.stream().filter(s -> s != null && !s.isBlank()).map(String::trim).distinct().toList()));
        applyPhysicalMetadataFromText(p, result.ocrText());
        p.setUpdatedAt(Instant.now());

        return DtoMapper.toProductDto(productRepository.save(p));
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private static void applyPhysicalMetadataFromText(Product product, String text) {
        if (text == null || text.isBlank()) {
            return;
        }
        String lower = text.toLowerCase(Locale.ROOT);
        Matcher weight = Pattern.compile("(\\d+(?:[\\.,]\\d+)?)\\s*(kg|kilogram)").matcher(lower);
        if (weight.find()) {
            product.setWeightKg(parseDecimal(weight.group(1)));
        }
        Matcher thickness = Pattern.compile("(\\d+(?:[\\.,]\\d+)?)\\s*(mm|millimeter)").matcher(lower);
        if (thickness.find()) {
            product.setThicknessMm(parseDecimal(thickness.group(1)));
        }
        if (lower.contains("black")) product.setColorDetected("black");
        else if (lower.contains("white")) product.setColorDetected("white");
        else if (lower.contains("silver")) product.setColorDetected("silver");
        else if (lower.contains("gray") || lower.contains("grey")) product.setColorDetected("gray");
        else if (lower.contains("blue")) product.setColorDetected("blue");
        else if (lower.contains("red")) product.setColorDetected("red");
    }

    private static BigDecimal parseDecimal(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(value.replace(',', '.'));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static String emptyToNull(String s) {
        return s == null || s.isBlank() ? null : s;
    }

    private boolean isRevenueRental(Rental rental) {
        return rental.getStatus() == RentalStatus.CONFIRMED
                || rental.getStatus() == RentalStatus.ACTIVE
                || rental.getStatus() == RentalStatus.RETURNED
                || rental.getStatus() == RentalStatus.COMPLETED;
    }
}
