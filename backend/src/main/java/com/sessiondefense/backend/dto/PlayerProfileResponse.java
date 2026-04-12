package com.sessiondefense.backend.dto;

import com.sessiondefense.backend.domain.entity.Difficulty;
import java.time.Instant;
import java.util.UUID;

public record PlayerProfileResponse(
        UUID id,
        String nickname,
        Difficulty preferredDifficulty,
        Instant createdAt,
        Instant updatedAt
) {
}
