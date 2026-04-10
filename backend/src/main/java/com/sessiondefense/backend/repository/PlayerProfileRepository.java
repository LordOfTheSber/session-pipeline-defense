package com.sessiondefense.backend.repository;

import com.sessiondefense.backend.domain.entity.PlayerProfile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlayerProfileRepository extends JpaRepository<PlayerProfile, UUID> {
    Optional<PlayerProfile> findByNickname(String nickname);
}
