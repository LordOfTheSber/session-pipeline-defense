package com.sessiondefense.backend.controller;

import com.sessiondefense.backend.dto.PlayerProfileResponse;
import com.sessiondefense.backend.dto.auth.AuthLoginRequest;
import com.sessiondefense.backend.dto.auth.AuthRegisterRequest;
import com.sessiondefense.backend.dto.auth.AuthResponse;
import com.sessiondefense.backend.service.auth.AuthService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody @Valid AuthRegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid AuthLoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public PlayerProfileResponse me(Authentication authentication) {
        UUID accountId = (UUID) authentication.getPrincipal();
        return authService.me(accountId);
    }
}
