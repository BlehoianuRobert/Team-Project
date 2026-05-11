package com.onlinerental.web;

import com.onlinerental.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
public class UploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/image")
    @PreAuthorize("hasAnyRole('VENDOR','ADMIN','SUPEROWNER')")
    public Map<String, Object> upload(@RequestPart("file") MultipartFile file) throws IOException {
        return fileStorageService.storeImage(file);
    }
}
