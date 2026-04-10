package com.sessiondefense.backend.controller;

import com.sessiondefense.backend.domain.entity.Difficulty;
import com.sessiondefense.backend.dto.LeaderboardEntryResponse;
import com.sessiondefense.backend.service.RunService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/leaderboards")
public class LeaderboardController {

    private final RunService runService;

    public LeaderboardController(RunService runService) {
        this.runService = runService;
    }

    @GetMapping("/global")
    public List<LeaderboardEntryResponse> getGlobal(
            @RequestParam(defaultValue = "STANDARD") Difficulty difficulty,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int limit
    ) {
        return runService.getGlobalLeaderboard(difficulty, limit);
    }

    @GetMapping("/daily")
    public List<LeaderboardEntryResponse> getDaily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "STANDARD") Difficulty difficulty,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int limit
    ) {
        return runService.getDailyLeaderboard(date, difficulty, limit);
    }
}
