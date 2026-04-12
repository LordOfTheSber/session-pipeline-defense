package com.sessiondefense.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "daily_challenges")
public class DailyChallenge {

    @Id
    private UUID id;

    @Column(name = "challenge_date", nullable = false, unique = true)
    private LocalDate challengeDate;

    @Column(nullable = false)
    private long seed;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config_json", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> configJson;

    @Column(name = "log_title", nullable = false, length = 180)
    private String logTitle;

    @Column(name = "log_excerpt", nullable = false, columnDefinition = "text")
    private String logExcerpt;

    @Column(name = "act_reference", nullable = false, length = 64)
    private String actReference;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public LocalDate getChallengeDate() {
        return challengeDate;
    }

    public void setChallengeDate(LocalDate challengeDate) {
        this.challengeDate = challengeDate;
    }

    public long getSeed() {
        return seed;
    }

    public void setSeed(long seed) {
        this.seed = seed;
    }

    public Map<String, Object> getConfigJson() {
        return configJson;
    }

    public void setConfigJson(Map<String, Object> configJson) {
        this.configJson = configJson;
    }

    public String getLogTitle() {
        return logTitle;
    }

    public void setLogTitle(String logTitle) {
        this.logTitle = logTitle;
    }

    public String getLogExcerpt() {
        return logExcerpt;
    }

    public void setLogExcerpt(String logExcerpt) {
        this.logExcerpt = logExcerpt;
    }

    public String getActReference() {
        return actReference;
    }

    public void setActReference(String actReference) {
        this.actReference = actReference;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
