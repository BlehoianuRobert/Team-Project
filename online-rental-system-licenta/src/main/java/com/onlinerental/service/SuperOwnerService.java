package com.onlinerental.service;

import com.onlinerental.domain.InventoryStatus;
import com.onlinerental.domain.RentalStatus;
import com.onlinerental.repository.InventoryUnitRepository;
import com.onlinerental.repository.RentalRepository;
import com.onlinerental.web.dto.ProductFinancialStatsDto;
import com.onlinerental.web.dto.SuperOwnerStatisticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SuperOwnerService {

    private static final List<RentalStatus> INCOME_STATUSES = List.of(
            RentalStatus.CONFIRMED,
            RentalStatus.ACTIVE,
            RentalStatus.RETURNED,
            RentalStatus.COMPLETED
    );

    private final RentalRepository rentalRepository;
    private final InventoryUnitRepository inventoryUnitRepository;

    @Transactional(readOnly = true)
    public SuperOwnerStatisticsDto statistics() {
        var rentals = rentalRepository.findAllWithDetails();
        BigDecimal totalIncome = BigDecimal.ZERO;
        Map<Long, Agg> byProduct = new HashMap<>();

        for (var r : rentals) {
            if (!INCOME_STATUSES.contains(r.getStatus())) {
                continue;
            }
            totalIncome = totalIncome.add(r.getTotalPrice());
            var p = r.getInventory().getProduct();
            Agg a = byProduct.computeIfAbsent(p.getId(), k -> new Agg(
                        p.getName(), p.getCategory(), p.getBrand(), p.getModel()));
            a.rentalCount++;
            a.income = a.income.add(r.getTotalPrice());
        }

        Map<Long, int[]> invCounts = new HashMap<>();
        for (var u : inventoryUnitRepository.findAll()) {
            long pid = u.getProduct().getId();
            int[] c = invCounts.computeIfAbsent(pid, k -> new int[2]);
            if (u.getStatus() == InventoryStatus.MAINTENANCE) {
                c[0]++;
            } else if (u.getStatus() == InventoryStatus.LOST) {
                c[1]++;
            }
        }

        List<ProductFinancialStatsDto> products = byProduct.entrySet().stream().map(e -> {
            long pid = e.getKey();
            Agg a = e.getValue();
            int[] c = invCounts.getOrDefault(pid, new int[2]);
            BigDecimal expenses = BigDecimal.valueOf(c[0]).multiply(new BigDecimal("200"))
                    .add(BigDecimal.valueOf(c[1]).multiply(new BigDecimal("500")));
            BigDecimal net = a.income.subtract(expenses);
            return new ProductFinancialStatsDto(pid, a.name, a.category, a.brand, a.model,
                    a.rentalCount, a.income, expenses, net);
        }).toList();

        BigDecimal totalExpenses = products.stream()
                .map(ProductFinancialStatsDto::expenses)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal netProfit = totalIncome.subtract(totalExpenses);
        long totalRentals = products.stream().mapToLong(ProductFinancialStatsDto::rentalCount).sum();

        return new SuperOwnerStatisticsDto(totalIncome, totalExpenses, netProfit, totalRentals, products);
    }

    private static final class Agg {
        final String name;
        final String category;
        final String brand;
        final String model;
        long rentalCount;
        BigDecimal income = BigDecimal.ZERO;

        Agg(String name, String category, String brand, String model) {
            this.name = name;
            this.category = category;
            this.brand = brand;
            this.model = model;
        }
    }
}
