package com.lab.postscheduler.dto;

import com.lab.postscheduler.model.Post;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * Exp 2.1.1 — Separate DTO for updates. All fields optional.
 */
public class UpdatePostRequest {

    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    private String title;

    @Size(max = 2000, message = "Content cannot exceed 2000 characters")
    private String content;

    private Post.Platform   platform;
    private Post.PostStatus status;
    private LocalDateTime   scheduledAt;

    // Getters
    public String          getTitle()       { return title; }
    public String          getContent()     { return content; }
    public Post.Platform   getPlatform()    { return platform; }
    public Post.PostStatus getStatus()      { return status; }
    public LocalDateTime   getScheduledAt() { return scheduledAt; }

    // Setters
    public void setTitle(String title)          { this.title = title; }
    public void setContent(String content)      { this.content = content; }
    public void setPlatform(Post.Platform p)    { this.platform = p; }
    public void setStatus(Post.PostStatus s)    { this.status = s; }
    public void setScheduledAt(LocalDateTime t) { this.scheduledAt = t; }
}
