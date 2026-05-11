package com.onlinerental.web;

import com.onlinerental.service.AuthService;
import com.onlinerental.web.dto.ApiResponse;
import com.onlinerental.web.dto.JwtResponse;
import com.onlinerental.web.dto.LoginRequest;
import com.onlinerental.web.dto.RegisterRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public JwtResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/register")
    public ApiResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @GetMapping("/confirm")
    public ApiResponse confirm(@RequestParam String token) {
        return authService.confirmEmail(token);
    }

    @PostMapping("/promote-admin")
    @PreAuthorize("hasRole('SUPEROWNER')")
    public ApiResponse promoteAdmin(@RequestParam String username) {
        return authService.promoteAdmin(username);
    }
}
