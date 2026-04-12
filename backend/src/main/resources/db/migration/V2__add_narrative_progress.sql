CREATE TABLE narrative_progress (
    id UUID PRIMARY KEY,
    player_profile_id UUID NOT NULL,
    beat_key VARCHAR(100) NOT NULL,
    seen_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_narrative_progress_player_profile
        FOREIGN KEY (player_profile_id)
        REFERENCES player_profiles(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_narrative_progress_player_beat UNIQUE (player_profile_id, beat_key)
);

CREATE INDEX idx_narrative_progress_player_seen_at
    ON narrative_progress (player_profile_id, seen_at DESC);
