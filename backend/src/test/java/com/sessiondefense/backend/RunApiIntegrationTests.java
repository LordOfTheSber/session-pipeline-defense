package com.sessiondefense.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sessiondefense.backend.domain.entity.DailyChallenge;
import com.sessiondefense.backend.repository.DailyChallengeRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class RunApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DailyChallengeRepository dailyChallengeRepository;

    @Test
    void shouldSubmitRunAndReturnCreatedResponse() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("nickname", "ops-pro");
        payload.put("mode", "ENDLESS");
        payload.put("difficulty", "STANDARD");
        payload.put("survivalSeconds", 120);
        payload.put("processedCount", 45);
        payload.put("waveReached", 4);
        payload.put("activeSessionPeak", 9);
        payload.put("creditsSpent", 260);
        payload.put("systemHealthEnd", 30);
        payload.put("score", 1110);

        mockMvc.perform(post("/api/runs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.suspicious").value(false));
    }

    @Test
    void shouldReturnGlobalAndDailyLeaderboards() throws Exception {
        DailyChallenge challenge = new DailyChallenge();
        challenge.setId(UUID.randomUUID());
        challenge.setChallengeDate(LocalDate.of(2026, 4, 10));
        challenge.setSeed(777L);
        challenge.setConfigJson("{}");
        challenge.setCreatedAt(Instant.now());
        dailyChallengeRepository.save(challenge);

        Map<String, Object> payload = new HashMap<>();
        payload.put("nickname", "daily-runner");
        payload.put("mode", "DAILY");
        payload.put("difficulty", "STANDARD");
        payload.put("challengeDate", "2026-04-10");
        payload.put("challengeSeed", 777L);
        payload.put("survivalSeconds", 140);
        payload.put("processedCount", 52);
        payload.put("waveReached", 5);
        payload.put("activeSessionPeak", 10);
        payload.put("creditsSpent", 310);
        payload.put("systemHealthEnd", 21);
        payload.put("score", 1610);

        mockMvc.perform(post("/api/runs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/leaderboards/global?difficulty=STANDARD&limit=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nickname").value("daily-runner"));

        mockMvc.perform(get("/api/leaderboards/daily?date=2026-04-10&difficulty=STANDARD&limit=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].mode").value("DAILY"));
    }
}
