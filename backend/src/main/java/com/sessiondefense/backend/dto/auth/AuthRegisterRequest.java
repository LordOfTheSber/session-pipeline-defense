package com.sessiondefense.backend.dto.auth;

import com.sessiondefense.backend.domain.entity.Difficulty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRegisterRequest(
        @NotBlank @Size(min = 2, max = 50) String nickname,
        @NotBlank @Email @Size(max = 160) String email,
        @NotBlank @Size(min = 8, max = 128) String password,
        Difficulty preferredDifficulty
) {
}
