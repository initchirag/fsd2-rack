package com.lab.postscheduler.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Exp 2.1.2 — Servlet Filter that runs on EVERY incoming request.
 *
 * What it does:
 * 1. Generates (or reads) a correlationId for each request
 * 2. Puts it in MDC so it appears in every log line for this request
 * 3. Logs request start (method, URI, IP) and end (status, duration)
 * 4. Echoes the correlationId in the response header X-Correlation-ID
 * 5. Clears MDC after the request is done (important — thread pool reuse)
 *
 * This gives us full request traceability in logs without touching controllers.
 */
@Component
@Order(1)
public class CorrelationIdFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(CorrelationIdFilter.class);
    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    public static final String MDC_KEY               = "correlationId";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  request  = (HttpServletRequest)  req;
        HttpServletResponse response = (HttpServletResponse) res;

        // 1. Assign correlation ID — use incoming header if client sent one, else generate
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        // 2. Put in MDC — now every log.info/warn/error in this thread includes it
        MDC.put(MDC_KEY, correlationId);

        // 3. Echo back in response header so client can trace their request
        response.setHeader(CORRELATION_ID_HEADER, correlationId);

        long start = System.currentTimeMillis();
        log.info(">>> REQUEST  [{} {}] from {}", request.getMethod(), request.getRequestURI(), request.getRemoteAddr());

        try {
            chain.doFilter(req, res); // hand off to the next filter / controller
        } finally {
            long duration = System.currentTimeMillis() - start;
            log.info("<<< RESPONSE [{}] status={} duration={}ms", request.getRequestURI(), response.getStatus(), duration);
            // 4. MUST clear MDC — threads are reused from pool, stale data would leak
            MDC.clear();
        }
    }
}
