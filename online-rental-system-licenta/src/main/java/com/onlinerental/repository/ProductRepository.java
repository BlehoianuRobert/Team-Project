package com.onlinerental.repository;

import com.onlinerental.domain.Product;
import com.onlinerental.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByOwner(User owner);

    @Query("""
            SELECT DISTINCT p FROM Product p
            WHERE (:category IS NULL OR p.category = :category)
            AND (:brand IS NULL OR p.brand = :brand)
            AND (:model IS NULL OR p.model = :model)
            AND (:weightMin IS NULL OR p.weightKg IS NULL OR p.weightKg >= :weightMin)
            AND (:weightMax IS NULL OR p.weightKg IS NULL OR p.weightKg <= :weightMax)
            AND (:thicknessMin IS NULL OR p.thicknessMm IS NULL OR p.thicknessMm >= :thicknessMin)
            AND (:thicknessMax IS NULL OR p.thicknessMm IS NULL OR p.thicknessMm <= :thicknessMax)
            AND (:color IS NULL OR COALESCE(p.colorDetected, '') ILIKE CONCAT('%', CAST(:color AS string), '%'))
            AND (
                :search IS NULL
                OR p.name ILIKE CONCAT('%', CAST(:search AS string), '%')
                OR COALESCE(p.aiTags, '') ILIKE CONCAT('%', CAST(:search AS string), '%')
                OR COALESCE(p.detectedBrand, p.brand, '') ILIKE CONCAT('%', CAST(:search AS string), '%')
                OR COALESCE(p.detectedModel, p.model, '') ILIKE CONCAT('%', CAST(:search AS string), '%')
            )
            ORDER BY p.createdAt DESC
            """)
    List<Product> findWithFilters(
            @Param("category") String category,
            @Param("brand") String brand,
            @Param("model") String model,
            @Param("weightMin") java.math.BigDecimal weightMin,
            @Param("weightMax") java.math.BigDecimal weightMax,
            @Param("thicknessMin") java.math.BigDecimal thicknessMin,
            @Param("thicknessMax") java.math.BigDecimal thicknessMax,
            @Param("color") String color,
            @Param("search") String search
    );

    @Query("SELECT DISTINCT p.category FROM Product p ORDER BY p.category")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE (:category IS NULL OR p.category = :category) AND p.brand IS NOT NULL ORDER BY p.brand")
    List<String> findDistinctBrands(@Param("category") String category);

    @Query("""
            SELECT DISTINCT p.model FROM Product p
            WHERE (:category IS NULL OR p.category = :category)
            AND (:brand IS NULL OR p.brand = :brand)
            AND p.model IS NOT NULL
            ORDER BY p.model
            """)
    List<String> findDistinctModels(@Param("category") String category, @Param("brand") String brand);
}
