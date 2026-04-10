package com.sessiondefense.backend.repository;

import com.sessiondefense.backend.domain.entity.DailyChallenge;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyChallengeRepository extends JpaRepository<DailyChallenge, UUID> {
    Optional<DailyChallenge> findByChallengeDate(LocalDate challengeDate);
}
