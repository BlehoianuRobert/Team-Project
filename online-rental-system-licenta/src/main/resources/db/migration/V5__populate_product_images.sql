-- Ensure all products have an image URL.
-- Uses deterministic Picsum seeds so URLs stay stable.
UPDATE products
SET image_url = CONCAT('https://picsum.photos/seed/online-rental-product-', id::text, '/1200/900')
WHERE image_url IS NULL OR BTRIM(image_url) = '';

