package com.lab.postscheduler.repository;

import com.lab.postscheduler.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Exp 2.1.1 — Repository layer. Spring Data JPA generates all SQL.
 * We add domain-specific queries for the scheduler use-case.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByStatus(Post.PostStatus status);

    List<Post> findByPlatform(Post.Platform platform);

    List<Post> findByStatusAndPlatform(Post.PostStatus status, Post.Platform platform);

    /** Find all posts scheduled within a date range */
    @Query("SELECT p FROM Post p WHERE p.scheduledAt BETWEEN :from AND :to")
    List<Post> findScheduledBetween(LocalDateTime from, LocalDateTime to);

    /** Posts due for publishing (scheduled in the past but still SCHEDULED) */
    @Query("SELECT p FROM Post p WHERE p.status = 'SCHEDULED' AND p.scheduledAt <= :now")
    List<Post> findDueForPublishing(LocalDateTime now);
}
