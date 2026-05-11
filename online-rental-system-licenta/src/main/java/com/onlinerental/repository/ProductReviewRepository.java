package com.onlinerental.repository;

import com.onlinerental.domain.Product;
import com.onlinerental.domain.ProductReview;
import com.onlinerental.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    @Query("""
            SELECT r FROM ProductReview r
            JOIN FETCH r.user u
            WHERE r.product = :product
            ORDER BY r.createdAt DESC
            """)
    List<ProductReview> findByProductOrderByCreatedAtDesc(@Param("product") Product product);

    Optional<ProductReview> findByProductAndUser(Product product, User user);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM ProductReview r WHERE r.product.id = :productId")
    Double averageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM ProductReview r WHERE r.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);
}
