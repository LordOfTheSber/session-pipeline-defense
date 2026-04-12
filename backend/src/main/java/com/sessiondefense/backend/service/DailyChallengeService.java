package com.sessiondefense.backend.service;

import com.sessiondefense.backend.domain.entity.DailyChallenge;
import com.sessiondefense.backend.dto.DailyChallengeResponse;
import com.sessiondefense.backend.repository.DailyChallengeRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class DailyChallengeService {

    private static final String DAILY_SEED_NAMESPACE = "session-pipeline-defense::daily-v1";

    private final DailyChallengeRepository dailyChallengeRepository;
    private final Clock clock;

    public DailyChallengeService(DailyChallengeRepository dailyChallengeRepository) {
        this.dailyChallengeRepository = dailyChallengeRepository;
        this.clock = Clock.systemUTC();
    }

    public DailyChallengeResponse getOrCreateTodayChallenge() {
        LocalDate today = LocalDate.now(clock);
        DailyChallenge challenge = dailyChallengeRepository
                .findByChallengeDate(today)
                .orElseGet(() -> createChallenge(today));

        Map<String, Object> modifiers = challenge.getConfigJson();
        return new DailyChallengeResponse(
                challenge.getChallengeDate(),
                challenge.getSeed(),
                modifiers,
                challenge.getChallengeDate().toString()
        );
    }

    private DailyChallenge createChallenge(LocalDate challengeDate) {
        long seed = computeDeterministicSeed(challengeDate);
        Map<String, Object> modifiers = generateModifiers(seed);

        DailyChallenge challenge = new DailyChallenge();
        challenge.setId(UUID.randomUUID());
        challenge.setChallengeDate(challengeDate);
        challenge.setSeed(seed);
        challenge.setConfigJson(modifiers);
        challenge.setCreatedAt(Instant.now(clock));

        return dailyChallengeRepository.save(challenge);
    }

    private long computeDeterministicSeed(LocalDate challengeDate) {
        String value = DAILY_SEED_NAMESPACE + "::" + challengeDate;
        return Math.abs(value.hashCode()) * 1171L + challengeDate.toEpochDay();
    }

    private Map<String, Object> generateModifiers(long seed) {
        double spawnPressureMultiplier = 1.0 + ((seed % 9) * 0.02);
        double creditsRegenMultiplier = 0.92 + ((seed % 7) * 0.02);
        double corruptedBias = 1.0 + ((seed % 5) * 0.05);

        return Map.of(
                "spawnPressureMultiplier", roundTo2(spawnPressureMultiplier),
                "creditsRegenMultiplier", roundTo2(creditsRegenMultiplier),
                "corruptedBiasMultiplier", roundTo2(corruptedBias)
        );
    }

    private double roundTo2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

}
