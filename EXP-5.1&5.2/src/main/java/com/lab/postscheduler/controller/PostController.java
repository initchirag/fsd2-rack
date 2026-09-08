package com.lab.postscheduler.controller;

import com.lab.postscheduler.dto.*;
import com.lab.postscheduler.model.Post;
import com.lab.postscheduler.response.ApiResponse;
import com.lab.postscheduler.service.PostService;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Exp 2.1.1 — REST Controller. Thin: validate → delegate → wrap response.
 * All endpoints return ApiResponse<T> for consistent structure.
 */
@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@Valid @RequestBody CreatePostRequest request) {
        PostResponse created = postService.createPost(request);
        ApiResponse<PostResponse> response = ApiResponse.success(created, "Post created successfully");
        response.setCorrelationId(MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> getAllPosts(
            @RequestParam(required = false) Post.PostStatus status,
            @RequestParam(required = false) Post.Platform   platform) {
        List<PostResponse> posts = postService.getAllPosts(status, platform);
        ApiResponse<List<PostResponse>> response = ApiResponse.success(posts, "Retrieved " + posts.size() + " post(s)");
        response.setCorrelationId(MDC.get("correlationId"));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(@PathVariable Long id) {
        PostResponse post = postService.getPostById(id);
        ApiResponse<PostResponse> response = ApiResponse.success(post, "Post retrieved");
        response.setCorrelationId(MDC.get("correlationId"));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long id, @Valid @RequestBody UpdatePostRequest request) {
        PostResponse updated = postService.updatePost(id, request);
        ApiResponse<PostResponse> response = ApiResponse.success(updated, "Post updated successfully");
        response.setCorrelationId(MDC.get("correlationId"));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        ApiResponse<Void> response = ApiResponse.success(null, "Post deleted successfully");
        response.setCorrelationId(MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(response);
    }

    @GetMapping("/due")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPostsDue() {
        List<PostResponse> posts = postService.getPostsDue();
        ApiResponse<List<PostResponse>> response = ApiResponse.success(posts, posts.size() + " post(s) due for publishing");
        response.setCorrelationId(MDC.get("correlationId"));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPostsInRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        List<PostResponse> posts = postService.getPostsInRange(from, to);
        ApiResponse<List<PostResponse>> response = ApiResponse.success(posts, "Retrieved " + posts.size() + " post(s) in range");
        response.setCorrelationId(MDC.get("correlationId"));
        return ResponseEntity.ok(response);
    }
}
