package com.sessiondefense.backend.dto;

import com.sessiondefense.backend.domain.entity.Difficulty;
import com.sessiondefense.backend.domain.entity.GameMode;
import java.time.Instant;
import java.util.UUID;

public record LeaderboardEntryResponse(
        UUID runId,
        String nickname,
        int score,
        Difficulty difficulty,
        GameMode mode,
        Instant createdAt
) {
}
