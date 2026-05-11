ALTER TABLE rentals
    ADD COLUMN return_requested BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN return_requested_at TIMESTAMPTZ,
    ADD COLUMN return_requested_by BIGINT REFERENCES users(id),
    ADD COLUMN flagged_for_review BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN ai_comparison_score NUMERIC(6,3),
    ADD COLUMN ai_predicted_condition VARCHAR(64),
    ADD COLUMN ai_last_run_at TIMESTAMPTZ;

CREATE TABLE rental_baseline_images (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    image_url VARCHAR(1024) NOT NULL,
    uploaded_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rental_return_images (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    image_url VARCHAR(1024) NOT NULL,
    uploaded_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rental_ai_comparisons (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    triggered_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(6,3),
    predicted_condition VARCHAR(64),
    needs_review BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(32) NOT NULL,
    message TEXT,
    raw_response TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rental_baseline_images_rental ON rental_baseline_images(rental_id);
CREATE INDEX idx_rental_return_images_rental ON rental_return_images(rental_id);
CREATE INDEX idx_rental_ai_comparisons_rental ON rental_ai_comparisons(rental_id);
