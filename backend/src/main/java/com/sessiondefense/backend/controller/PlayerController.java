package com.sessiondefense.backend.controller;

import com.sessiondefense.backend.dto.PlayerProfileResponse;
import com.sessiondefense.backend.dto.PlayerProfileUpsertRequest;
import com.sessiondefense.backend.dto.RunHistoryEntryResponse;
import com.sessiondefense.backend.service.PlayerProfileService;
import com.sessiondefense.backend.service.RunService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerProfileService playerProfileService;
    private final RunService runService;

    public PlayerController(PlayerProfileService playerProfileService, RunService runService) {
        this.playerProfileService = playerProfileService;
        this.runService = runService;
    }

    @PostMapping("/profile")
    public PlayerProfileResponse upsertProfile(@RequestBody @Valid PlayerProfileUpsertRequest request) {
        return playerProfileService.upsert(request);
    }

    @GetMapping("/{nickname}")
    public PlayerProfileResponse getProfile(@PathVariable String nickname) {
        return playerProfileService.getByNickname(nickname);
    }

    @GetMapping("/{nickname}/runs")
    public List<RunHistoryEntryResponse> getRunHistory(
            @PathVariable String nickname,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int limit
    ) {
        return runService.getRunHistory(nickname, limit);
    }
}
