package com.sessiondefense.backend.service;

import com.sessiondefense.backend.domain.entity.DailyChallenge;
import com.sessiondefense.backend.domain.entity.Difficulty;
import com.sessiondefense.backend.domain.entity.GameMode;
import com.sessiondefense.backend.domain.entity.GameRun;
import com.sessiondefense.backend.dto.LeaderboardEntryResponse;
import com.sessiondefense.backend.dto.RunDetailResponse;
import com.sessiondefense.backend.dto.RunSubmissionRequest;
import com.sessiondefense.backend.dto.RunSubmissionResponse;
import com.sessiondefense.backend.repository.DailyChallengeRepository;
import com.sessiondefense.backend.repository.GameRunRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class RunService {

    private final GameRunRepository gameRunRepository;
    private final DailyChallengeRepository dailyChallengeRepository;

    public RunService(GameRunRepository gameRunRepository, DailyChallengeRepository dailyChallengeRepository) {
        this.gameRunRepository = gameRunRepository;
        this.dailyChallengeRepository = dailyChallengeRepository;
    }

    public RunSubmissionResponse submitRun(RunSubmissionRequest request) {
        var validationNotes = new ArrayList<String>();

        if (request.mode() == GameMode.DAILY) {
            validateDailyChallenge(request, validationNotes);
        }

        validateScorePlausibility(request, validationNotes);

        GameRun run = new GameRun();
        run.setId(UUID.randomUUID());
        run.setNicknameSnapshot(request.nickname().trim());
        run.setMode(request.mode());
        run.setDifficulty(request.difficulty());

        if (request.mode() == GameMode.DAILY) {
            run.setChallengeDate(request.challengeDate());
            run.setChallengeSeed(request.challengeSeed());
        } else {
            run.setChallengeDate(null);
            run.setChallengeSeed(null);
        }
        run.setSurvivalSeconds(request.survivalSeconds());
        run.setProcessedCount(request.processedCount());
        run.setWaveReached(request.waveReached());
        run.setActiveSessionPeak(request.activeSessionPeak());
        run.setCreditsSpent(request.creditsSpent());
        run.setSystemHealthEnd(request.systemHealthEnd());
        run.setScore(request.score());
        run.setSuspicious(!validationNotes.isEmpty());
        run.setValidationNotes(validationNotes.isEmpty() ? null : String.join("; ", validationNotes));
        run.setCreatedAt(Instant.now());

        gameRunRepository.save(run);

        return new RunSubmissionResponse(run.getId(), run.isSuspicious(), run.getValidationNotes());
    }

    public RunDetailResponse getRun(UUID runId) {
        GameRun run = gameRunRepository.findById(runId)
                .orElseThrow(() -> new EntityNotFoundException("Run not found: " + runId));

        return new RunDetailResponse(
                run.getId(),
                run.getNicknameSnapshot(),
                run.getScore(),
                run.getProcessedCount(),
                run.getWaveReached(),
                run.getSurvivalSeconds(),
                run.getDifficulty(),
                run.getMode(),
                run.isSuspicious(),
                run.getValidationNotes(),
                run.getCreatedAt()
        );
    }

    public List<LeaderboardEntryResponse> getGlobalLeaderboard(Difficulty difficulty, int limit) {
        return gameRunRepository
                .findByDifficultyOrderByScoreDescCreatedAtDesc(difficulty, PageRequest.of(0, limit))
                .stream()
                .map(this::toLeaderboardEntry)
                .toList();
    }

    public List<LeaderboardEntryResponse> getDailyLeaderboard(LocalDate date, Difficulty difficulty, int limit) {
        return gameRunRepository
                .findByChallengeDateAndDifficultyOrderByScoreDescCreatedAtDesc(date, difficulty, PageRequest.of(0, limit))
                .stream()
                .map(this::toLeaderboardEntry)
                .toList();
    }

    private void validateDailyChallenge(RunSubmissionRequest request, List<String> validationNotes) {
        if (request.challengeDate() == null || request.challengeSeed() == null) {
            validationNotes.add("DAILY mode requires challengeDate and challengeSeed");
            return;
        }

        DailyChallenge challenge = dailyChallengeRepository
                .findByChallengeDate(request.challengeDate())
                .orElse(null);

        if (challenge == null) {
            validationNotes.add("No daily challenge exists for date " + request.challengeDate());
            return;
        }

        if (challenge.getSeed() != request.challengeSeed()) {
            validationNotes.add("Submitted challengeSeed does not match server seed for challenge date");
        }
    }

    private void validateScorePlausibility(RunSubmissionRequest request, List<String> validationNotes) {
        double multiplier = switch (request.difficulty()) {
            case STANDARD -> 1.0;
            case HARDENED -> 1.25;
            case NIGHTMARE -> 1.5;
        };

        int expectedBase = request.processedCount() * 10
                + request.waveReached() * 100
                + (request.survivalSeconds() * 2);

        int projectedScore = (int) Math.round(expectedBase * multiplier);
        int tolerance = 400;
        if (Math.abs(request.score() - projectedScore) > tolerance) {
            validationNotes.add("Score is outside plausibility tolerance (expected about " + projectedScore + ")");
        }
    }

    private LeaderboardEntryResponse toLeaderboardEntry(GameRun run) {
        return new LeaderboardEntryResponse(
                run.getId(),
                run.getNicknameSnapshot(),
                run.getScore(),
                run.getDifficulty(),
                run.getMode(),
                run.getCreatedAt()
        );
    }
}
