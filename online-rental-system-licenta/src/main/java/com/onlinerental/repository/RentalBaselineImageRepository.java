package com.onlinerental.repository;

import com.onlinerental.domain.RentalBaselineImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalBaselineImageRepository extends JpaRepository<RentalBaselineImage, Long> {
    List<RentalBaselineImage> findByRentalIdOrderByCreatedAtDesc(Long rentalId);

    long countByRentalId(Long rentalId);
}
