package com.lab.postscheduler.config;

import com.lab.postscheduler.model.Post;
import com.lab.postscheduler.repository.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final PostRepository postRepository;

    public DataSeeder(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Override
    public void run(String... args) {
        postRepository.save(Post.builder().title("Product launch thread").content("We're launching...").platform(Post.Platform.TWITTER).status(Post.PostStatus.SCHEDULED).scheduledAt(LocalDateTime.now().plusDays(1)).build());
        postRepository.save(Post.builder().title("Behind the scenes reel").content("Our team at work.").platform(Post.Platform.INSTAGRAM).status(Post.PostStatus.DRAFT).build());
        postRepository.save(Post.builder().title("Case study article").content("How we increased CTR by 40%...").platform(Post.Platform.LINKEDIN).status(Post.PostStatus.SCHEDULED).scheduledAt(LocalDateTime.now().plusDays(2)).build());
        postRepository.save(Post.builder().title("Tutorial video").content("Step by step guide...").platform(Post.Platform.YOUTUBE).status(Post.PostStatus.PUBLISHED).scheduledAt(LocalDateTime.now().minusDays(1)).build());
        log.info("Sample data seeded — {} posts in DB", postRepository.count());
    }
}
