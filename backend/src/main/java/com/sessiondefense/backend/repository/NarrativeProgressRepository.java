package com.sessiondefense.backend.repository;

import com.sessiondefense.backend.domain.entity.NarrativeProgress;
import com.sessiondefense.backend.domain.entity.PlayerProfile;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NarrativeProgressRepository extends JpaRepository<NarrativeProgress, UUID> {
    List<NarrativeProgress> findByPlayerProfileOrderBySeenAtAsc(PlayerProfile playerProfile);

    Optional<NarrativeProgress> findByPlayerProfileAndBeatKey(PlayerProfile playerProfile, String beatKey);
}
