package com.onlinerental.web;

import com.onlinerental.service.UserService;
import com.onlinerental.web.dto.ApiResponse;
import com.onlinerental.web.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('SUPEROWNER')")
    public List<UserResponse> listUsers() {
        return userService.listAll();
    }

    @PostMapping("/users/{username}/promote-superowner")
    @PreAuthorize("hasRole('SUPEROWNER')")
    public ApiResponse promoteSuperOwner(@PathVariable String username) {
        return userService.promoteSuperOwner(username);
    }
}
