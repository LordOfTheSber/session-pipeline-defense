package com.sessiondefense.backend.dto;

import com.sessiondefense.backend.domain.entity.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PlayerProfileUpsertRequest(
        @NotBlank @Size(max = 50) String nickname,
        @NotNull Difficulty preferredDifficulty
) {
}
