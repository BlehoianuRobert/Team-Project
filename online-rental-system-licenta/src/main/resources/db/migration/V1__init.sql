CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    token_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    daily_price NUMERIC(12, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    image_url VARCHAR(1024),
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE inventory_units (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    serial_number VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT uq_inventory_serial_per_product UNIQUE (product_id, serial_number)
);

CREATE TABLE rentals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    inventory_id BIGINT NOT NULL REFERENCES inventory_units (id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_return_date DATE,
    status VARCHAR(32) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    deposit_returned BOOLEAN NOT NULL DEFAULT FALSE,
    item_condition VARCHAR(32) NOT NULL DEFAULT 'PENDING_CHECK',
    condition_notes TEXT,
    delivery_type VARCHAR(32),
    awb_number VARCHAR(128),
    delivery_address TEXT,
    delivery_phone VARCHAR(64),
    delivery_status VARCHAR(32),
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    pickup_date DATE,
    two_day_delivery BOOLEAN,
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT uq_review_user_product UNIQUE (product_id, user_id)
);

CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_owner ON products (owner_id);
CREATE INDEX idx_inventory_product ON inventory_units (product_id);
CREATE INDEX idx_rentals_user ON rentals (user_id);
CREATE INDEX idx_rentals_inventory ON rentals (inventory_id);
