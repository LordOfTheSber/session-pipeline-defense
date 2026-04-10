package com.sessiondefense.backend.dto;

import java.util.UUID;

public record RunSubmissionResponse(
        UUID id,
        boolean suspicious,
        String validationNotes
) {
}
