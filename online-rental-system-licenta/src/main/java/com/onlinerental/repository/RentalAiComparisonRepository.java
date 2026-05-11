package com.onlinerental.repository;

import com.onlinerental.domain.RentalAiComparison;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RentalAiComparisonRepository extends JpaRepository<RentalAiComparison, Long> {
    List<RentalAiComparison> findByRentalIdOrderByCreatedAtDesc(Long rentalId);

    Optional<RentalAiComparison> findFirstByRentalIdOrderByCreatedAtDesc(Long rentalId);
}
