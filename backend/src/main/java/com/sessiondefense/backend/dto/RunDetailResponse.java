package com.sessiondefense.backend.dto;

import com.sessiondefense.backend.domain.entity.Difficulty;
import com.sessiondefense.backend.domain.entity.GameMode;
import java.time.Instant;
import java.util.UUID;

public record RunDetailResponse(
        UUID id,
        String nicknameSnapshot,
        int score,
        int processedCount,
        int waveReached,
        int survivalSeconds,
        Difficulty difficulty,
        GameMode mode,
        boolean suspicious,
        String validationNotes,
        Instant createdAt
) {
}
