package com.sessiondefense.backend.dto;

import java.time.LocalDate;
import java.util.Map;

public record DailyChallengeResponse(
        LocalDate challengeDate,
        long seed,
        Map<String, Object> challengeModifiers,
        String leaderboardWindowKey
) {
}
