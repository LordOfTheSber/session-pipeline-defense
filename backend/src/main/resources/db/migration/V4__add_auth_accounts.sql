CREATE TABLE auth_accounts (
    id UUID PRIMARY KEY,
    player_profile_id UUID NOT NULL UNIQUE,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(120) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_auth_accounts_player_profile
        FOREIGN KEY (player_profile_id)
        REFERENCES player_profiles(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_auth_accounts_email ON auth_accounts (email);
