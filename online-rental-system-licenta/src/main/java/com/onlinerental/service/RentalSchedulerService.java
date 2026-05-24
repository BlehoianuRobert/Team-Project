package com.onlinerental.service;

import com.onlinerental.domain.RentalStatus;
import com.onlinerental.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RentalSchedulerService {

    private final RentalRepository rentalRepository;

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void markOverdueRentals() {
        LocalDate today = LocalDate.now();
        List<com.onlinerental.domain.Rental> overdue = rentalRepository
                .findByStatusAndEndDateBefore(RentalStatus.ACTIVE, today);
        if (overdue.isEmpty()) {
            return;
        }
        overdue.forEach(r -> {
            r.setStatus(RentalStatus.OVERDUE);
            log.info("Rental {} marked OVERDUE (end date: {})", r.getId(), r.getEndDate());
        });
        log.info("Marked {} rentals as OVERDUE", overdue.size());
    }
}