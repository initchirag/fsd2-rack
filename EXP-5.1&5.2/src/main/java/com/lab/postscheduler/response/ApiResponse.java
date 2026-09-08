package com.lab.postscheduler.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

/**
 * Exp 2.1.1 — Standardized API response envelope.
 *
 * Fix: rewrote without Lombok. @Builder + @Data on a generic class causes
 * setCorrelationId() to not be generated correctly in some Lombok versions.
 * Plain Java is just more reliable here and avoids annotation processor issues.
 *
 * Success:  { success: true,  data: {...},  message: "..." }
 * Error:    { success: false, error: {...}, message: "..." }
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean       success;
    private String        message;
    private T             data;
    private Object        error;
    private LocalDateTime timestamp;
    private String        correlationId;

    // ── Getters (needed by Jackson for serialization) ─────────────────────────
    public boolean       isSuccess()       { return success; }
    public String        getMessage()      { return message; }
    public T             getData()         { return data; }
    public Object        getError()        { return error; }
    public LocalDateTime getTimestamp()    { return timestamp; }
    public String        getCorrelationId(){ return correlationId; }

    // ── Setters ───────────────────────────────────────────────────────────────
    public void setSuccess(boolean success)           { this.success = success; }
    public void setMessage(String message)            { this.message = message; }
    public void setData(T data)                       { this.data = data; }
    public void setError(Object error)                { this.error = error; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public void setCorrelationId(String id)           { this.correlationId = id; }

    // ── Static factory helpers ────────────────────────────────────────────────
    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success   = true;
        r.message   = message;
        r.data      = data;
        r.timestamp = LocalDateTime.now();
        return r;
    }

    public static <T> ApiResponse<T> error(Object errorDetail, String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success   = false;
        r.message   = message;
        r.error     = errorDetail;
        r.timestamp = LocalDateTime.now();
        return r;
    }
}
