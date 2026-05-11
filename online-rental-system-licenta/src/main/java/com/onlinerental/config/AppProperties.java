package com.onlinerental.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private String frontendOrigin = "http://localhost:3001";
    private String publicBaseUrl = "http://localhost:8081";
    private String uploadsDir = "uploads";
    private boolean emailConfirmationRequired = false;
    private final Mail mail = new Mail();
    private final Stripe stripe = new Stripe();
    private final Ai ai = new Ai();

    @Getter
    @Setter
    public static class Jwt {
        private String secret = "";
        private long expirationMs = 86400000L;
    }

    @Getter
    @Setter
    public static class Stripe {
        private String secretKey = "";
    }

    @Getter
    @Setter
    public static class Mail {
        private String from = "noreply@online-rental.local";
    }

    @Getter
    @Setter
    public static class Ai {
        private String compareUrl = "";
        private String imageBaseUrl = "";
        private int connectTimeoutMs = 4000;
        private int readTimeoutMs = 12000;
        private double reviewThreshold = 0.4;
    }
}
