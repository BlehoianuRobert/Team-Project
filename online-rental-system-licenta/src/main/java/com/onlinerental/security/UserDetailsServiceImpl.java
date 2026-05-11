package com.onlinerental.security;

import com.onlinerental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return toUserDetails(user);
    }

    public UserDetails loadUserByJwtSubject(String username) throws UsernameNotFoundException {
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return toUserDetails(user);
    }

    public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
        var user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return toUserDetails(user);
    }

    private UserDetails toUserDetails(com.onlinerental.domain.User user) {
        var authorities = user.getRoles().stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
        // Spring's `enabled` must not mirror email verification — unverified users would get
        // DisabledException and appear as "cannot log in". Verification is enforced in AuthService.login.
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                true,
                true,
                true,
                true,
                authorities
        );
    }
}
