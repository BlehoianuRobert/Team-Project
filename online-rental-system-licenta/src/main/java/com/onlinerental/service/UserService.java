package com.onlinerental.service;

import com.onlinerental.domain.User;
import com.onlinerental.repository.UserRepository;
import com.onlinerental.web.dto.ApiResponse;
import com.onlinerental.web.dto.ProfilePatchRequest;
import com.onlinerental.web.dto.ProfileResponse;
import com.onlinerental.web.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public ProfileResponse getProfile(String username) {
        User u = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Utilizator inexistent"));
        return toProfile(u);
    }

    @Transactional
    public ProfileResponse patchProfile(String username, ProfilePatchRequest req) {
        User u = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Utilizator inexistent"));
        if (req.firstName() != null && !req.firstName().isBlank()) {
            u.setFirstName(req.firstName().trim());
        }
        if (req.lastName() != null && !req.lastName().isBlank()) {
            u.setLastName(req.lastName().trim());
        }
        if (req.addressLine1() != null) {
            u.setAddressLine1(blankToNull(req.addressLine1()));
        }
        if (req.addressLine2() != null) {
            u.setAddressLine2(blankToNull(req.addressLine2()));
        }
        if (req.city() != null) {
            u.setCity(blankToNull(req.city()));
        }
        if (req.postalCode() != null) {
            u.setPostalCode(blankToNull(req.postalCode()));
        }
        if (req.country() != null) {
            u.setCountry(blankToNull(req.country()));
        }
        if (req.phone() != null) {
            u.setPhone(blankToNull(req.phone()));
        }
        if (req.billingFullName() != null) {
            u.setBillingFullName(blankToNull(req.billingFullName()));
        }
        return toProfile(u);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private ProfileResponse toProfile(User u) {
        return new ProfileResponse(
                u.getUsername(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.getAddressLine1(),
                u.getAddressLine2(),
                u.getCity(),
                u.getPostalCode(),
                u.getCountry(),
                u.getPhone(),
                u.getBillingFullName()
        );
    }

    public List<UserResponse> listAll() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getUsername))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ApiResponse promoteSuperOwner(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Utilizator inexistent"));
        user.getRoles().add("ROLE_SUPEROWNER");
        user.getRoles().add("ROLE_ADMIN");
        return ApiResponse.ok("Utilizator promovat super owner.");
    }

    @Transactional
    public ApiResponse deleteOwnAccount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Utilizator inexistent"));
        userRepository.delete(user);
        return ApiResponse.ok("Contul tău a fost șters definitiv.");
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.isVerified(),
                u.getRoles().stream().sorted().toList()
        );
    }
}
