package com.sessiondefense.backend.controller;

import com.sessiondefense.backend.dto.DailyChallengeResponse;
import com.sessiondefense.backend.service.DailyChallengeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/challenges")
public class DailyChallengeController {

    private final DailyChallengeService dailyChallengeService;

    public DailyChallengeController(DailyChallengeService dailyChallengeService) {
        this.dailyChallengeService = dailyChallengeService;
    }

    @GetMapping("/daily")
    public DailyChallengeResponse getDailyChallenge() {
        return dailyChallengeService.getOrCreateTodayChallenge();
    }
}
