package com.sessiondefense.backend.service;

import com.sessiondefense.backend.domain.entity.Difficulty;
import com.sessiondefense.backend.domain.entity.PlayerProfile;
import com.sessiondefense.backend.dto.PlayerProfileResponse;
import com.sessiondefense.backend.dto.PlayerProfileUpsertRequest;
import com.sessiondefense.backend.repository.PlayerProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class PlayerProfileService {

    private final PlayerProfileRepository playerProfileRepository;

    public PlayerProfileService(PlayerProfileRepository playerProfileRepository) {
        this.playerProfileRepository = playerProfileRepository;
    }

    public PlayerProfile getOrCreateByNickname(String nickname, Difficulty preferredDifficulty) {
        String normalizedNickname = nickname.trim();

        return playerProfileRepository.findByNicknameIgnoreCase(normalizedNickname)
                .map(existing -> {
                    if (preferredDifficulty != null && existing.getPreferredDifficulty() != preferredDifficulty) {
                        existing.setPreferredDifficulty(preferredDifficulty);
                        existing.setUpdatedAt(Instant.now());
                        return playerProfileRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    PlayerProfile profile = new PlayerProfile();
                    profile.setId(UUID.randomUUID());
                    profile.setNickname(normalizedNickname);
                    profile.setPreferredDifficulty(preferredDifficulty == null ? Difficulty.STANDARD : preferredDifficulty);
                    profile.setCreatedAt(Instant.now());
                    profile.setUpdatedAt(Instant.now());
                    return playerProfileRepository.save(profile);
                });
    }

    public PlayerProfileResponse upsert(PlayerProfileUpsertRequest request) {
        PlayerProfile profile = getOrCreateByNickname(request.nickname(), request.preferredDifficulty());

        return new PlayerProfileResponse(
                profile.getId(),
                profile.getNickname(),
                profile.getPreferredDifficulty(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    public PlayerProfileResponse getByNickname(String nickname) {
        PlayerProfile profile = playerProfileRepository.findByNicknameIgnoreCase(nickname.trim())
                .orElseThrow(() -> new EntityNotFoundException("Player not found for nickname: " + nickname));

        return new PlayerProfileResponse(
                profile.getId(),
                profile.getNickname(),
                profile.getPreferredDifficulty(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
