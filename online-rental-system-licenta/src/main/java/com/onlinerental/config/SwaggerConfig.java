package com.onlinerental.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Soft de închiriere online — API")
                        .description("Documentația REST API pentru sistemul de închiriere online cu verificare AI")
                        .version("1.0.0"));
    }
}