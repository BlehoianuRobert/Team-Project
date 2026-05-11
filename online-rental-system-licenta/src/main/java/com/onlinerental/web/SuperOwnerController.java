package com.onlinerental.web;

import com.onlinerental.service.SuperOwnerService;
import com.onlinerental.web.dto.SuperOwnerStatisticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/superowner")
@RequiredArgsConstructor
public class SuperOwnerController {

    private final SuperOwnerService superOwnerService;

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('SUPEROWNER')")
    public SuperOwnerStatisticsDto statistics() {
        return superOwnerService.statistics();
    }
}
