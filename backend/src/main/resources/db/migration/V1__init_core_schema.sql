CREATE TABLE player_profiles (
    id UUID PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL UNIQUE,
    preferred_difficulty VARCHAR(20),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE daily_challenges (
    id UUID PRIMARY KEY,
    challenge_date DATE NOT NULL UNIQUE,
    seed BIGINT NOT NULL,
    config_json JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE game_runs (
    id UUID PRIMARY KEY,
    player_profile_id UUID,
    nickname_snapshot VARCHAR(50) NOT NULL,
    mode VARCHAR(20) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    challenge_date DATE,
    challenge_seed BIGINT,
    survival_seconds INTEGER NOT NULL,
    processed_count INTEGER NOT NULL,
    wave_reached INTEGER NOT NULL,
    active_session_peak INTEGER NOT NULL,
    credits_spent INTEGER NOT NULL,
    system_health_end INTEGER NOT NULL,
    score INTEGER NOT NULL,
    suspicious BOOLEAN NOT NULL DEFAULT FALSE,
    validation_notes TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_game_runs_player_profile
        FOREIGN KEY (player_profile_id)
        REFERENCES player_profiles(id)
);

CREATE INDEX idx_game_runs_global ON game_runs (score DESC, created_at DESC);
CREATE INDEX idx_game_runs_daily ON game_runs (challenge_date, score DESC);
CREATE INDEX idx_game_runs_nickname ON game_runs (nickname_snapshot, created_at DESC);
