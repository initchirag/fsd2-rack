package com.lab.postscheduler.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA Entity — maps to POSTS table.
 * Exp 2.1.1: resource-based data model with temporal scheduling field.
 *
 * Plain Java — no Lombok. JPA requires a no-args constructor, and Lombok's
 * @Builder conflicts with that unless carefully configured. Simpler to just
 * write it out — it's one class.
 */
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String content;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Platform platform;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PostStatus status;

    private LocalDateTime scheduledAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // JPA requires this
    public Post() {}

    @PrePersist
    protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    // Getters
    public Long          getId()          { return id; }
    public String        getTitle()       { return title; }
    public String        getContent()     { return content; }
    public Platform      getPlatform()    { return platform; }
    public PostStatus    getStatus()      { return status; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public LocalDateTime getCreatedAt()   { return createdAt; }
    public LocalDateTime getUpdatedAt()   { return updatedAt; }

    // Setters
    public void setId(Long id)                      { this.id = id; }
    public void setTitle(String title)              { this.title = title; }
    public void setContent(String content)          { this.content = content; }
    public void setPlatform(Platform platform)      { this.platform = platform; }
    public void setStatus(PostStatus status)        { this.status = status; }
    public void setScheduledAt(LocalDateTime t)     { this.scheduledAt = t; }
    public void setCreatedAt(LocalDateTime t)       { this.createdAt = t; }
    public void setUpdatedAt(LocalDateTime t)       { this.updatedAt = t; }

    public enum Platform   { TWITTER, INSTAGRAM, LINKEDIN, YOUTUBE }
    public enum PostStatus { DRAFT, SCHEDULED, PUBLISHED }

    // Builder — clean pattern, no Lombok required
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Post post = new Post();
        public Builder id(Long id)                  { post.id = id;               return this; }
        public Builder title(String title)          { post.title = title;         return this; }
        public Builder content(String content)      { post.content = content;     return this; }
        public Builder platform(Platform platform)  { post.platform = platform;   return this; }
        public Builder status(PostStatus status)    { post.status = status;       return this; }
        public Builder scheduledAt(LocalDateTime t) { post.scheduledAt = t;       return this; }
        public Post build()                         { return post; }
    }
}
