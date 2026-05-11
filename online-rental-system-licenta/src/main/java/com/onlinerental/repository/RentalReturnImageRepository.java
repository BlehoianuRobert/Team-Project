package com.onlinerental.repository;

import com.onlinerental.domain.RentalReturnImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface RentalReturnImageRepository extends JpaRepository<RentalReturnImage, Long> {
    List<RentalReturnImage> findByRentalIdOrderByCreatedAtDesc(Long rentalId);

    long countByRentalId(Long rentalId);

    boolean existsByRentalIdAndCreatedAtAfter(Long rentalId, Instant createdAt);
}
