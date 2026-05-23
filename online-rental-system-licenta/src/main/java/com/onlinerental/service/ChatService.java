package com.onlinerental.service;

import com.onlinerental.config.AppProperties;
import com.onlinerental.domain.Rental;
import com.onlinerental.domain.User;
import com.onlinerental.repository.RentalRepository;
import com.onlinerental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final AppProperties appProperties;
    private final UserRepository userRepository;
    private final RentalRepository rentalRepository;

    public record ChatMessage(String role, String content) {}

    public record ChatResponse(String reply) {}

    @Transactional(readOnly = true)
    public ChatResponse chat(String message, List<ChatMessage> history, String username) {
        AppProperties.Ai ai = appProperties.getAi();
        if (ai.getChatUrl() == null || ai.getChatUrl().isBlank()) {
            return new ChatResponse("Chatbot-ul nu este configurat momentan.");
        }

        String userContext = buildUserContext(username);

        Map<String, Object> payload = new HashMap<>();
        payload.put("message", message);
        payload.put("history", history);
        payload.put("userContext", userContext);

        try {
            RestTemplate rt = new RestTemplateBuilder()
                    .setConnectTimeout(Duration.ofMillis(ai.getConnectTimeoutMs()))
                    .setReadTimeout(Duration.ofMillis(ai.getReadTimeoutMs()))
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            @SuppressWarnings("unchecked")
            Map<String, Object> body = rt.postForObject(
                    ai.getChatUrl(),
                    new HttpEntity<>(payload, headers),
                    Map.class
            );

            if (body != null && body.containsKey("reply")) {
                return new ChatResponse(String.valueOf(body.get("reply")));
            }
            return new ChatResponse("Nu am putut procesa răspunsul.");
        } catch (RestClientException ex) {
            log.error("Chat AI service error: {}", ex.getMessage());
            return new ChatResponse("Serviciul de chat nu este disponibil momentan. Încercați din nou mai târziu.");
        }
    }

    private String buildUserContext(String username) {
        if (username == null) {
            return "";
        }

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return "";
        }

        StringBuilder ctx = new StringBuilder();
        ctx.append("Utilizator: ").append(user.getFirstName()).append(" ").append(user.getLastName());
        ctx.append(" (username: ").append(user.getUsername()).append(")\n");

        List<Rental> rentals = rentalRepository.findByUserOrderByCreatedAtDesc(user);
        if (rentals.isEmpty()) {
            ctx.append("Nu are nicio închiriere.\n");
            return ctx.toString();
        }

        ctx.append("Total închirieri: ").append(rentals.size()).append("\n\n");

        List<Rental> active = rentals.stream()
                .filter(r -> List.of(
                        com.onlinerental.domain.RentalStatus.PENDING,
                        com.onlinerental.domain.RentalStatus.CONFIRMED,
                        com.onlinerental.domain.RentalStatus.ACTIVE
                ).contains(r.getStatus()))
                .toList();

        if (!active.isEmpty()) {
            ctx.append("Închirieri active/în curs (").append(active.size()).append("):\n");
            for (Rental r : active) {
                String productName = r.getInventory() != null && r.getInventory().getProduct() != null
                        ? r.getInventory().getProduct().getName()
                        : "Produs necunoscut";
                ctx.append("- #").append(r.getId())
                        .append(": ").append(productName)
                        .append(" | Status: ").append(r.getStatus())
                        .append(" | Perioadă: ").append(r.getStartDate()).append(" → ").append(r.getEndDate())
                        .append(" | Preț total: ").append(r.getTotalPrice()).append(" RON");
                if (r.getEndDate() != null) {
                    long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), r.getEndDate());
                    if (daysLeft >= 0) {
                        ctx.append(" | Zile rămase: ").append(daysLeft);
                    } else {
                        ctx.append(" | ÎNTÂRZIERE: ").append(Math.abs(daysLeft)).append(" zile");
                    }
                }
                if (r.getDeliveryType() != null) {
                    ctx.append(" | Livrare: ").append(r.getDeliveryType());
                }
                ctx.append("\n");
            }
        }

        long completedCount = rentals.stream()
                .filter(r -> r.getStatus() == com.onlinerental.domain.RentalStatus.COMPLETED)
                .count();
        long canceledCount = rentals.stream()
                .filter(r -> r.getStatus() == com.onlinerental.domain.RentalStatus.CANCELED)
                .count();
        long returnedCount = rentals.stream()
                .filter(r -> r.getStatus() == com.onlinerental.domain.RentalStatus.RETURNED)
                .count();

        ctx.append("\nSumar istoric: ")
                .append(completedCount).append(" finalizate, ")
                .append(returnedCount).append(" returnate (în verificare), ")
                .append(canceledCount).append(" anulate.\n");

        return ctx.toString();
    }
}
