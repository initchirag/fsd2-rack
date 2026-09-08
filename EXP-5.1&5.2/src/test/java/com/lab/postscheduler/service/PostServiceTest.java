package com.lab.postscheduler.service;

import com.lab.postscheduler.dto.CreatePostRequest;
import com.lab.postscheduler.dto.PostResponse;
import com.lab.postscheduler.exception.InvalidScheduleException;
import com.lab.postscheduler.exception.PostNotFoundException;
import com.lab.postscheduler.model.Post;
import com.lab.postscheduler.repository.PostRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock PostRepository postRepository;
    @InjectMocks PostService postService;

    private Post samplePost;

    @BeforeEach
    void setUp() {
        samplePost = Post.builder().id(1L).title("Test Post").content("Content")
                .platform(Post.Platform.TWITTER).status(Post.PostStatus.DRAFT).build();
    }

    @Test @DisplayName("createPost: DRAFT saves successfully")
    void createDraft_success() {
        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("Test Post"); req.setContent("Content");
        req.setPlatform(Post.Platform.TWITTER); req.setStatus(Post.PostStatus.DRAFT);
        when(postRepository.save(any(Post.class))).thenReturn(samplePost);
        PostResponse result = postService.createPost(req);
        assertNotNull(result);
        assertEquals("Test Post", result.getTitle());
        verify(postRepository, times(1)).save(any(Post.class));
    }

    @Test @DisplayName("createPost: SCHEDULED without scheduledAt throws")
    void createScheduled_noDate_throws() {
        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("Scheduled Post"); req.setPlatform(Post.Platform.LINKEDIN);
        req.setStatus(Post.PostStatus.SCHEDULED);
        assertThrows(InvalidScheduleException.class, () -> postService.createPost(req));
        verify(postRepository, never()).save(any());
    }

    @Test @DisplayName("createPost: SCHEDULED with past date throws")
    void createScheduled_pastDate_throws() {
        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("Past Post"); req.setPlatform(Post.Platform.TWITTER);
        req.setStatus(Post.PostStatus.SCHEDULED);
        req.setScheduledAt(LocalDateTime.now().minusHours(1));
        assertThrows(InvalidScheduleException.class, () -> postService.createPost(req));
    }

    @Test @DisplayName("getPostById: found returns response")
    void getById_found() {
        when(postRepository.findById(1L)).thenReturn(Optional.of(samplePost));
        PostResponse result = postService.getPostById(1L);
        assertEquals(1L, result.getId());
    }

    @Test @DisplayName("getPostById: missing id throws PostNotFoundException")
    void getById_notFound() {
        when(postRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(PostNotFoundException.class, () -> postService.getPostById(99L));
    }

    @Test @DisplayName("deletePost: non-existent throws PostNotFoundException")
    void delete_notFound() {
        when(postRepository.existsById(99L)).thenReturn(false);
        assertThrows(PostNotFoundException.class, () -> postService.deletePost(99L));
        verify(postRepository, never()).deleteById(any());
    }

    @Test @DisplayName("deletePost: valid id calls deleteById")
    void delete_success() {
        when(postRepository.existsById(1L)).thenReturn(true);
        postService.deletePost(1L);
        verify(postRepository, times(1)).deleteById(1L);
    }
}
