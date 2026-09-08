package com.lab.postscheduler.exception;

/**
 * Exp 2.1.2 — Thrown when a SCHEDULED post has no scheduledAt time,
 * or when scheduledAt is in the past.
 */
public class InvalidScheduleException extends RuntimeException {
    public InvalidScheduleException(String message) {
        super(message);
    }
}
