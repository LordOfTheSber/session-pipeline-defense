package com.sessiondefense.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "game_runs")
public class GameRun {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_profile_id")
    private PlayerProfile playerProfile;

    @Column(name = "nickname_snapshot", nullable = false, length = 50)
    private String nicknameSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GameMode mode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty;

    @Column(name = "challenge_date")
    private LocalDate challengeDate;

    @Column(name = "challenge_seed")
    private Long challengeSeed;

    @Column(name = "survival_seconds", nullable = false)
    private int survivalSeconds;

    @Column(name = "processed_count", nullable = false)
    private int processedCount;

    @Column(name = "wave_reached", nullable = false)
    private int waveReached;

    @Column(name = "active_session_peak", nullable = false)
    private int activeSessionPeak;

    @Column(name = "credits_spent", nullable = false)
    private int creditsSpent;

    @Column(name = "system_health_end", nullable = false)
    private int systemHealthEnd;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private boolean suspicious;

    @Column(name = "validation_notes")
    private String validationNotes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public PlayerProfile getPlayerProfile() {
        return playerProfile;
    }

    public void setPlayerProfile(PlayerProfile playerProfile) {
        this.playerProfile = playerProfile;
    }

    public String getNicknameSnapshot() {
        return nicknameSnapshot;
    }

    public void setNicknameSnapshot(String nicknameSnapshot) {
        this.nicknameSnapshot = nicknameSnapshot;
    }

    public GameMode getMode() {
        return mode;
    }

    public void setMode(GameMode mode) {
        this.mode = mode;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public LocalDate getChallengeDate() {
        return challengeDate;
    }

    public void setChallengeDate(LocalDate challengeDate) {
        this.challengeDate = challengeDate;
    }

    public Long getChallengeSeed() {
        return challengeSeed;
    }

    public void setChallengeSeed(Long challengeSeed) {
        this.challengeSeed = challengeSeed;
    }

    public int getSurvivalSeconds() {
        return survivalSeconds;
    }

    public void setSurvivalSeconds(int survivalSeconds) {
        this.survivalSeconds = survivalSeconds;
    }

    public int getProcessedCount() {
        return processedCount;
    }

    public void setProcessedCount(int processedCount) {
        this.processedCount = processedCount;
    }

    public int getWaveReached() {
        return waveReached;
    }

    public void setWaveReached(int waveReached) {
        this.waveReached = waveReached;
    }

    public int getActiveSessionPeak() {
        return activeSessionPeak;
    }

    public void setActiveSessionPeak(int activeSessionPeak) {
        this.activeSessionPeak = activeSessionPeak;
    }

    public int getCreditsSpent() {
        return creditsSpent;
    }

    public void setCreditsSpent(int creditsSpent) {
        this.creditsSpent = creditsSpent;
    }

    public int getSystemHealthEnd() {
        return systemHealthEnd;
    }

    public void setSystemHealthEnd(int systemHealthEnd) {
        this.systemHealthEnd = systemHealthEnd;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public boolean isSuspicious() {
        return suspicious;
    }

    public void setSuspicious(boolean suspicious) {
        this.suspicious = suspicious;
    }

    public String getValidationNotes() {
        return validationNotes;
    }

    public void setValidationNotes(String validationNotes) {
        this.validationNotes = validationNotes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
