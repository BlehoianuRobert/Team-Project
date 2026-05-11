-- Replace generic placeholders with category-relevant product photos.
-- Keeps deterministic URLs and updates all products in catalog.
UPDATE products
SET image_url = CASE
    WHEN lower(category) = 'camera' THEN 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80'
    WHEN lower(category) = 'lens' THEN 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1400&q=80'
    WHEN lower(category) = 'drone' THEN 'https://images.unsplash.com/photo-1508614999368-9260051292e5?auto=format&fit=crop&w=1400&q=80'
    WHEN lower(category) = 'audio' THEN 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=1400&q=80'
    WHEN lower(category) = 'lighting' THEN 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80'
    WHEN lower(category) = 'accessories' THEN 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1400&q=80'
    WHEN lower(category) = 'laptop' THEN 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=80'
    WHEN lower(category) = 'projector' THEN 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1400&q=80'
    WHEN lower(category) = 'vr' THEN 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=1400&q=80'
    WHEN lower(category) = 'console' THEN 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=1400&q=80'
    WHEN lower(category) = 'tablet' THEN 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1400&q=80'
    ELSE 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=80'
END;

