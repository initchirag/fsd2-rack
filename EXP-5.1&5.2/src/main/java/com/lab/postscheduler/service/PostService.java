package com.lab.postscheduler.service;

import com.lab.postscheduler.dto.*;
import com.lab.postscheduler.exception.*;
import com.lab.postscheduler.model.Post;
import com.lab.postscheduler.repository.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Exp 2.1.1 — Service layer: all business logic lives here.
 * Exp 2.1.2 — Every operation logged with correlationId from MDC.
 */
@Service
public class PostService {

    private static final Logger log = LoggerFactory.getLogger(PostService.class);
    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public PostResponse createPost(CreatePostRequest req) {
        log.debug("[{}] Creating post: title='{}', platform={}, status={}",
                MDC.get("correlationId"), req.getTitle(), req.getPlatform(), req.getStatus());

        if (req.getStatus() == Post.PostStatus.SCHEDULED) {
            if (req.getScheduledAt() == null)
                throw new InvalidScheduleException("scheduledAt is required when status is SCHEDULED");
            if (req.getScheduledAt().isBefore(LocalDateTime.now()))
                throw new InvalidScheduleException("scheduledAt must be in the future");
        }

        Post post = Post.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .platform(req.getPlatform())
                .status(req.getStatus())
                .scheduledAt(req.getScheduledAt())
                .build();

        Post saved = postRepository.save(post);
        log.info("[{}] Post created: id={}", MDC.get("correlationId"), saved.getId());
        return PostResponse.from(saved);
    }

    public List<PostResponse> getAllPosts(Post.PostStatus status, Post.Platform platform) {
        log.debug("[{}] Fetching posts: status={}, platform={}", MDC.get("correlationId"), status, platform);
        List<Post> posts;
        if (status != null && platform != null)  posts = postRepository.findByStatusAndPlatform(status, platform);
        else if (status != null)                 posts = postRepository.findByStatus(status);
        else if (platform != null)               posts = postRepository.findByPlatform(platform);
        else                                     posts = postRepository.findAll();
        return posts.stream().map(PostResponse::from).toList();
    }

    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new PostNotFoundException(id));
        return PostResponse.from(post);
    }

    public PostResponse updatePost(Long id, UpdatePostRequest req) {
        log.debug("[{}] Updating post id={}", MDC.get("correlationId"), id);
        Post post = postRepository.findById(id).orElseThrow(() -> new PostNotFoundException(id));

        if (req.getTitle()       != null) post.setTitle(req.getTitle());
        if (req.getContent()     != null) post.setContent(req.getContent());
        if (req.getPlatform()    != null) post.setPlatform(req.getPlatform());
        if (req.getScheduledAt() != null) post.setScheduledAt(req.getScheduledAt());

        if (req.getStatus() != null) {
            if (req.getStatus() == Post.PostStatus.SCHEDULED && post.getScheduledAt() == null)
                throw new InvalidScheduleException("Cannot set status to SCHEDULED without a scheduledAt time");
            post.setStatus(req.getStatus());
        }

        Post updated = postRepository.save(post);
        log.info("[{}] Post updated: id={}", MDC.get("correlationId"), updated.getId());
        return PostResponse.from(updated);
    }

    public void deletePost(Long id) {
        log.debug("[{}] Deleting post id={}", MDC.get("correlationId"), id);
        if (!postRepository.existsById(id)) throw new PostNotFoundException(id);
        postRepository.deleteById(id);
        log.info("[{}] Post deleted: id={}", MDC.get("correlationId"), id);
    }

    public List<PostResponse> getPostsDue() {
        return postRepository.findDueForPublishing(LocalDateTime.now())
                .stream().map(PostResponse::from).toList();
    }

    public List<PostResponse> getPostsInRange(LocalDateTime from, LocalDateTime to) {
        return postRepository.findScheduledBetween(from, to)
                .stream().map(PostResponse::from).toList();
    }
}
