package com.onlinerental.web;

import com.onlinerental.service.UserService;
import com.onlinerental.web.dto.ProfilePatchRequest;
import com.onlinerental.web.dto.ProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.onlinerental.web.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @GetMapping("/profile")
    public ProfileResponse getProfile(@AuthenticationPrincipal UserDetails principal) {
        return userService.getProfile(principal.getUsername());
    }

    @PatchMapping("/profile")
    public ProfileResponse patchProfile(
            @RequestBody ProfilePatchRequest req,
            @AuthenticationPrincipal UserDetails principal
    ) {
        return userService.patchProfile(principal.getUsername(), req);
    }

    @DeleteMapping("/profile")
    public ApiResponse deleteOwnAccount(@AuthenticationPrincipal UserDetails principal) {
        return userService.deleteOwnAccount(principal.getUsername());
    }
}
