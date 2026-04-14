package com.sessiondefense.backend.dto.auth;

import com.sessiondefense.backend.dto.PlayerProfileResponse;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        PlayerProfileResponse profile
) {
}
