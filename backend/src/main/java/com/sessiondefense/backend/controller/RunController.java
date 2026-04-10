package com.sessiondefense.backend.controller;

import com.sessiondefense.backend.dto.RunDetailResponse;
import com.sessiondefense.backend.dto.RunSubmissionRequest;
import com.sessiondefense.backend.dto.RunSubmissionResponse;
import com.sessiondefense.backend.service.RunService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/runs")
public class RunController {

    private final RunService runService;

    public RunController(RunService runService) {
        this.runService = runService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RunSubmissionResponse submitRun(@RequestBody @Valid RunSubmissionRequest request) {
        return runService.submitRun(request);
    }

    @GetMapping("/{id}")
    public RunDetailResponse getRunById(@PathVariable("id") UUID id) {
        return runService.getRun(id);
    }
}
