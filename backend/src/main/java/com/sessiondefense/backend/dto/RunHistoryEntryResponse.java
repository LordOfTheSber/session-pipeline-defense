package com.sessiondefense.backend.dto;

import com.sessiondefense.backend.domain.entity.Difficulty;
import com.sessiondefense.backend.domain.entity.GameMode;
import java.time.Instant;
import java.util.UUID;

public record RunHistoryEntryResponse(
        UUID id,
        int score,
        int processedCount,
        int waveReached,
        int survivalSeconds,
        Difficulty difficulty,
        GameMode mode,
        boolean suspicious,
        Instant createdAt
) {
}
