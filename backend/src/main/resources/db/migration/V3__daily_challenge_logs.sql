ALTER TABLE daily_challenges
    ADD COLUMN log_title VARCHAR(180),
    ADD COLUMN log_excerpt TEXT,
    ADD COLUMN act_reference VARCHAR(64);

UPDATE daily_challenges
SET log_title = 'Recovered Log — Pending Reconstruction',
    log_excerpt = 'Archive fragment unavailable for this legacy challenge row.',
    act_reference = 'ACT_II_CONTAINMENT'
WHERE log_title IS NULL OR log_excerpt IS NULL OR act_reference IS NULL;

ALTER TABLE daily_challenges
    ALTER COLUMN log_title SET NOT NULL,
    ALTER COLUMN log_excerpt SET NOT NULL,
    ALTER COLUMN act_reference SET NOT NULL;
