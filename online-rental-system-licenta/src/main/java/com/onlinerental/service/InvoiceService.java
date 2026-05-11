package com.onlinerental.service;

import com.onlinerental.domain.Product;
import com.onlinerental.domain.Rental;
import com.onlinerental.domain.User;
import com.onlinerental.util.PricingUtil;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

@Service
public class InvoiceService {

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")
            .withZone(ZoneId.systemDefault());
    private static final DateTimeFormatter DATE_ONLY = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    private static final float M = 48f;
    private static final float HEADER_H = 86f;
    private static final int BLUE = 0;
    private static final int SLATE = 1;
    private static final int MUTED = 2;

    public byte[] generateInvoicePdf(Rental rental, String transactionId) {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            float pageW = page.getMediaBox().getWidth();
            float pageH = page.getMediaBox().getHeight();

            Product product = rental.getInventory().getProduct();
            User customer = rental.getUser();
            int days = PricingUtil.rentalDaysInclusive(rental.getStartDate(), rental.getEndDate());
            PriceLines lines = computePriceLines(product, days, rental.getTotalPrice());

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                drawHeaderBand(cs, pageW, pageH, rental.getId());
                float y = pageH - HEADER_H - 28f;

                y = drawTwoColumnBlock(cs, pageW, y, customer, rental, transactionId);
                y -= 8f;
                y = drawSectionTitle(cs, M, y, "Detalii inchiriere / Rental details");
                y -= 6f;
                y = drawLineItemsTable(cs, pageW, y, product, days, lines);
                y -= 24f;
                y = drawTotals(cs, pageW, y, lines);
                y -= 36f;
                drawFooter(cs, pageW, M, y, transactionId);
            }

