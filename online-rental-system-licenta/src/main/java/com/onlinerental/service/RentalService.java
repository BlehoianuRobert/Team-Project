package com.onlinerental.service;

import com.onlinerental.domain.DeliveryStatus;
import com.onlinerental.domain.DeliveryType;
import com.onlinerental.domain.HandoverSessionStatus;
import com.onlinerental.domain.HandoverStage;
import com.onlinerental.domain.InventoryStatus;
import com.onlinerental.domain.InventoryUnit;
import com.onlinerental.domain.ItemCondition;
import com.onlinerental.domain.RentalAiComparison;
import com.onlinerental.domain.RentalBaselineImage;
import com.onlinerental.domain.RentalHandoverSession;
import com.onlinerental.domain.RentalPhotoVerification;
import com.onlinerental.domain.Rental;
import com.onlinerental.domain.RentalReturnImage;
import com.onlinerental.domain.RentalStatus;
import com.onlinerental.domain.User;
import com.onlinerental.domain.VerificationVerdict;
import com.onlinerental.repository.RentalAiComparisonRepository;
import com.onlinerental.repository.RentalBaselineImageRepository;
import com.onlinerental.repository.InventoryUnitRepository;
import com.onlinerental.repository.RentalHandoverSessionRepository;
import com.onlinerental.repository.RentalPhotoVerificationRepository;
import com.onlinerental.repository.RentalRepository;
import com.onlinerental.repository.RentalReturnImageRepository;
import com.onlinerental.repository.UserRepository;
import com.onlinerental.util.PricingUtil;
import com.onlinerental.web.DtoMapper;
import com.onlinerental.web.dto.ApiResponse;
import com.onlinerental.web.dto.ConditionCheckRequest;
import com.onlinerental.web.dto.RentalAiComparisonDto;
import com.onlinerental.web.dto.RentalDto;
import com.onlinerental.web.dto.RentalImageDto;
import com.onlinerental.web.dto.RentalPhotoUploadDto;
import com.onlinerental.web.dto.RentalPhotoVerificationDto;
import com.onlinerental.web.dto.RentalRequest;
import com.onlinerental.web.dto.RentalReturnWorkflowDto;
import com.onlinerental.web.dto.ReviewReturnDecisionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RentalService {

    public static final int MIN_RETURN_PHOTOS = 3;

    private static final List<RentalStatus> RENTAL_STATUSES_BLOCKING_CALENDAR = List.of(
            RentalStatus.PENDING,
            RentalStatus.CONFIRMED,
            RentalStatus.ACTIVE,
            RentalStatus.OVERDUE);

    private final RentalRepository rentalRepository;
    private final InventoryUnitRepository inventoryUnitRepository;
    private final UserRepository userRepository;
    private final RentalBaselineImageRepository baselineImageRepository;
    private final RentalReturnImageRepository returnImageRepository;
    private final RentalAiComparisonRepository aiComparisonRepository;
    private final RentalHandoverSessionRepository handoverSessionRepository;
    private final RentalPhotoVerificationRepository photoVerificationRepository;
    private final FileStorageService fileStorageService;
    private final AiComparisonService aiComparisonService;
    private final EmailService emailService;

    @Transactional
    public RentalDto create(RentalRequest req, String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        InventoryUnit inv = inventoryUnitRepository.findById(Objects.requireNonNull(req.inventoryId()))
                .orElseThrow(() -> new IllegalArgumentException("Unitate inventar inexistentă"));
        InventoryStatus invSt = inv.getStatus();
        if (invSt == InventoryStatus.LOST || invSt == InventoryStatus.MAINTENANCE) {
            throw new IllegalArgumentException("Unitatea nu este disponibilă");
        }
        if (invSt == InventoryStatus.PENDING_RETURN) {
            throw new IllegalArgumentException("Unitatea este în proces de returnare și nu poate fi închiriată.");
        }
        if (!req.startDate().isBefore(req.endDate())) {
            throw new IllegalArgumentException("Data de început trebuie să fie înainte de data de sfârșit");
        }
        long blocking = rentalRepository.countBlockingRentalsOverlapping(
                inv.getId(), req.startDate(), req.endDate(), RENTAL_STATUSES_BLOCKING_CALENDAR);
        if (blocking > 0) {
            throw new IllegalArgumentException("Unitatea este deja rezervată în perioada selectată.");
        }
        var product = inv.getProduct();
        int days = PricingUtil.rentalDaysInclusive(req.startDate(), req.endDate());
        BigDecimal total = PricingUtil.totalPrice(product.getDailyPrice(), days, product.getDiscountPercent());
        BigDecimal deposit = PricingUtil.depositFor(total);

        Rental.RentalBuilder b = Rental.builder()
                .user(user)
                .inventory(inv)
                .startDate(req.startDate())
                .endDate(req.endDate())
                .status(RentalStatus.PENDING)
                .totalPrice(total)
                .depositAmount(deposit)
                .itemCondition(ItemCondition.PENDING_CHECK);

        if (req.deliveryType() != null) {
            DeliveryType dt = DeliveryType.valueOf(req.deliveryType());
            b.deliveryType(dt);
            if (dt == DeliveryType.DELIVERY) {
                b.deliveryAddress(req.deliveryAddress());
                b.deliveryPhone(req.deliveryPhone());
                b.deliveryStatus(DeliveryStatus.PENDING);
                b.twoDayDelivery(Boolean.TRUE.equals(req.twoDayDelivery()));
                int add = Boolean.TRUE.equals(req.twoDayDelivery()) ? 2 : 5;
                b.estimatedDeliveryDate(req.startDate().minusDays(1).isAfter(LocalDate.now())
                        ? req.startDate().plusDays(add)
                        : LocalDate.now().plusDays(add));
            } else {
                b.pickupDate(req.startDate());
            }
        }

        Rental saved = rentalRepository.save(Objects.requireNonNull(b.build()));
        inv.setStatus(InventoryStatus.ON_RENTAL);
        inv.setUpdatedAt(java.time.Instant.now());
        inventoryUnitRepository.save(inv);
        emailService.sendReservationCreatedEmail(user, saved);
        return loadDto(saved.getId(), user, false);
    }

    public List<RentalDto> myRentals(String username) {
        User u = userRepository.findByUsername(username).orElseThrow();
        return rentalRepository.findByUserOrderByCreatedAtDesc(u).stream()
                .map(r -> loadDto(r.getId(), u, false))
                .toList();
    }

    public List<RentalDto> allRentals() {
        return rentalRepository.findAllWithDetails().stream()
                .map(r -> DtoMapper.toRentalDto(r))
                .toList();
    }

    public RentalDto getById(Long id, User actor) {
        if (isSuperOwner(actor)) {
            Rental r = rentalRepository.findByIdWithDetails(id)
                    .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
            return DtoMapper.toRentalDto(r);
        }
        User u = userRepository.findByUsername(actor.getUsername()).orElseThrow();
        Rental r = rentalRepository.findByIdAndUserWithDetails(id, u)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        return DtoMapper.toRentalDto(r);
    }

    @Transactional
    public ApiResponse updateStatus(Long id, String newStatus, User actor) {
        if (!isSuperOwner(actor)) {
            throw new IllegalStateException("Acces interzis");
        }
        RentalStatus st = RentalStatus.valueOf(newStatus);
        Rental r = rentalRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        r.setStatus(st);
        if (st == RentalStatus.ACTIVE) {
            r.setDeliveryStatus(DeliveryStatus.DELIVERED);
            r.setActualDeliveryDate(LocalDate.now());
        }
        if (st == RentalStatus.CANCELED || st == RentalStatus.COMPLETED || st == RentalStatus.RETURNED) {
            if (r.getActualReturnDate() == null) {
                r.setActualReturnDate(LocalDate.now());
            }
            r.setReturnRequested(false);
            releaseInventoryIfDone(r, st);
        }
        return ApiResponse.ok("Status actualizat");
    }

    @Transactional
    public ApiResponse delete(Long id, User actor) {
        if (!isSuperOwner(actor)) {
            throw new IllegalStateException("Acces interzis");
        }
        Rental r = rentalRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        if (r.getStatus() != RentalStatus.PENDING && r.getStatus() != RentalStatus.CANCELED) {
            throw new IllegalArgumentException("Ștergerea este permisă doar pentru rezervări în așteptare sau anulate");
        }
        freeInventory(r);
        rentalRepository.delete(r);
        return ApiResponse.ok("Șters");
    }

    @Transactional
    public ApiResponse checkCondition(Long id, ConditionCheckRequest req, User actor) {
        if (!isSuperOwner(actor)) {
            throw new IllegalStateException("Acces interzis");
        }
        Rental r = rentalRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        r.setItemCondition(ItemCondition.valueOf(req.condition()));
        r.setConditionNotes(req.notes());
        r.setDepositReturned(r.getItemCondition() == ItemCondition.GOOD);
        return ApiResponse.ok("Stare înregistrată");
    }

    @Transactional
    public ApiResponse generateAwb(Long id, User actor) {
        if (!isSuperOwner(actor)) {
            throw new IllegalStateException("Acces interzis");
        }
        Rental r = rentalRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        r.setAwbNumber("AWB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        r.setDeliveryStatus(DeliveryStatus.IN_TRANSIT);
        return ApiResponse.ok("AWB generat");
    }

    @Transactional
    public RentalPhotoUploadDto uploadBaselinePhoto(Long rentalId, MultipartFile file, User actor) throws IOException {
        Rental rental = rentalRepository.findByIdWithDetails(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        ensureCanAccessRental(rental, actor);
        if (rental.getStatus() == RentalStatus.CANCELED || rental.getStatus() == RentalStatus.COMPLETED) {
            throw new IllegalArgumentException("Nu poți încărca poze pentru o închiriere închisă.");
        }
        String imageUrl = storeImageOrThrow(file);
        baselineImageRepository.save(Objects.requireNonNull(RentalBaselineImage.builder()
                .rental(rental)
                .uploadedBy(actor)
                .imageUrl(imageUrl)
                .build()));
        markStageSessionStarted(rental, HandoverStage.BASELINE, actor);
        return new RentalPhotoUploadDto(true, "Poză de predare încărcată.", imageUrl);
    }

    @Transactional
    public RentalPhotoUploadDto uploadReturnPhoto(Long rentalId, MultipartFile file, User actor) throws IOException {
        Rental rental = rentalRepository.findByIdWithDetails(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        ensureCanAccessRental(rental, actor);
        if (rental.getStatus() == RentalStatus.CANCELED || rental.getStatus() == RentalStatus.COMPLETED) {
            throw new IllegalArgumentException("Nu poți încărca poze pentru o închiriere închisă.");
        }
        String imageUrl = storeImageOrThrow(file);
        returnImageRepository.save(Objects.requireNonNull(RentalReturnImage.builder()
                .rental(rental)
                .uploadedBy(actor)
                .imageUrl(imageUrl)
                .build()));
        markStageSessionStarted(rental, HandoverStage.RETURN, actor);
        return new RentalPhotoUploadDto(true, "Poză pentru retur încărcată.", imageUrl);
    }

    @Transactional(readOnly = true)
    public RentalReturnWorkflowDto getReturnWorkflow(Long rentalId, User actor) {
        Rental rental = rentalRepository.findByIdWithDetails(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        ensureCanAccessRental(rental, actor);

        List<RentalBaselineImage> baseline = baselineImageRepository.findByRentalIdOrderByCreatedAtDesc(rentalId);
        List<RentalReturnImage> returns = returnImageRepository.findByRentalIdOrderByCreatedAtDesc(rentalId);
        RentalAiComparison latest = aiComparisonRepository.findFirstByRentalIdOrderByCreatedAtDesc(rentalId).orElse(null);
        RentalPhotoVerification latestBaselineVerification = photoVerificationRepository
                .findTopByRentalIdAndStageOrderByCreatedAtDesc(rentalId, HandoverStage.BASELINE)
                .orElse(null);
        RentalPhotoVerification latestReturnVerification = photoVerificationRepository
                .findTopByRentalIdAndStageOrderByCreatedAtDesc(rentalId, HandoverStage.RETURN)
                .orElse(null);

        return new RentalReturnWorkflowDto(
                MIN_RETURN_PHOTOS,
                baseline.size(),
                returns.size(),
                rental.isReturnRequested(),
                rental.isFlaggedForReview(),
                rental.getAiComparisonScore(),
                rental.getAiPredictedCondition(),
                rental.getAiLastRunAt(),
                baseline.stream().map(this::toImageDto).toList(),
                returns.stream().map(this::toImageDto).toList(),
                latest != null ? toAiDto(latest) : null,
                latestBaselineVerification != null ? toVerificationDto(latestBaselineVerification) : null,
                latestReturnVerification != null ? toVerificationDto(latestReturnVerification) : null
        );
    }

    @Transactional
    public ApiResponse submitReturnRequest(Long rentalId, User actor) {
        Rental rental = rentalRepository.findByIdWithDetails(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        ensureRentalOwner(rental, actor);
        if (rental.getStatus() == RentalStatus.CANCELED || rental.getStatus() == RentalStatus.COMPLETED) {
            throw new IllegalArgumentException("Nu poți solicita retur pentru această închiriere.");
        }
        long count = returnImageRepository.countByRentalId(rentalId);
        if (count < MIN_RETURN_PHOTOS) {
            throw new IllegalArgumentException("Trebuie să încarci minim " + MIN_RETURN_PHOTOS + " poze pentru retur.");
        }
        RentalPhotoVerification returnAi = photoVerificationRepository
                .findTopByRentalIdAndStageOrderByCreatedAtDesc(rentalId, HandoverStage.RETURN)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Rulează verificarea AI pentru retur înainte de a trimite solicitarea."));
        if (returnImageRepository.existsByRentalIdAndCreatedAtAfter(rentalId, returnAi.getCreatedAt())) {
            throw new IllegalArgumentException(
                    "Au fost încărcate poze noi după verificarea AI. Rulează din nou verificarea AI.");
        }
        rental.setReturnRequested(true);
        rental.setReturnRequestedAt(Instant.now());
        rental.setReturnRequestedBy(actor.getId());
        rental.getInventory().setStatus(InventoryStatus.PENDING_RETURN);
        rental.getInventory().setUpdatedAt(Instant.now());
        inventoryUnitRepository.save(Objects.requireNonNull(rental.getInventory()));
        return ApiResponse.ok("Solicitarea de retur a fost trimisă.");
    }

    @Transactional
    public ApiResponse runAiComparison(Long rentalId, User actor) {
        if (!isSuperOwner(actor)) {
            throw new IllegalStateException("Acces interzis");
        }
        Rental rental = rentalRepository.findByIdWithDetails(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        if (!rental.isReturnRequested()) {
            throw new IllegalArgumentException("Utilizatorul nu a trimis încă solicitarea de retur.");
        }

        List<String> baselineUrls = baselineImageRepository.findByRentalIdOrderByCreatedAtDesc(rentalId)
                .stream()
                .map(RentalBaselineImage::getImageUrl)
                .toList();
        List<String> returnUrls = returnImageRepository.findByRentalIdOrderByCreatedAtDesc(rentalId)
                .stream()
                .map(RentalReturnImage::getImageUrl)
                .toList();

        if (baselineUrls.isEmpty()) {
            String productImageUrl = rental.getInventory().getProduct().getImageUrl();
            if (productImageUrl != null && !productImageUrl.isBlank()) {
                baselineUrls = List.of(productImageUrl);
            } else {
                throw new IllegalArgumentException("Nu există poze de predare și nici poză de catalog pentru comparație.");
            }
        }
        if (returnUrls.size() < MIN_RETURN_PHOTOS) {
            throw new IllegalArgumentException("Nu există suficiente poze de retur pentru comparație.");
        }

        AiComparisonService.AiCompareResult result = aiComparisonService.compare(rentalId, baselineUrls, returnUrls);
        aiComparisonRepository.save(Objects.requireNonNull(RentalAiComparison.builder()
                .rental(rental)
                .triggeredBy(actor)
                .score(result.score())
                .predictedCondition(result.predictedCondition())
                .needsReview(result.needsReview())
                .status(result.status())
                .message(result.message())
                .rawResponse(result.rawResponse())
                .build()));
        photoVerificationRepository.save(Objects.requireNonNull(RentalPhotoVerification.builder()
                .rental(rental)
                .stage(HandoverStage.RETURN)
                .triggeredBy(actor)
                .damageScore(result.score())
                .newDamageScore(result.newDamageScore())
                .modelMatchScore(result.modelMatchScore())
                .ocrText(result.ocrText())
                .powerOnDetected(result.powerOnDetected())
                .errorCodesDetected(result.errorCodesDetected())
                .errorCodes(result.errorCodes())
                .detectedBrand(result.detectedBrand())
                .detectedModel(result.detectedModel())
                .serialNumberDetected(result.serialNumberDetected())
                .verdict(resolveVerdict(result))
                .needsReview(result.needsReview())
                .message(result.message())
                .rawResponse(result.rawResponse())
                .build()));

        rental.setAiLastRunAt(Instant.now());
        rental.setAiComparisonScore(result.score());
        rental.setAiPredictedCondition(result.predictedCondition());
        rental.setFlaggedForReview(result.needsReview());
        completeLatestStageSession(rental, HandoverStage.RETURN, actor);
        return ApiResponse.ok(result.message());
    }

    @Transactional
    public ApiResponse runHandoverVerification(Long rentalId, String stageValue, User actor) {
        HandoverStage stage = HandoverStage.valueOf(stageValue.trim().toUpperCase(Locale.ROOT));
        Rental rental = rentalRepository.findByIdWithDetails(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        ensureCanAccessRental(rental, actor);

        String productImageUrl = rental.getInventory().getProduct().getImageUrl();
        List<String> baselineUrls = (productImageUrl != null && !productImageUrl.isBlank())
                ? List.of(productImageUrl)
                : List.of();

        List<String> targetUrls = (stage == HandoverStage.BASELINE
                ? baselineImageRepository.findByRentalIdOrderByCreatedAtDesc(rentalId).stream().map(RentalBaselineImage::getImageUrl).toList()
                : returnImageRepository.findByRentalIdOrderByCreatedAtDesc(rentalId).stream().map(RentalReturnImage::getImageUrl).toList());

        if (targetUrls.isEmpty()) {
            throw new IllegalArgumentException("Nu există poze pentru etapa " + stage.name() + ".");
        }
        if (stage == HandoverStage.BASELINE && baselineUrls.isEmpty()) {
            throw new IllegalArgumentException("Produsul nu are poze în catalog pentru verificarea AI.");
        }
        markStageSessionStarted(rental, stage, actor);
        String productContext = rental.getInventory().getProduct().getName()
                + " " + (rental.getInventory().getProduct().getBrand() != null ? rental.getInventory().getProduct().getBrand() : "")
                + " " + (rental.getInventory().getProduct().getCategory() != null ? rental.getInventory().getProduct().getCategory() : "");
        AiComparisonService.AiCompareResult result = aiComparisonService.compare(rentalId, baselineUrls, targetUrls, productContext.trim());
        photoVerificationRepository.save(Objects.requireNonNull(RentalPhotoVerification.builder()
                .rental(rental)
                .stage(stage)
                .triggeredBy(actor)
                .damageScore(result.score())
                .newDamageScore(result.newDamageScore())
                .modelMatchScore(result.modelMatchScore())
                .ocrText(result.ocrText())
                .powerOnDetected(result.powerOnDetected())
                .errorCodesDetected(result.errorCodesDetected())
                .errorCodes(result.errorCodes())
                .detectedBrand(result.detectedBrand())
                .detectedModel(result.detectedModel())
                .serialNumberDetected(result.serialNumberDetected())
                .verdict(resolveVerdict(result, stage == HandoverStage.BASELINE))
                .needsReview(result.needsReview())
                .message(result.message())
                .rawResponse(result.rawResponse())
                .build()));
        completeLatestStageSession(rental, stage, actor);
        return ApiResponse.ok(result.message());
    }

    @Transactional
    public ApiResponse reviewReturnDecision(Long rentalId, ReviewReturnDecisionRequest req, User actor) {
        if (!isSuperOwner(actor)) {
            throw new IllegalStateException("Acces interzis");
        }
        Rental rental = rentalRepository.findByIdWithDetails(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
        if (!rental.isReturnRequested() && rental.getStatus() != RentalStatus.RETURNED) {
            throw new IllegalArgumentException("Nu există o solicitare de retur activă.");
        }

        ItemCondition condition = ItemCondition.valueOf(req.condition().trim().toUpperCase(Locale.ROOT));
        rental.setItemCondition(condition);
        rental.setConditionNotes(req.notes());
        rental.setDepositReturned(condition == ItemCondition.GOOD);
        rental.setFlaggedForReview(false);
        rental.setReturnRequested(false);
        rental.setActualReturnDate(LocalDate.now());

        RentalStatus target = req.markCompleted() ? RentalStatus.COMPLETED : RentalStatus.RETURNED;
        rental.setStatus(target);
        releaseInventoryIfDone(rental, target);
        return ApiResponse.ok("Decizia pentru retur a fost salvată.");
    }

    private RentalDto loadDto(Long id, User user, boolean admin) {
        Rental r = admin
                ? rentalRepository.findByIdWithDetails(id).orElseThrow()
                : rentalRepository.findByIdAndUserWithDetails(id, user).orElseThrow();
        return DtoMapper.toRentalDto(r);
    }

    private boolean isSuperOwner(User actor) {
        return actor.getRoles().contains("ROLE_SUPEROWNER");
    }

    private String storeImageOrThrow(MultipartFile file) throws IOException {
        Map<String, Object> upload = fileStorageService.storeImage(file);
        if (!Boolean.TRUE.equals(upload.get("success"))) {
            throw new IllegalArgumentException(String.valueOf(upload.getOrDefault("message", "Încărcare eșuată")));
        }
        Object imageUrl = upload.get("imageUrl");
        if (imageUrl == null) {
            throw new IllegalArgumentException("URL imagine lipsă după încărcare.");
        }
        return String.valueOf(imageUrl);
    }

    private void ensureCanAccessRental(Rental rental, User actor) {
        if (isSuperOwner(actor)) {
            return;
        }
        if (!rental.getUser().getUsername().equals(actor.getUsername())) {
            throw new IllegalStateException("Acces interzis");
        }
    }

    private void ensureRentalOwner(Rental rental, User actor) {
        if (!rental.getUser().getUsername().equals(actor.getUsername())) {
            throw new IllegalStateException("Doar clientul care a închiriat poate trimite returul.");
        }
    }

    private RentalImageDto toImageDto(RentalBaselineImage image) {
        return new RentalImageDto(
                image.getId(),
                image.getImageUrl(),
                image.getCreatedAt(),
                image.getUploadedBy().getUsername()
        );
    }

    private RentalImageDto toImageDto(RentalReturnImage image) {
        return new RentalImageDto(
                image.getId(),
                image.getImageUrl(),
                image.getCreatedAt(),
                image.getUploadedBy().getUsername()
        );
    }

    private RentalAiComparisonDto toAiDto(RentalAiComparison ai) {
        return new RentalAiComparisonDto(
                ai.getId(),
                ai.getScore(),
                ai.getPredictedCondition(),
                ai.isNeedsReview(),
                ai.getStatus(),
                ai.getMessage(),
                ai.getCreatedAt(),
                ai.getTriggeredBy().getUsername()
        );
    }

    private RentalPhotoVerificationDto toVerificationDto(RentalPhotoVerification verification) {
        return new RentalPhotoVerificationDto(
                verification.getId(),
                verification.getStage().name(),
                verification.getDamageScore(),
                verification.getNewDamageScore(),
                verification.getModelMatchScore(),
                verification.getOcrText(),
                verification.getPowerOnDetected(),
                verification.getErrorCodesDetected(),
                verification.getErrorCodes(),
                verification.getDetectedBrand(),
                verification.getDetectedModel(),
                verification.getSerialNumberDetected(),
                verification.getVerdict().name(),
                verification.isNeedsReview(),
                verification.getMessage(),
                verification.getCreatedAt()
        );
    }

    private void markStageSessionStarted(Rental rental, HandoverStage stage, User actor) {
        if (handoverSessionRepository.findTopByRentalIdAndStageOrderByStartedAtDesc(rental.getId(), stage).isPresent()) {
            return;
        }
        handoverSessionRepository.save(Objects.requireNonNull(RentalHandoverSession.builder()
                .rental(rental)
                .stage(stage)
                .status(HandoverSessionStatus.PENDING)
                .startedBy(actor)
                .build()));
    }

    private void completeLatestStageSession(Rental rental, HandoverStage stage, User actor) {
        handoverSessionRepository.findTopByRentalIdAndStageOrderByStartedAtDesc(rental.getId(), stage)
                .ifPresent(session -> {
                    session.setStatus(HandoverSessionStatus.COMPLETED);
                    session.setCompletedBy(actor);
                    session.setCompletedAt(Instant.now());
                });
    }

    private VerificationVerdict resolveVerdict(AiComparisonService.AiCompareResult result) {
        return resolveVerdict(result, false);
    }

    private VerificationVerdict resolveVerdict(AiComparisonService.AiCompareResult result, boolean strictBaseline) {
        if ("FAILED".equalsIgnoreCase(result.status())) {
            return VerificationVerdict.FAILED;
        }
        double mismatchThreshold = strictBaseline ? 0.75 : 0.55;
        if (result.modelMatchScore() != null && result.modelMatchScore().compareTo(BigDecimal.valueOf(mismatchThreshold)) < 0) {
            return VerificationVerdict.MISMATCH;
        }
        return result.needsReview() ? VerificationVerdict.REVIEW_REQUIRED : VerificationVerdict.MATCH;
    }

    private void releaseInventoryIfDone(Rental r, RentalStatus st) {
        if (st == RentalStatus.COMPLETED || st == RentalStatus.CANCELED || st == RentalStatus.RETURNED) {
            freeInventory(r);
        }
    }

    private void freeInventory(Rental r) {
        InventoryUnit inv = r.getInventory();
        inv.setStatus(InventoryStatus.AVAILABLE);
        inv.setUpdatedAt(java.time.Instant.now());
        inventoryUnitRepository.save(inv);
    }

    public Rental requireRentalForPayment(Long id, String username) {
        User u = userRepository.findByUsername(username).orElseThrow();
        return rentalRepository.findByIdAndUserWithDetails(id, u)
                .orElseThrow(() -> new IllegalArgumentException("Închiriere inexistentă"));
    }

    public Rental requireRentalByPaymentIntent(String paymentIntentId) {
        return rentalRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new IllegalArgumentException("Plată necunoscută"));
    }

    public Rental requireRentalByPaymentIntentForUser(String paymentIntentId, String username) {
        Rental rental = requireRentalByPaymentIntent(paymentIntentId);
        if (!rental.getUser().getUsername().equals(username)) {
            throw new IllegalStateException("Nu poți accesa plata altui utilizator.");
        }
        return rental;
    }

    @Transactional
    public void attachPaymentIntent(Long rentalId, String paymentIntentId) {
        Rental r = rentalRepository.findById(Objects.requireNonNull(rentalId)).orElseThrow();
        r.setStripePaymentIntentId(paymentIntentId);
    }

    @Transactional
    public void confirmPaid(String paymentIntentId) {
        Rental r = requireRentalByPaymentIntent(paymentIntentId);
        if (r.getStatus() != RentalStatus.PENDING) {
            throw new IllegalArgumentException("Rezervarea nu așteaptă plată");
        }
        r.setStatus(RentalStatus.CONFIRMED);
    }
}
