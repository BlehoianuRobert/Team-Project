package com.onlinerental.repository;

import com.onlinerental.domain.HandoverStage;
import com.onlinerental.domain.RentalHandoverSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RentalHandoverSessionRepository extends JpaRepository<RentalHandoverSession, Long> {
    List<RentalHandoverSession> findByRentalIdOrderByStartedAtDesc(Long rentalId);

    Optional<RentalHandoverSession> findTopByRentalIdAndStageOrderByStartedAtDesc(Long rentalId, HandoverStage stage);
}

