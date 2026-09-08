package com.lab.postscheduler.exception;

/**
 * Exp 2.1.2 — Custom exception thrown when a post ID doesn't exist.
 * Caught and handled centrally by GlobalExceptionHandler.
 */
public class PostNotFoundException extends RuntimeException {
    private final Long postId;

    public PostNotFoundException(Long postId) {
        super("Post not found with id: " + postId);
        this.postId = postId;
    }

    public Long getPostId() { return postId; }
}
