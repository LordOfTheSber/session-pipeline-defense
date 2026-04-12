package com.sessiondefense.backend.dto;

import java.util.List;

public record NarrativeStateResponse(
        String nickname,
        List<String> seenBeatKeys
) {
}
