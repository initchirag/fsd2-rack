package com.lab.postscheduler.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lab.postscheduler.dto.CreatePostRequest;
import com.lab.postscheduler.dto.PostResponse;
import com.lab.postscheduler.exception.GlobalExceptionHandler;
import com.lab.postscheduler.exception.PostNotFoundException;
import com.lab.postscheduler.model.Post;
import com.lab.postscheduler.service.PostService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {PostController.class, GlobalExceptionHandler.class})
class PostControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockBean  PostService postService;

    private PostResponse sample;

    @BeforeEach
    void setUp() {
        sample = PostResponse.builder().id(1L).title("Test Post")
                .platform("TWITTER").status("DRAFT").createdAt(LocalDateTime.now()).build();
    }

    @Test @DisplayName("GET /{id} — 200 OK")
    void getById_200() throws Exception {
        when(postService.getPostById(1L)).thenReturn(sample);
        mvc.perform(get("/api/v1/posts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test @DisplayName("GET /{id} — 404 not found")
    void getById_404() throws Exception {
        when(postService.getPostById(99L)).thenThrow(new PostNotFoundException(99L));
        mvc.perform(get("/api/v1/posts/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("POST_NOT_FOUND"));
    }

    @Test @DisplayName("POST / — 201 with valid body")
    void create_201() throws Exception {
        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("New Post"); req.setPlatform(Post.Platform.TWITTER);
        req.setStatus(Post.PostStatus.DRAFT);
        when(postService.createPost(any())).thenReturn(sample);
        mvc.perform(post("/api/v1/posts").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test @DisplayName("POST / — 400 blank title (Bean Validation)")
    void create_400_blankTitle() throws Exception {
        CreatePostRequest req = new CreatePostRequest();
        req.setTitle(""); req.setPlatform(Post.Platform.TWITTER); req.setStatus(Post.PostStatus.DRAFT);
        mvc.perform(post("/api/v1/posts").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.error.fieldErrors.title").exists());
    }

    @Test @DisplayName("DELETE /{id} — 204 no content")
    void delete_204() throws Exception {
        doNothing().when(postService).deletePost(1L);
        mvc.perform(delete("/api/v1/posts/1")).andExpect(status().isNoContent());
    }
}
