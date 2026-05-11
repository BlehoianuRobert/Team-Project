package com.onlinerental.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class MailTemplateService {

    private static final String CONFIRMATION_TEMPLATE_PATH = "mail/templates/confirmation-email.html";
    private static final String INVOICE_TEMPLATE_PATH = "mail/templates/invoice-email.html";
    private static final String RESERVATION_TEMPLATE_PATH = "mail/templates/reservation-created-email.html";

    public String renderConfirmationEmail(String username, String confirmUrl) {
        return renderTemplate(CONFIRMATION_TEMPLATE_PATH, Map.of(
                "username", username,
                "confirmUrl", confirmUrl
        ));
    }

    public String renderInvoiceEmail(String username, String rentalId, String transactionId, String totalPrice) {
        return renderTemplate(INVOICE_TEMPLATE_PATH, Map.of(
                "username", username,
                "rentalId", rentalId,
                "transactionId", transactionId,
                "totalPrice", totalPrice
        ));
    }

    public String renderReservationCreatedEmail(
            String username,
            String rentalId,
            String productName,
            String startDate,
            String endDate,
            String totalPrice
    ) {
        return renderTemplate(RESERVATION_TEMPLATE_PATH, Map.of(
                "username", username,
                "rentalId", rentalId,
                "productName", productName,
                "startDate", startDate,
                "endDate", endDate,
                "totalPrice", totalPrice
        ));
    }

    private String renderTemplate(String templatePath, Map<String, String> variables) {
        String html = loadTemplate(templatePath);
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            html = html.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return html;
    }

    private String loadTemplate(String templatePath) {
        try {
            ClassPathResource resource = new ClassPathResource(templatePath);
            byte[] content = resource.getInputStream().readAllBytes();
            return new String(content, StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("Cannot load email template: " + templatePath, ex);
        }
    }
}
