package com.onlinerental.security;

import com.onlinerental.config.AppProperties;
import com.onlinerental.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final AppProperties appProperties;
    private SecretKey signingKey;

    @PostConstruct
    void init() {
        String secret = appProperties.getJwt().getSecret();
        StringBuilder sb = new StringBuilder(secret);
        while (sb.length() < 32) {
            sb.append(secret);
        }
        byte[] keyBytes = sb.substring(0, 32).getBytes(StandardCharsets.UTF_8);
        signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + appProperties.getJwt().getExpirationMs());
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("uid", user.getId())
                .issuedAt(now)
                .expiration(exp)
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static String primaryRole(Set<String> roles) {
        if (roles.contains("ROLE_SUPEROWNER")) {
            return "ROLE_SUPEROWNER";
        }
        if (roles.contains("ROLE_ADMIN")) {
            return "ROLE_ADMIN";
        }
        if (roles.contains("ROLE_VENDOR")) {
            return "ROLE_VENDOR";
        }
        return "ROLE_CLIENT";
    }
}
