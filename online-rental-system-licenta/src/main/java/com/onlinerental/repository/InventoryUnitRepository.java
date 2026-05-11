package com.onlinerental.repository;

import com.onlinerental.domain.InventoryStatus;
import com.onlinerental.domain.InventoryUnit;
import com.onlinerental.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryUnitRepository extends JpaRepository<InventoryUnit, Long> {

    List<InventoryUnit> findByProduct(Product product);

    List<InventoryUnit> findByProductAndStatus(Product product, InventoryStatus status);

    boolean existsByProductIdAndSerialNumber(Long productId, String serialNumber);
}
