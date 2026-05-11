package com.onlinerental.service;

import com.onlinerental.config.AppProperties;
import com.onlinerental.domain.User;
import com.onlinerental.repository.UserRepository;
import com.onlinerental.security.JwtService;
import com.onlinerental.web.dto.ApiResponse;
import com.onlinerental.web.dto.JwtResponse;
import com.onlinerental.web.dto.LoginRequest;
import com.onlinerental.web.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AppProperties appProperties;
    private final EmailService emailService;

    @Transactional
    public JwtResponse login(LoginRequest req) {
        String identifier = req.username().trim();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, req.password())
        );
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new IllegalArgumentException("Utilizator inexistent"));
        if (appProperties.isEmailConfirmationRequired() && !user.isVerified()) {
            throw new IllegalStateException(
                    "Confirmă adresa de email înainte de autentificare. Verifică mesajul primit la înregistrare.");
        }
        String token = jwtService.generateToken(user);
        String role = JwtService.primaryRole(user.getRoles());
        return new JwtResponse(token, "Bearer", user.getId(), user.getUsername(), user.getEmail(), role);
    }

    @Transactional
    public ApiResponse register(RegisterRequest req) {
        if (userRepository.findByUsername(req.username()).isPresent()) {
            throw new IllegalArgumentException("Numele de utilizator există deja");
        }
        if (userRepository.findByEmail(req.email()).isPresent()) {
            throw new IllegalArgumentException("Email-ul este deja folosit");
        }
        Set<String> roles = new HashSet<>();
        String accountType = req.accountType() != null ? req.accountType() : "client";
        if ("vendor".equalsIgnoreCase(accountType)) {
            roles.add("ROLE_VENDOR");
        } else {
            roles.add("ROLE_CLIENT");
        }
        boolean verified = !appProperties.isEmailConfirmationRequired();
        String token = verified ? null : UUID.randomUUID().toString();
        Instant expiry = verified ? null : Instant.now().plus(2, ChronoUnit.DAYS);
        User user = Objects.requireNonNull(User.builder()
                .username(req.username())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .firstName(req.firstName())
                .lastName(req.lastName())
                .verified(verified)
                .verificationToken(token)
                .tokenExpiry(expiry)
                .roles(roles)
                .build());
        userRepository.save(user);
        if (!verified && token != null) {
            emailService.sendConfirmationEmail(user, token);
        }
        return ApiResponse.ok("Înregistrare reușită. " + (verified ? "Vă puteți autentifica." : "Verificați email-ul pentru confirmare."));
    }

    @Transactional
    public ApiResponse confirmEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token lipsă");
        }
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token invalid sau expirat"));
        if (user.getTokenExpiry() != null && user.getTokenExpiry().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token expirat");
        }
        user.setVerified(true);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        return ApiResponse.ok("Email confirmat. Vă puteți autentifica.");
    }

    @Transactional
    public ApiResponse promoteAdmin(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Utilizator inexistent"));
        user.getRoles().add("ROLE_ADMIN");
        return ApiResponse.ok("Utilizator promovat administrator.");
    }

    public User requireUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Utilizator inexistent"));
    }
}
