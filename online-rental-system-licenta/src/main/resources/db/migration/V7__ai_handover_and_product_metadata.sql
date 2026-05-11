ALTER TABLE products
    ADD COLUMN ai_tags TEXT,
    ADD COLUMN weight_kg NUMERIC(8,3),
    ADD COLUMN thickness_mm NUMERIC(8,2),
    ADD COLUMN color_detected VARCHAR(128),
    ADD COLUMN detected_brand VARCHAR(128),
    ADD COLUMN detected_model VARCHAR(128),
    ADD COLUMN model_confidence NUMERIC(6,3);

CREATE TABLE rental_handover_sessions (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    stage VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    started_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE rental_photo_verifications (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    stage VARCHAR(32) NOT NULL,
    triggered_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    damage_score NUMERIC(6,3),
    new_damage_score NUMERIC(6,3),
    model_match_score NUMERIC(6,3),
    ocr_text TEXT,
    power_on_detected BOOLEAN,
    error_codes_detected BOOLEAN,
    error_codes TEXT,
    detected_brand VARCHAR(128),
    detected_model VARCHAR(128),
    serial_number_detected VARCHAR(255),
    verdict VARCHAR(32) NOT NULL,
    needs_review BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT,
    raw_response TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_handover_sessions_rental ON rental_handover_sessions(rental_id);
CREATE INDEX idx_photo_verifications_rental ON rental_photo_verifications(rental_id);
