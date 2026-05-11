package com.onlinerental.service;

import com.onlinerental.config.AppProperties;
import com.onlinerental.domain.Rental;
import com.onlinerental.domain.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final AppProperties appProperties;
    private final MailTemplateService mailTemplateService;

    @SuppressWarnings("null")
    public void sendConfirmationEmail(User user, String token) {
        String baseUrl = appProperties.getPublicBaseUrl();
        String confirmUrl = (baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl)
                + "/api/v1/auth/confirm?token=" + token;

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender indisponibil. Link confirmare pentru {}: {}", user.getEmail(), confirmUrl);
            return;
        }

        try {
            @SuppressWarnings("null")
            var mime = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(requiredValue(appProperties.getMail().getFrom(), "APP_MAIL_FROM"));
            helper.setTo(requiredValue(user.getEmail(), "user email"));
            helper.setSubject("Confirmare cont - Online Rental System");
            helper.setText(buildConfirmationEmailHtml(user.getUsername(), confirmUrl), true);
            helper.addInline("appLogo", new ClassPathResource("mail/logo-horizontal.svg"), "image/svg+xml");
            mailSender.send(mime);
        } catch (Exception ex) {
            log.warn("Nu s-a putut trimite emailul de confirmare către {}: {}. Link: {}",
                    user.getEmail(), ex.getMessage(), confirmUrl);
        }
    }

    @SuppressWarnings("null")
    public boolean sendPaymentInvoiceEmail(User user, Rental rental, String transactionId, byte[] invoicePdf) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender indisponibil. Factura pentru {} nu a fost trimisă.", user.getEmail());
            return false;
        }
        try {
            @SuppressWarnings("null")
            var mime = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(requiredValue(appProperties.getMail().getFrom(), "APP_MAIL_FROM"));
            helper.setTo(requiredValue(user.getEmail(), "user email"));
            helper.setSubject("Confirmare plată + factură");
            helper.setText(
                    buildInvoiceEmailHtml(
                            user.getUsername(),
                            rental.getId(),
                            transactionId,
                            rental.getTotalPrice().toPlainString()
                    ),
                    true
            );
            helper.addInline("appLogo", new ClassPathResource("mail/logo-horizontal.svg"), "image/svg+xml");
            if (invoicePdf != null && invoicePdf.length > 0) {
                helper.addAttachment(
                        "invoice-" + rental.getId() + ".pdf",
                        new ByteArrayResource(invoicePdf),
                        "application/pdf"
                );
            }
            mailSender.send(mime);
            log.info("Factura trimisă către {} pentru rental #{}", user.getEmail(), rental.getId());
            return true;
        } catch (Exception ex) {
            log.warn("Nu s-a putut trimite factura către {} pentru rental #{}",
                    user.getEmail(), rental.getId(), ex);
            return false;
        }
    }

    @SuppressWarnings("null")
    public void sendReservationCreatedEmail(User user, Rental rental) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender indisponibil. Confirmarea rezervării pentru {} nu a fost trimisă.", user.getEmail());
            return;
        }
        try {
            @SuppressWarnings("null")
            var mime = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(requiredValue(appProperties.getMail().getFrom(), "APP_MAIL_FROM"));
            helper.setTo(requiredValue(user.getEmail(), "user email"));
            helper.setSubject("Rezervare creată - Online Rental System");
            helper.setText(
                    buildReservationCreatedEmailHtml(
                            user.getUsername(),
                            rental.getId(),
                            rental.getInventory().getProduct().getName(),
                            rental.getStartDate().toString(),
                            rental.getEndDate().toString(),
                            rental.getTotalPrice().toPlainString()
                    ),
                    true
            );
            helper.addInline("appLogo", new ClassPathResource("mail/logo-horizontal.svg"), "image/svg+xml");
            mailSender.send(mime);
        } catch (Exception ex) {
            log.warn("Nu s-a putut trimite confirmarea rezervării către {}: {}", user.getEmail(), ex.getMessage());
        }
    }

    private String buildConfirmationEmailHtml(String username, String confirmUrl) {
        return mailTemplateService.renderConfirmationEmail(
                escapeHtml(username),
                escapeHtml(confirmUrl)
        );
    }

    private String buildInvoiceEmailHtml(String username, Long rentalId, String transactionId, String totalPrice) {
        return mailTemplateService.renderInvoiceEmail(
                escapeHtml(username),
                String.valueOf(rentalId),
                escapeHtml(transactionId),
                escapeHtml(totalPrice)
        );
    }

    private String buildReservationCreatedEmailHtml(
            String username,
            Long rentalId,
            String productName,
            String startDate,
            String endDate,
            String totalPrice
    ) {
        return mailTemplateService.renderReservationCreatedEmail(
                escapeHtml(username),
                String.valueOf(rentalId),
                escapeHtml(productName),
                escapeHtml(startDate),
                escapeHtml(endDate),
                escapeHtml(totalPrice)
        );
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String requiredValue(String value, String field) {
        return Objects.requireNonNull(value, field + " must not be null");
    }
}

