package com.sessiondefense.backend.service;

import com.sessiondefense.backend.domain.entity.NarrativeProgress;
import com.sessiondefense.backend.domain.entity.PlayerProfile;
import com.sessiondefense.backend.dto.NarrativeSeenRequest;
import com.sessiondefense.backend.dto.NarrativeStateResponse;
import com.sessiondefense.backend.repository.NarrativeProgressRepository;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NarrativeService {

    private final NarrativeProgressRepository narrativeProgressRepository;
    private final PlayerProfileService playerProfileService;

    public NarrativeService(
            NarrativeProgressRepository narrativeProgressRepository,
            PlayerProfileService playerProfileService
    ) {
        this.narrativeProgressRepository = narrativeProgressRepository;
        this.playerProfileService = playerProfileService;
    }

    @Transactional(readOnly = true)
    public NarrativeStateResponse getState(String nickname) {
        PlayerProfile profile = playerProfileService.getOrCreateByNickname(nickname, null);

        var seenBeatKeys = narrativeProgressRepository
                .findByPlayerProfileOrderBySeenAtAsc(profile)
                .stream()
                .map(NarrativeProgress::getBeatKey)
                .toList();

        return new NarrativeStateResponse(profile.getNickname(), seenBeatKeys);
    }

    @Transactional
    public NarrativeStateResponse markSeen(NarrativeSeenRequest request) {
        String normalizedNickname = request.nickname().trim();
        String normalizedBeatKey = request.beatKey().trim();

        PlayerProfile profile = playerProfileService.getOrCreateByNickname(normalizedNickname, null);

        narrativeProgressRepository
                .findByPlayerProfileAndBeatKey(profile, normalizedBeatKey)
                .orElseGet(() -> {
                    NarrativeProgress progress = new NarrativeProgress();
                    progress.setId(UUID.randomUUID());
                    progress.setPlayerProfile(profile);
                    progress.setBeatKey(normalizedBeatKey);
                    progress.setSeenAt(Instant.now());
                    return narrativeProgressRepository.save(progress);
                });

        return getState(profile.getNickname());
    }
}
