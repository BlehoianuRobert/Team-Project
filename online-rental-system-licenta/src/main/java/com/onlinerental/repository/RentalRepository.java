package com.onlinerental.repository;

import com.onlinerental.domain.Rental;
import com.onlinerental.domain.RentalStatus;
import com.onlinerental.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    List<Rental> findByUserOrderByCreatedAtDesc(User user);

    @Query("""
            SELECT r FROM Rental r
            JOIN FETCH r.user u
            JOIN FETCH r.inventory i
            JOIN FETCH i.product p
            ORDER BY r.createdAt DESC
            """)
    List<Rental> findAllWithDetails();

    @Query("""
            SELECT r FROM Rental r
            JOIN FETCH r.user u
            JOIN FETCH r.inventory i
            JOIN FETCH i.product p
            WHERE r.id = :id
            """)
    java.util.Optional<Rental> findByIdWithDetails(@Param("id") Long id);

    @Query("""
            SELECT r FROM Rental r
            JOIN FETCH r.user u
            JOIN FETCH r.inventory i
            JOIN FETCH i.product p
            WHERE r.user = :user AND r.id = :id
            """)
    java.util.Optional<Rental> findByIdAndUserWithDetails(@Param("id") Long id, @Param("user") User user);

    List<Rental> findByInventoryProductIdAndStatusIn(Long productId, List<RentalStatus> statuses);

    java.util.Optional<Rental> findByStripePaymentIntentId(String stripePaymentIntentId);

    @Query("""
            SELECT r FROM Rental r
            JOIN FETCH r.user u
            JOIN FETCH r.inventory i
            JOIN FETCH i.product p
            WHERE p.owner = :owner
            ORDER BY r.createdAt DESC
            """)
    List<Rental> findByProductOwnerWithDetails(@Param("owner") User owner);

    @Query("""
            SELECT COUNT(r) FROM Rental r
            WHERE r.inventory.id = :inventoryId
            AND r.status IN :blockingStatuses
            AND r.startDate <= :rangeEnd
            AND r.endDate >= :rangeStart
            """)
    long countBlockingRentalsOverlapping(
            @Param("inventoryId") Long inventoryId,
            @Param("rangeStart") LocalDate rangeStart,
            @Param("rangeEnd") LocalDate rangeEnd,
            @Param("blockingStatuses") Collection<RentalStatus> blockingStatuses);
}
