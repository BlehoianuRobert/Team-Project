package com.onlinerental.service;

import com.onlinerental.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final AppProperties appProperties;

    public Map<String, Object> storeImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return Map.of("success", false, "message", "Fișier lipsă", "imageUrl", null);
        }
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        if (!ext.matches("(?i)\\.(jpg|jpeg|png|gif|webp)")) {
            return Map.of(
                    "success",
                    false,
                    "message",
                    "Tip fișier neacceptat. Folosiți JPG, JPEG, PNG, GIF sau WEBP (pe iPhone: setați cameră „Cele mai compatibile” sau exportați ca JPG înainte de încărcare).",
                    "imageUrl",
                    null
            );
        }
        String name = UUID.randomUUID() + ext.toLowerCase();
        Path dir = Path.of(appProperties.getUploadsDir()).resolve("images").toAbsolutePath().normalize();
        Files.createDirectories(dir);
        Path target = dir.resolve(name);
        file.transferTo(target.toFile());
        String url = "/images/" + name;
        return Map.of("success", true, "message", "OK", "imageUrl", url);
    }
}
