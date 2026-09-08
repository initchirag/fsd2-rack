package com.lab.postscheduler.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

/**
 * Exp 2.1.1 — Global CORS configuration.
 *
 * Allows the React frontend (localhost:3000 / 5173) to call this API
 * without getting blocked by the browser's same-origin policy.
 *
 * In production: replace allowedOrigins with your actual domain.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",  // Create React App
                    "http://localhost:5173"   // Vite
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("X-Correlation-ID") // Exp 2.1.2: let frontend see the trace ID
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // We register the logging interceptor here instead of @Component
        // so Spring MVC applies it after routing resolution
    }
}
