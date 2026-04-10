package com.sessiondefense.backend.repository;

import com.sessiondefense.backend.domain.entity.Difficulty;
import com.sessiondefense.backend.domain.entity.GameRun;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameRunRepository extends JpaRepository<GameRun, UUID> {
    List<GameRun> findByDifficultyOrderByScoreDescCreatedAtDesc(Difficulty difficulty, Pageable pageable);

    List<GameRun> findByChallengeDateAndDifficultyOrderByScoreDescCreatedAtDesc(
            LocalDate challengeDate,
            Difficulty difficulty,
            Pageable pageable
    );
}
