package com.lab.postscheduler.response;

import java.util.Map;

/**
 * Exp 2.1.2 — Structured error payload inside ApiResponse.error
 * Plain Java — no Lombok to avoid annotation processor surprises.
 */
public class ErrorDetail {

    private String              code;
    private String              message;
    private Map<String, String> fieldErrors;

    public String              getCode()        { return code; }
    public String              getMessage()     { return message; }
    public Map<String, String> getFieldErrors() { return fieldErrors; }

    public void setCode(String code)                        { this.code = code; }
    public void setMessage(String message)                  { this.message = message; }
    public void setFieldErrors(Map<String, String> errors)  { this.fieldErrors = errors; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ErrorDetail d = new ErrorDetail();
        public Builder code(String code)                        { d.code = code;         return this; }
        public Builder message(String message)                  { d.message = message;   return this; }
        public Builder fieldErrors(Map<String, String> errors)  { d.fieldErrors = errors; return this; }
        public ErrorDetail build()                              { return d; }
    }
}
