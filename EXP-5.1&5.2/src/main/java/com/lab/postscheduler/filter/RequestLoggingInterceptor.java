package com.lab.postscheduler.filter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Exp 2.1.2 — Spring MVC Interceptor (runs after DispatcherServlet routing).
 *
 * Difference from Filter:
 *   Filter     → runs at Servlet level, before Spring knows which handler to call
 *   Interceptor → runs after routing, knows the exact Controller + Method being called
 *
 * We use this to log the resolved handler name for finer-grained observability.
 */
@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        log.debug("[{}] Handler resolved: {}", MDC.get("correlationId"), handler);
        return true; // true = continue processing
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        if (ex != null) {
            log.error("[{}] Request completed with exception: {}", MDC.get("correlationId"), ex.getMessage());
        }
    }
}
