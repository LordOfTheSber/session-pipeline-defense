package com.sessiondefense.backend.controller;

import com.sessiondefense.backend.dto.NarrativeSeenRequest;
import com.sessiondefense.backend.dto.NarrativeStateResponse;
import com.sessiondefense.backend.service.NarrativeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/narrative")
public class NarrativeController {

    private final NarrativeService narrativeService;

    public NarrativeController(NarrativeService narrativeService) {
        this.narrativeService = narrativeService;
    }

    @GetMapping("/state")
    public NarrativeStateResponse getState(
            @RequestParam @NotBlank @Size(max = 50) String nickname
    ) {
        return narrativeService.getState(nickname);
    }

    @PostMapping("/seen")
    public NarrativeStateResponse markSeen(@RequestBody @Valid NarrativeSeenRequest request) {
        return narrativeService.markSeen(request);
    }
}
