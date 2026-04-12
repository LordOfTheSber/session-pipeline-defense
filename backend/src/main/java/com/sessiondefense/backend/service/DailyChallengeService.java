package com.sessiondefense.backend.service;

import com.sessiondefense.backend.domain.entity.DailyChallenge;
import com.sessiondefense.backend.dto.DailyChallengeResponse;
import com.sessiondefense.backend.repository.DailyChallengeRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class DailyChallengeService {

    private static final String DAILY_SEED_NAMESPACE = "session-pipeline-defense::daily-v1";

    private static final List<DailyLogFragment> DAILY_LOG_LIBRARY = List.of(
            new DailyLogFragment("RECOVERED LOG #041 — Archive Fragment 01", "Fragment 01: Division operators recorded unstable routing behavior during Surge containment cycle 01.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #042 — Archive Fragment 02", "Fragment 02: Division operators recorded unstable routing behavior during Surge containment cycle 02.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #043 — Archive Fragment 03", "Fragment 03: Division operators recorded unstable routing behavior during Surge containment cycle 03.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #044 — Archive Fragment 04", "Fragment 04: Division operators recorded unstable routing behavior during Surge containment cycle 04.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #045 — Archive Fragment 05", "Fragment 05: Division operators recorded unstable routing behavior during Surge containment cycle 05.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #046 — Archive Fragment 06", "Fragment 06: Division operators recorded unstable routing behavior during Surge containment cycle 06.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #047 — Archive Fragment 07", "Fragment 07: Division operators recorded unstable routing behavior during Surge containment cycle 07.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #048 — Archive Fragment 08", "Fragment 08: Division operators recorded unstable routing behavior during Surge containment cycle 08.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #049 — Archive Fragment 09", "Fragment 09: Division operators recorded unstable routing behavior during Surge containment cycle 09.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #050 — Archive Fragment 10", "Fragment 10: Division operators recorded unstable routing behavior during Surge containment cycle 10.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #051 — Archive Fragment 11", "Fragment 11: Division operators recorded unstable routing behavior during Surge containment cycle 11.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #052 — Archive Fragment 12", "Fragment 12: Division operators recorded unstable routing behavior during Surge containment cycle 12.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #053 — Archive Fragment 13", "Fragment 13: Division operators recorded unstable routing behavior during Surge containment cycle 13.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #054 — Archive Fragment 14", "Fragment 14: Division operators recorded unstable routing behavior during Surge containment cycle 14.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #055 — Archive Fragment 15", "Fragment 15: Division operators recorded unstable routing behavior during Surge containment cycle 15.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #056 — Archive Fragment 16", "Fragment 16: Division operators recorded unstable routing behavior during Surge containment cycle 16.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #057 — Archive Fragment 17", "Fragment 17: Division operators recorded unstable routing behavior during Surge containment cycle 17.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #058 — Archive Fragment 18", "Fragment 18: Division operators recorded unstable routing behavior during Surge containment cycle 18.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #059 — Archive Fragment 19", "Fragment 19: Division operators recorded unstable routing behavior during Surge containment cycle 19.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #060 — Archive Fragment 20", "Fragment 20: Division operators recorded unstable routing behavior during Surge containment cycle 20.", "ACT_II_CONTAINMENT"),
            new DailyLogFragment("RECOVERED LOG #061 — Archive Fragment 21", "Fragment 21: Division operators recorded unstable routing behavior during Surge containment cycle 21.", "ACT_III_REVELATION"),
            new DailyLogFragment("RECOVERED LOG #062 — Archive Fragment 22", "Fragment 22: Division operators recorded unstable routing behavior during Surge containment cycle 22.", "ACT_III_REVELATION"),
            new DailyLogFragment("RECOVERED LOG #063 — Archive Fragment 23", "Fragment 23: Division operators recorded unstable routing behavior during Surge containment cycle 23.", "ACT_III_REVELATION"),
            new DailyLogFragment("RECOVERED LOG #064 — Archive Fragment 24", "Fragment 24: Division operators recorded unstable routing behavior during Surge containment cycle 24.", "ACT_III_REVELATION"),
            new DailyLogFragment("RECOVERED LOG #065 — Archive Fragment 25", "Fragment 25: Division operators recorded unstable routing behavior during Surge containment cycle 25.", "ACT_III_REVELATION"),
            new DailyLogFragment("RECOVERED LOG #066 — Archive Fragment 26", "Fragment 26: Division operators recorded unstable routing behavior during Surge containment cycle 26.", "ACT_III_REVELATION"),
            new DailyLogFragment("RECOVERED LOG #067 — Archive Fragment 27", "Fragment 27: Division operators recorded unstable routing behavior during Surge containment cycle 27.", "ACT_III_REVELATION"),
            new DailyLogFragment("RECOVERED LOG #068 — Archive Fragment 28", "Fragment 28: Division operators recorded unstable routing behavior during Surge containment cycle 28.", "ACT_III_REVELATION"),
            new DailyLogFragment("RECOVERED LOG #069 — Archive Fragment 29", "Fragment 29: Division operators recorded unstable routing behavior during Surge containment cycle 29.", "ACT_III_REVELATION"),
            new DailyLogFragment("RECOVERED LOG #070 — Archive Fragment 30", "Fragment 30: Division operators recorded unstable routing behavior during Surge containment cycle 30.", "ACT_III_REVELATION")
    );

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

        return toResponse(challenge);
    }

    private DailyChallengeResponse toResponse(DailyChallenge challenge) {
        String beatKey = toNarrativeBeatKey(challenge.getChallengeDate());

        return new DailyChallengeResponse(
                challenge.getChallengeDate(),
                challenge.getSeed(),
                challenge.getConfigJson(),
                challenge.getChallengeDate().toString(),
                challenge.getLogTitle(),
                challenge.getLogExcerpt(),
                challenge.getActReference(),
                beatKey
        );
    }

    private DailyChallenge createChallenge(LocalDate challengeDate) {
        long seed = computeDeterministicSeed(challengeDate);
        Map<String, Object> modifiers = generateModifiers(seed);
        DailyLogFragment log = pickLogFragment(challengeDate);

        DailyChallenge challenge = new DailyChallenge();
        challenge.setId(UUID.randomUUID());
        challenge.setChallengeDate(challengeDate);
        challenge.setSeed(seed);
        challenge.setConfigJson(modifiers);
        challenge.setLogTitle(log.title());
        challenge.setLogExcerpt(log.excerpt());
        challenge.setActReference(log.actReference());
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

    private DailyLogFragment pickLogFragment(LocalDate challengeDate) {
        int index = Math.floorMod((int) challengeDate.toEpochDay(), DAILY_LOG_LIBRARY.size());
        return DAILY_LOG_LIBRARY.get(index);
    }

    private String toNarrativeBeatKey(LocalDate challengeDate) {
        return "daily.log." + challengeDate;
    }

    private double roundTo2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private record DailyLogFragment(String title, String excerpt, String actReference) {
    }
}
