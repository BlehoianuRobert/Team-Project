package com.onlinerental.repository;

import com.onlinerental.domain.HandoverStage;
import com.onlinerental.domain.RentalPhotoVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RentalPhotoVerificationRepository extends JpaRepository<RentalPhotoVerification, Long> {
    Optional<RentalPhotoVerification> findTopByRentalIdOrderByCreatedAtDesc(Long rentalId);

    Optional<RentalPhotoVerification> findTopByRentalIdAndStageOrderByCreatedAtDesc(Long rentalId, HandoverStage stage);
}

