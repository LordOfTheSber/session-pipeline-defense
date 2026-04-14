package com.sessiondefense.backend.service.auth;

import com.sessiondefense.backend.domain.entity.AuthAccount;
import com.sessiondefense.backend.domain.entity.PlayerProfile;
import com.sessiondefense.backend.dto.PlayerProfileResponse;
import com.sessiondefense.backend.dto.auth.AuthLoginRequest;
import com.sessiondefense.backend.dto.auth.AuthRegisterRequest;
import com.sessiondefense.backend.dto.auth.AuthResponse;
import com.sessiondefense.backend.repository.AuthAccountRepository;
import com.sessiondefense.backend.security.JwtService;
import com.sessiondefense.backend.service.PlayerProfileService;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthAccountRepository authAccountRepository;
    private final PlayerProfileService playerProfileService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AuthAccountRepository authAccountRepository,
            PlayerProfileService playerProfileService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.authAccountRepository = authAccountRepository;
        this.playerProfileService = playerProfileService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(AuthRegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (authAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new EntityExistsException("Account already exists for email: " + normalizedEmail);
        }

        PlayerProfile profile = playerProfileService.getOrCreateByNickname(request.nickname(), request.preferredDifficulty());
        if (authAccountRepository.existsByPlayerProfileId(profile.getId())) {
            throw new EntityExistsException("Nickname is already tied to another account: " + profile.getNickname());
        }

        AuthAccount account = new AuthAccount();
        account.setId(UUID.randomUUID());
        account.setPlayerProfile(profile);
        account.setEmail(normalizedEmail);
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        account.setRole("USER");
        account.setCreatedAt(Instant.now());
        account.setUpdatedAt(Instant.now());
        AuthAccount saved = authAccountRepository.save(account);

        return buildAuthResponse(saved);
    }

    public AuthResponse login(AuthLoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        AuthAccount account = authAccountRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return buildAuthResponse(account);
    }

    public PlayerProfileResponse me(UUID accountId) {
        AuthAccount account = authAccountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found"));
        return playerProfileService.getById(account.getPlayerProfile().getId());
    }

    private AuthResponse buildAuthResponse(AuthAccount account) {
        String accessToken = jwtService.generateToken(account.getId(), account.getEmail(), account.getRole());
        PlayerProfileResponse profile = playerProfileService.getById(account.getPlayerProfile().getId());

        return new AuthResponse(
                accessToken,
                "Bearer",
                jwtService.accessTokenTtlSeconds(),
                profile
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
