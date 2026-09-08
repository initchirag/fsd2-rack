package com.lab.postscheduler.exception;

import com.lab.postscheduler.response.ApiResponse;
import com.lab.postscheduler.response.ErrorDetail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Exp 2.1.2 — @ControllerAdvice intercepts ALL exceptions thrown anywhere
 * in the application and returns a consistent ApiResponse<ErrorDetail>.
 *
 * Without this: each controller would need its own try-catch → code duplication.
 * With this: one place handles everything → maintainable + consistent.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Bean Validation failures — @NotBlank, @Size, @NotNull (Exp 2.1.1 + 2.1.2) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }

        log.warn("[{}] Validation failed: {}", MDC.get("correlationId"), fieldErrors);

        ErrorDetail detail = ErrorDetail.builder()
                .code("VALIDATION_ERROR")
                .message("Request validation failed")
                .fieldErrors(fieldErrors)
                .build();

        ApiResponse<Void> response = ApiResponse.error(detail, "Invalid request data");
        response.setCorrelationId(MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /** Post not found (404) */
    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handlePostNotFound(PostNotFoundException ex) {
        log.warn("[{}] Post not found: id={}", MDC.get("correlationId"), ex.getPostId());

        ErrorDetail detail = ErrorDetail.builder()
                .code("POST_NOT_FOUND")
                .message(ex.getMessage())
                .build();

        ApiResponse<Void> response = ApiResponse.error(detail, "Resource not found");
        response.setCorrelationId(MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /** Invalid scheduling logic (422) */
    @ExceptionHandler(InvalidScheduleException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidSchedule(InvalidScheduleException ex) {
        log.warn("[{}] Invalid schedule: {}", MDC.get("correlationId"), ex.getMessage());

        ErrorDetail detail = ErrorDetail.builder()
                .code("INVALID_SCHEDULE")
                .message(ex.getMessage())
                .build();

        ApiResponse<Void> response = ApiResponse.error(detail, "Scheduling error");
        response.setCorrelationId(MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
    }

    /** Catch-all — any unhandled exception (500) */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        log.error("[{}] Unexpected error: {}", MDC.get("correlationId"), ex.getMessage(), ex);

        ErrorDetail detail = ErrorDetail.builder()
                .code("INTERNAL_ERROR")
                .message("An unexpected error occurred")
                .build();

        ApiResponse<Void> response = ApiResponse.error(detail, "Internal server error");
        response.setCorrelationId(MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
