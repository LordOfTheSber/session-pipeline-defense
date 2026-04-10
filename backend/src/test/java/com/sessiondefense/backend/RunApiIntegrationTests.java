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
    void shouldCreateAndReturnDailyChallengeDeterministically() throws Exception {
        mockMvc.perform(get("/api/challenges/daily"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.challengeDate").isNotEmpty())
                .andExpect(jsonPath("$.seed").isNumber())
                .andExpect(jsonPath("$.challengeModifiers.spawnPressureMultiplier").isNumber())
                .andExpect(jsonPath("$.leaderboardWindowKey").isNotEmpty());

        mockMvc.perform(get("/api/challenges/daily"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seed").isNumber());
    }

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
    void shouldNotIncludeEndlessRunsInDailyLeaderboard() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("nickname", "today-ops");
        payload.put("mode", "ENDLESS");
        payload.put("difficulty", "STANDARD");
        payload.put("survivalSeconds", 90);
        payload.put("processedCount", 30);
        payload.put("waveReached", 3);
        payload.put("activeSessionPeak", 7);
        payload.put("creditsSpent", 180);
        payload.put("systemHealthEnd", 42);
        payload.put("score", 900);

        mockMvc.perform(post("/api/runs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated());

        String today = LocalDate.now(java.time.ZoneOffset.ofHours(3)).toString();
        mockMvc.perform(get("/api/leaderboards/daily?date=" + today + "&difficulty=STANDARD&limit=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void shouldReturnGlobalAndDailyLeaderboards() throws Exception {
        DailyChallenge challenge = dailyChallengeRepository.findByChallengeDate(LocalDate.of(2026, 4, 10))
                .orElseGet(() -> {
                    DailyChallenge value = new DailyChallenge();
                    value.setId(UUID.randomUUID());
                    value.setChallengeDate(LocalDate.of(2026, 4, 10));
                    value.setSeed(777L);
                    value.setConfigJson(Map.of());
                    value.setCreatedAt(Instant.now());
                    return dailyChallengeRepository.save(value);
                });

        Map<String, Object> payload = new HashMap<>();
        payload.put("nickname", "daily-runner");
        payload.put("mode", "DAILY");
        payload.put("difficulty", "STANDARD");
        payload.put("challengeDate", "2026-04-10");
        payload.put("challengeSeed", challenge.getSeed());
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

    @Test
    void shouldSubmitDailyRunUsingChallengeFromDailyEndpoint() throws Exception {
        String payload = mockMvc.perform(get("/api/challenges/daily"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Map<String, Object> challenge = objectMapper.readValue(payload, Map.class);
        Map<String, Object> submission = new HashMap<>();
        submission.put("nickname", "seed-consumer");
        submission.put("mode", "DAILY");
        submission.put("difficulty", "STANDARD");
        submission.put("challengeDate", challenge.get("challengeDate"));
        submission.put("challengeSeed", ((Number) challenge.get("seed")).longValue());
        submission.put("survivalSeconds", 110);
        submission.put("processedCount", 40);
        submission.put("waveReached", 4);
        submission.put("activeSessionPeak", 8);
        submission.put("creditsSpent", 230);
        submission.put("systemHealthEnd", 36);
        submission.put("score", 1250);

        mockMvc.perform(post("/api/runs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submission)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.suspicious").value(false));
    }
}
