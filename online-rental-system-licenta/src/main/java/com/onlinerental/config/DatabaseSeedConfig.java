package com.onlinerental.config;

import com.onlinerental.domain.InventoryStatus;
import com.onlinerental.domain.InventoryUnit;
import com.onlinerental.domain.Product;
import com.onlinerental.domain.User;
import com.onlinerental.repository.InventoryUnitRepository;
import com.onlinerental.repository.ProductRepository;
import com.onlinerental.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class DatabaseSeedConfig {

    private static final String SEED_EMAIL = "Robert_blehoianu@yahoo.com";
    private static final String SEED_USERNAME = "Robert_blehoianu";
    private static final String SEED_PASSWORD = "12345678";

    @Bean
    CommandLineRunner seedDemoData(
            UserRepository userRepository,
            ProductRepository productRepository,
            InventoryUnitRepository inventoryUnitRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            User owner = userRepository.findByEmail(SEED_EMAIL).orElseGet(() -> {
                User u = User.builder()
                        .username(SEED_USERNAME)
                        .email(SEED_EMAIL)
                        .password(passwordEncoder.encode(SEED_PASSWORD))
                        .firstName("Robert")
                        .lastName("Blehoianu")
                        .verified(true)
                        .roles(new HashSet<>(Set.of(
                                "ROLE_CLIENT",
                                "ROLE_VENDOR",
                                "ROLE_ADMIN",
                                "ROLE_SUPEROWNER"
                        )))
                        .build();
                return userRepository.save(u);
            });

            if (productRepository.count() > 0) {
                return;
            }

            Product p1 = productRepository.save(Product.builder()
                    .owner(owner)
                    .name("Aparat foto DSLR")
                    .description("DSLR full-frame, potrivit pentru evenimente si vacante.")
                    .dailyPrice(new BigDecimal("85.00"))
                    .category("Electronice")
                    .brand("Canon")
                    .model("EOS R")
                    .discountPercent(BigDecimal.ZERO)
                    .build());

            Product p2 = productRepository.save(Product.builder()
                    .owner(owner)
                    .name("Laptop ultraportabil")
                    .description("Laptop 14 inch, 16GB RAM, ideal pentru lucru remote.")
                    .dailyPrice(new BigDecimal("45.00"))
                    .category("Electronice")
                    .brand("Lenovo")
                    .model("ThinkPad X1")
                    .discountPercent(new BigDecimal("5"))
                    .build());

            Product p3 = productRepository.save(Product.builder()
                    .owner(owner)
                    .name("Bicicleta trekking")
                    .description("Bicicleta 28 inch, 21 viteze, echipata cu cos frontal.")
                    .dailyPrice(new BigDecimal("25.00"))
                    .category("Sport")
                    .brand("KTM")
                    .model("Life Track")
                    .discountPercent(BigDecimal.ZERO)
                    .build());

            inventoryUnitRepository.save(InventoryUnit.builder()
                    .product(p1).serialNumber("CAM-SN-001").status(InventoryStatus.AVAILABLE).build());
            inventoryUnitRepository.save(InventoryUnit.builder()
                    .product(p1).serialNumber("CAM-SN-002").status(InventoryStatus.AVAILABLE).build());
            inventoryUnitRepository.save(InventoryUnit.builder()
                    .product(p2).serialNumber("LAP-SN-100").status(InventoryStatus.AVAILABLE).build());
            inventoryUnitRepository.save(InventoryUnit.builder()
                    .product(p2).serialNumber("LAP-SN-101").status(InventoryStatus.MAINTENANCE).build());
            inventoryUnitRepository.save(InventoryUnit.builder()
                    .product(p3).serialNumber("BIK-SN-500").status(InventoryStatus.AVAILABLE).build());
        };
    }
}
