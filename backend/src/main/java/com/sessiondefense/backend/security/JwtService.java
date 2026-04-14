package com.sessiondefense.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String generateToken(UUID accountId, String email, String role) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(jwtProperties.accessTokenTtl());

        return Jwts.builder()
                .subject(accountId.toString())
                .claims(Map.of("email", email, "role", role))
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey())
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long accessTokenTtlSeconds() {
        return jwtProperties.accessTokenTtl().toSeconds();
    }

    private SecretKey signingKey() {
        String rawSecret = jwtProperties.secret() == null ? "" : jwtProperties.secret().trim();
        byte[] keyBytes = decodeSecret(rawSecret);
        return Keys.hmacShaKeyFor(normalizeToMinLength(keyBytes));
    }

    private byte[] decodeSecret(String secret) {
        if (secret.isEmpty()) {
            return "session-defense-secret".getBytes(StandardCharsets.UTF_8);
        }

        try {
            return Decoders.BASE64.decode(secret);
        } catch (RuntimeException ignored) {
            return secret.getBytes(StandardCharsets.UTF_8);
        }
    }

    private byte[] normalizeToMinLength(byte[] keyBytes) {
        if (keyBytes.length >= 32) {
            return keyBytes;
        }

        byte[] normalized = new byte[32];
        for (int i = 0; i < normalized.length; i++) {
            normalized[i] = keyBytes[i % keyBytes.length];
        }
        return normalized;
    }
}
