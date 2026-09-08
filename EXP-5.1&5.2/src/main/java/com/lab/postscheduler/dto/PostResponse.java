package com.lab.postscheduler.dto;

import com.lab.postscheduler.model.Post;
import java.time.LocalDateTime;

/**
 * Response DTO — never expose the entity directly to the client.
 * Plain Java to avoid Lombok annotation processor issues.
 */
public class PostResponse {

    private Long          id;
    private String        title;
    private String        content;
    private String        platform;
    private String        status;
    private LocalDateTime scheduledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters
    public Long          getId()          { return id; }
    public String        getTitle()       { return title; }
    public String        getContent()     { return content; }
    public String        getPlatform()    { return platform; }
    public String        getStatus()      { return status; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public LocalDateTime getCreatedAt()   { return createdAt; }
    public LocalDateTime getUpdatedAt()   { return updatedAt; }

    // Static factory from entity
    public static PostResponse from(Post p) {
        PostResponse r = new PostResponse();
        r.id          = p.getId();
        r.title       = p.getTitle();
        r.content     = p.getContent();
        r.platform    = p.getPlatform() != null ? p.getPlatform().name() : null;
        r.status      = p.getStatus()   != null ? p.getStatus().name()   : null;
        r.scheduledAt = p.getScheduledAt();
        r.createdAt   = p.getCreatedAt();
        r.updatedAt   = p.getUpdatedAt();
        return r;
    }

    // Builder (used in tests)
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final PostResponse r = new PostResponse();
        public Builder id(Long id)                      { r.id = id;               return this; }
        public Builder title(String title)              { r.title = title;         return this; }
        public Builder content(String content)          { r.content = content;     return this; }
        public Builder platform(String platform)        { r.platform = platform;   return this; }
        public Builder status(String status)            { r.status = status;       return this; }
        public Builder scheduledAt(LocalDateTime t)     { r.scheduledAt = t;       return this; }
        public Builder createdAt(LocalDateTime t)       { r.createdAt = t;         return this; }
        public Builder updatedAt(LocalDateTime t)       { r.updatedAt = t;         return this; }
        public PostResponse build()                     { return r; }
    }
}
