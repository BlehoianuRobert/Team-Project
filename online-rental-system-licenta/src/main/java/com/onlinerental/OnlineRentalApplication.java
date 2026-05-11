package com.onlinerental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class OnlineRentalApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlineRentalApplication.class, args);
    }
}
