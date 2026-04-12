package com.sessiondefense.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record NarrativeSeenRequest(
        @NotBlank @Size(max = 50) String nickname,
        @NotBlank @Size(max = 100)
        @Pattern(regexp = "[a-z0-9_.:-]+", message = "beatKey must be lowercase slug-like value")
        String beatKey
) {
}
