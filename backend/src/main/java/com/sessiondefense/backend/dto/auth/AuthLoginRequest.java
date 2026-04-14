package com.sessiondefense.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthLoginRequest(
        @NotBlank @Email @Size(max = 160) String email,
        @NotBlank @Size(min = 8, max = 128) String password
) {
}
