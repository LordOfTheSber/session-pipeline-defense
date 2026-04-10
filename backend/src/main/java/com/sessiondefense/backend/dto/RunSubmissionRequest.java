package com.sessiondefense.backend.dto;

import com.sessiondefense.backend.domain.entity.Difficulty;
import com.sessiondefense.backend.domain.entity.GameMode;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record RunSubmissionRequest(
        @NotBlank @Size(max = 50) String nickname,
        @NotNull GameMode mode,
        @NotNull Difficulty difficulty,
        LocalDate challengeDate,
        Long challengeSeed,
        @Min(0) @Max(7200) int survivalSeconds,
        @Min(0) @Max(50000) int processedCount,
        @Min(0) @Max(2000) int waveReached,
        @Min(0) @Max(1000) int activeSessionPeak,
        @Min(0) @Max(100000) int creditsSpent,
        @Min(0) @Max(100) int systemHealthEnd,
        @Min(0) @Max(2000000) int score
) {
}
