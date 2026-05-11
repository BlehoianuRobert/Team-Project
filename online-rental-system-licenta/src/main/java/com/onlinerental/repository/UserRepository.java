package com.onlinerental.repository;

import com.onlinerental.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByUsernameIgnoreCaseOrEmailIgnoreCase(String username, String email);

    Optional<User> findByEmail(String email);

    Optional<User> findByVerificationToken(String token);
}