            document.save(out);
            return out.toByteArray();
        } catch (IOException ex) {
            return new byte[0];
        }
    }

    private static void drawHeaderBand(PDPageContentStream cs, float pageW, float pageH, long rentalId) throws IOException {
        float top = pageH;
        float bottom = pageH - HEADER_H;
        setFill(cs, BLUE);
        cs.addRect(0, bottom, pageW, HEADER_H);
        cs.fill();

        cs.setNonStrokingColor(1f, 1f, 1f);
        drawText(cs, PDType1Font.HELVETICA_BOLD, 20, M, top - 36f, "FACTURA / INVOICE");
        drawText(cs, PDType1Font.HELVETICA, 10, M, top - 58f, "Online Rental System");
        String invNo = "Nr. INV-" + rentalId;
        float invW = PDType1Font.HELVETICA_BOLD.getStringWidth(invNo) / 1000f * 11f;
        drawText(cs, PDType1Font.HELVETICA_BOLD, 11, pageW - M - invW, top - 44f, invNo);
        cs.setNonStrokingColor(0f, 0f, 0f);
    }

    private float drawTwoColumnBlock(
            PDPageContentStream cs,
            float pageW,
            float y,
            User customer,
            Rental rental,
            String transactionId
    ) throws IOException {
        float colW = (pageW - 2 * M - 24f) / 2f;
        float leftX = M;
        float rightX = M + colW + 24f;

        drawSectionTitle(cs, leftX, y, "Furnizor / Supplier");
        float yL = y - 14f;
        yL = drawMultiline(cs, leftX, yL, 9f, colW,
                "Online Rental System",
                "Platforma de inchirieri online",
                "contact@online-rental.local");

        drawSectionTitle(cs, rightX, y, "Client / Bill to");
        float yR = y - 14f;
        String name = safe(customer.getFirstName() + " " + customer.getLastName());
        yR = drawMultiline(cs, rightX, yR, 9f, colW,
                name,
                safe(customer.getEmail()),
                "Utilizator: " + safe(customer.getUsername()));

        float yMin = Math.min(yL, yR) - 8f;
        hLine(cs, M, pageW - M, yMin, SLATE);
        yMin -= 10f;

        drawLabelValue(cs, leftX, yMin, "ID inchiriere:", String.valueOf(rental.getId()));
        drawLabelValue(cs, rightX, yMin, "Data emiterii:", DATE_TIME.format(rental.getCreatedAt()));
        yMin -= 12f;
        drawLabelValue(cs, leftX, yMin, "Perioada:",
                rental.getStartDate().format(DATE_ONLY) + " - " + rental.getEndDate().format(DATE_ONLY));
        drawLabelValue(cs, rightX, yMin, "Tranzactie Stripe:", truncate(transactionId, 42));
        return yMin - 16f;
    }

    private float drawLineItemsTable(
            PDPageContentStream cs,
            float pageW,
            float y,
            Product product,
            int days,
            PriceLines lines
    ) throws IOException {
        float x0 = M;
        float x1 = M + 220f;
        float x2 = M + 290f;
        float x3 = M + 380f;
        float x4 = pageW - M;

        float headerY = y;
        setFill(cs, SLATE);
        cs.addRect(x0, headerY - 18f, x4 - x0, 18f);
        cs.fill();
        setFill(cs, -1);
        drawText(cs, PDType1Font.HELVETICA_BOLD, 9, x0 + 6f, headerY - 6f, "Descriere");
        drawText(cs, PDType1Font.HELVETICA_BOLD, 9, x1, headerY - 6f, "Zile");
        drawText(cs, PDType1Font.HELVETICA_BOLD, 9, x2, headerY - 6f, "Pret/zi");
        drawText(cs, PDType1Font.HELVETICA_BOLD, 9, x3, headerY - 6f, "Reducere");
        drawRightText(cs, PDType1Font.HELVETICA_BOLD, 9, x4 - 6f, headerY - 6f, "Valoare (RON)");

        y = headerY - 26f;
        hLine(cs, x0, x4, y + 4f, MUTED);

        String desc = safe(product.getName());
        if (product.getBrand() != null && !product.getBrand().isBlank()) {
            desc += " (" + safe(product.getBrand()) + " " + safe(nullToEmpty(product.getModel())) + ")";
        }
        drawText(cs, PDType1Font.HELVETICA, 9, x0 + 6f, y, truncate(desc, 52));
        drawText(cs, PDType1Font.HELVETICA, 9, x1, y, String.valueOf(days));
        drawText(cs, PDType1Font.HELVETICA, 9, x2, y, formatMoney(lines.dailyPrice));
        drawText(cs, PDType1Font.HELVETICA, 9, x3, y, lines.productDiscountPercent.compareTo(BigDecimal.ZERO) > 0
                ? formatMoney(lines.productDiscountPercent) + "%"
                : "-");
        drawRightText(cs, PDType1Font.HELVETICA, 9, x4 - 6f, y, formatMoney(lines.subtotalAfterProductDiscount));

        y -= 22f;
        hLine(cs, x0, x4, y + 8f, MUTED);
        return y;
    }

    private float drawTotals(PDPageContentStream cs, float pageW, float y, PriceLines lines) throws IOException {
        float xLabel = pageW - M - 200f;
        float xVal = pageW - M - 6f;

        if (lines.productDiscountAmount.compareTo(BigDecimal.ZERO) > 0) {
            drawText(cs, PDType1Font.HELVETICA, 9, xLabel, y, "Subtotal inainte de reduceri:");
            drawRightText(cs, PDType1Font.HELVETICA, 9, xVal, y, formatMoney(lines.subtotalRaw));
            y -= 14f;
            drawText(cs, PDType1Font.HELVETICA, 9, xLabel, y, "Reducere produs:");
            drawRightText(cs, PDType1Font.HELVETICA, 9, xVal, y, "-" + formatMoney(lines.productDiscountAmount));
            y -= 14f;
        }
        if (lines.durationDiscount.compareTo(BigDecimal.ZERO) > 0) {
            drawText(cs, PDType1Font.HELVETICA, 9, xLabel, y, "Reducere durata inchiriere:");
            drawRightText(cs, PDType1Font.HELVETICA, 9, xVal, y, "-" + formatMoney(lines.durationDiscount));
            y -= 14f;
        }

        y -= 6f;
        hLine(cs, xLabel - 10f, xVal, y + 4f, SLATE);
        y -= 4f;
        drawText(cs, PDType1Font.HELVETICA_BOLD, 12, xLabel, y - 10f, "TOTAL PLATA (RON)");
        drawRightText(cs, PDType1Font.HELVETICA_BOLD, 12, xVal, y - 10f, formatMoney(lines.total));
        y -= 28f;

        cs.setNonStrokingColor(0.35f, 0.38f, 0.42f);
        drawText(cs, PDType1Font.HELVETICA_OBLIQUE, 8, M, y, "Garantie retinuta (informativ): " + formatMoney(lines.depositHint) + " RON");
        cs.setNonStrokingColor(0f, 0f, 0f);
        return y;
    }

    private void drawFooter(PDPageContentStream cs, float pageW, float x, float y, String transactionId) throws IOException {
        hLine(cs, x, pageW - x, y, SLATE);
        y -= 14f;
        cs.setNonStrokingColor(0.35f, 0.38f, 0.42f);
        drawText(cs, PDType1Font.HELVETICA_OBLIQUE, 8, x, y,
                "Plata procesata in siguranta prin Stripe. Pastrati acest document ca dovada.");
        y -= 12f;
        drawText(cs, PDType1Font.HELVETICA_OBLIQUE, 7, x, y, "ID plata: " + truncate(safe(transactionId), 80));
        cs.setNonStrokingColor(0f, 0f, 0f);
    }

    private static float drawSectionTitle(PDPageContentStream cs, float x, float y, String title) throws IOException {
        cs.setNonStrokingColor(0.11f, 0.27f, 0.42f);
        drawText(cs, PDType1Font.HELVETICA_BOLD, 10, x, y, safe(title));
        cs.setNonStrokingColor(0f, 0f, 0f);
        return y;
    }

    private static float drawMultiline(PDPageContentStream cs, float x, float y, float fontSize, float maxW, String... lines)
            throws IOException {
        for (String line : lines) {
            if (line == null || line.isBlank()) {
                continue;
            }
            String t = truncate(safe(line), 48);
            drawText(cs, PDType1Font.HELVETICA, fontSize, x, y, t);
            y -= fontSize + 3f;
        }
        return y;
    }

    private static void drawLabelValue(PDPageContentStream cs, float x, float y, String label, String value)
            throws IOException {
        drawText(cs, PDType1Font.HELVETICA_BOLD, 8, x, y, safe(label));
        drawText(cs, PDType1Font.HELVETICA, 8, x + 118f, y, safe(value));
    }

    private static void drawText(PDPageContentStream cs, PDType1Font font, float size, float x, float y, String text)
            throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
    }

    private static void drawRightText(PDPageContentStream cs, PDType1Font font, float size, float rightX, float y, String text)
            throws IOException {
        float w = font.getStringWidth(text) / 1000f * size;
        drawText(cs, font, size, rightX - w, y, text);
    }

    private static void hLine(PDPageContentStream cs, float x1, float x2, float y, int colorIdx) throws IOException {
        setStroking(cs, colorIdx);
        cs.setLineWidth(0.6f);
        cs.moveTo(x1, y);
        cs.lineTo(x2, y);
        cs.stroke();
        setStroking(cs, -1);
    }

    private static void setFill(PDPageContentStream cs, int idx) throws IOException {
        switch (idx) {
            case BLUE -> cs.setNonStrokingColor(0.11f, 0.27f, 0.42f);
            case SLATE -> cs.setNonStrokingColor(0.86f, 0.89f, 0.93f);
            case MUTED -> cs.setNonStrokingColor(0.45f, 0.48f, 0.52f);
            default -> cs.setNonStrokingColor(0f, 0f, 0f);
        }
    }

    private static void setStroking(PDPageContentStream cs, int idx) throws IOException {
        switch (idx) {
            case BLUE -> cs.setStrokingColor(0.11f, 0.27f, 0.42f);
            case SLATE -> cs.setStrokingColor(0.75f, 0.78f, 0.82f);
            case MUTED -> cs.setStrokingColor(0.82f, 0.84f, 0.88f);
            default -> cs.setStrokingColor(0f, 0f, 0f);
        }
    }

    private static String safe(String s) {
        if (s == null) {
            return "";
        }
        String n = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        StringBuilder b = new StringBuilder();
        for (int i = 0; i < n.length(); i++) {
            char c = n.charAt(i);
            if (c >= 32 && c <= 126) {
                b.append(c);
            } else {
                b.append('?');
            }
        }
        return b.toString();
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private static String truncate(String s, int max) {
        if (s.length() <= max) {
            return s;
        }
        return s.substring(0, max - 1) + ".";
    }

    private static String formatMoney(BigDecimal v) {
        return v.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private static PriceLines computePriceLines(Product product, int days, BigDecimal totalCharged) {
        BigDecimal daily = product.getDailyPrice();
        BigDecimal subtotalRaw = daily.multiply(BigDecimal.valueOf(days)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal pd = product.getDiscountPercent() != null ? product.getDiscountPercent() : BigDecimal.ZERO;
        BigDecimal productDiscountAmount = BigDecimal.ZERO;
        if (pd.compareTo(BigDecimal.ZERO) > 0) {
            productDiscountAmount = subtotalRaw.multiply(pd).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        BigDecimal afterProduct = subtotalRaw.subtract(productDiscountAmount);
        BigDecimal durationRate = BigDecimal.ZERO;
        if (days > 30) {
            durationRate = new BigDecimal("0.20");
        } else if (days > 7) {
            durationRate = new BigDecimal("0.10");
        }
        BigDecimal durationDiscount = afterProduct.multiply(durationRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal computedTotal = afterProduct.subtract(durationDiscount).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = totalCharged != null ? totalCharged.setScale(2, RoundingMode.HALF_UP) : computedTotal;
        BigDecimal depositHint = PricingUtil.depositFor(total);
        return new PriceLines(
                daily.setScale(2, RoundingMode.HALF_UP),
                pd.setScale(2, RoundingMode.HALF_UP),
                subtotalRaw,
                productDiscountAmount,
                afterProduct.setScale(2, RoundingMode.HALF_UP),
                durationDiscount,
                total,
                depositHint
        );
    }

    private record PriceLines(
            BigDecimal dailyPrice,
            BigDecimal productDiscountPercent,
            BigDecimal subtotalRaw,
            BigDecimal productDiscountAmount,
            BigDecimal subtotalAfterProductDiscount,
            BigDecimal durationDiscount,
            BigDecimal total,
            BigDecimal depositHint
    ) {
    }
}
