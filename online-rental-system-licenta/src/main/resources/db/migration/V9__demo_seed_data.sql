-- Demo seed data for a fresh database (e.g. the Docker Postgres).
-- Safe on an existing DB: users are inserted only if missing, products only if
-- the catalog has fewer than 50 items, rentals/reviews only if there are none.
-- Demo accounts (password Demo1234!): admin, vendor.demo, ana.popescu, mihai.ionescu, elena.dumitru
-- Super owner: Robert_blehoianu / 12345678 (same account DatabaseSeedConfig creates).

INSERT INTO users (username, email, password, first_name, last_name, verified, city, country, phone, created_at)
VALUES
  ('Robert_blehoianu', 'Robert_blehoianu@yahoo.com', '$2a$10$mb5wPtbBwGTqSbnhyuWLceaDdTqVb0H5mjizyHwcA7iUl9i6syXmO', 'Robert', 'Blehoianu', TRUE, 'București', 'România', '+40 700 000 001', NOW() - INTERVAL '120 days'),
  ('admin',            'admin@online-rental.local',  '$2a$10$jwu0shawDDaoY4ivF27D5.uArnm9KkQ62rRw1RXaOrtsUQS1c2rpO', 'Admin', 'Demo',       TRUE, 'București', 'România', '+40 700 000 002', NOW() - INTERVAL '110 days'),
  ('vendor.demo',      'vendor@online-rental.local', '$2a$10$jwu0shawDDaoY4ivF27D5.uArnm9KkQ62rRw1RXaOrtsUQS1c2rpO', 'Victor', 'Marinescu', TRUE, 'Cluj-Napoca', 'România', '+40 700 000 003', NOW() - INTERVAL '100 days'),
  ('ana.popescu',      'ana.popescu@example.com',    '$2a$10$jwu0shawDDaoY4ivF27D5.uArnm9KkQ62rRw1RXaOrtsUQS1c2rpO', 'Ana', 'Popescu',      TRUE, 'Brașov', 'România', '+40 711 111 111', NOW() - INTERVAL '90 days'),
  ('mihai.ionescu',    'mihai.ionescu@example.com',  '$2a$10$jwu0shawDDaoY4ivF27D5.uArnm9KkQ62rRw1RXaOrtsUQS1c2rpO', 'Mihai', 'Ionescu',    TRUE, 'Iași', 'România', '+40 722 222 222', NOW() - INTERVAL '75 days'),
  ('elena.dumitru',    'elena.dumitru@example.com',  '$2a$10$jwu0shawDDaoY4ivF27D5.uArnm9KkQ62rRw1RXaOrtsUQS1c2rpO', 'Elena', 'Dumitru',    TRUE, 'Timișoara', 'România', '+40 733 333 333', NOW() - INTERVAL '60 days')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT u.id, r.role
FROM (VALUES
  ('Robert_blehoianu', 'ROLE_CLIENT'), ('Robert_blehoianu', 'ROLE_VENDOR'),
  ('Robert_blehoianu', 'ROLE_ADMIN'),  ('Robert_blehoianu', 'ROLE_SUPEROWNER'),
  ('admin', 'ROLE_CLIENT'), ('admin', 'ROLE_ADMIN'),
  ('vendor.demo', 'ROLE_CLIENT'), ('vendor.demo', 'ROLE_VENDOR'),
  ('ana.popescu', 'ROLE_CLIENT'), ('mihai.ionescu', 'ROLE_CLIENT'), ('elena.dumitru', 'ROLE_CLIENT')
) AS r(username, role)
JOIN users u ON u.username = r.username
ON CONFLICT DO NOTHING;

-- Catalog: the same 50 products as V4 (V4 skips on a fresh DB because no users exist yet),
-- with two inventory units each and category images.
DO $$
DECLARE
  owner_id  BIGINT;
  vendor_id BIGINT;
BEGIN
  IF (SELECT COUNT(*) FROM products) >= 50 THEN
    RAISE NOTICE 'Product seed skipped: catalog already has >= 50 products.';
    RETURN;
  END IF;

  SELECT id INTO owner_id  FROM users WHERE username = 'Robert_blehoianu';
  SELECT id INTO vendor_id FROM users WHERE username = 'vendor.demo';

  WITH seed_data AS (
    SELECT ROW_NUMBER() OVER () AS n, t.*
    FROM (VALUES
      ('Sony Alpha 7 III','Full-frame mirrorless cu 24.2MP și stabilizare 5 axe',180.00,'Camera','Sony','Alpha 7 III',0),
      ('Canon EOS R5','45MP sensor cu înregistrare video 8K RAW',220.00,'Camera','Canon','EOS R5',0),
      ('Nikon Z9','45.7MP mirrorless fără obturator mecanic',260.00,'Camera','Nikon','Z9',0),
      ('DJI Pocket 3','Gimbal camera compact cu stabilizare AI',140.00,'Camera','DJI','Pocket 3',0),
      ('GoPro HERO12','Action cam 5.3K, stabilizare avansată',120.00,'Camera','GoPro','HERO12',0),
      ('Sigma 24-70mm f/2.8','Obiectiv versatil pentru portrete și travel',90.00,'Lens','Sigma','24-70mm f/2.8',0),
      ('Sony 70-200mm f/2.8','Teleobiectiv pentru sport și evenimente',150.00,'Lens','Sony','70-200mm f/2.8',0),
      ('Canon RF 50mm f/1.2','Prime luminos pentru portrete',110.00,'Lens','Canon','RF 50mm f/1.2',0),
      ('Nikon 14-24mm f/2.8','Ultra-wide pentru peisaj/arhitectură',130.00,'Lens','Nikon','14-24mm f/2.8',0),
      ('DJI Air 3','Dronă dual camera, 4K HDR',210.00,'Drone','DJI','Air 3',0),
      ('DJI Mini 4 Pro','Dronă compactă, 4K, sub 249g',190.00,'Drone','DJI','Mini 4 Pro',0),
      ('Autel EVO Lite+','Dronă 6K cu performanță nocturnă',200.00,'Drone','Autel','EVO Lite+',0),
      ('Rode Wireless GO II','Microfon wireless dual-channel',60.00,'Audio','Rode','Wireless GO II',0),
      ('Shure SM7B','Microfon dinamic pentru podcast/voice',70.00,'Audio','Shure','SM7B',0),
      ('Zoom H6','Recorder portabil multi-track',55.00,'Audio','Zoom','H6',0),
      ('LED Panel 120W','Lumină continuă cu temperatură ajustabilă',45.00,'Lighting','Aputure','120W Panel',0),
      ('Softbox 90cm','Softbox octagonal pentru lumină difuză',20.00,'Lighting','Godox','Octa 90',0),
      ('Tripod Carbon','Trepied carbon, cap fluid',35.00,'Accessories','Manfrotto','Carbon Pro',0),
      ('Gimbal RS 4','Gimbal profesional pentru camere mirrorless',85.00,'Accessories','DJI','RS 4',0),
      ('Laptop Ultraportabil','Laptop performant pentru editare și office',171.00,'Laptop','Lenovo','ThinkPad X1',0),
      ('MacBook Pro 14','Laptop editare video/foto',240.00,'Laptop','Apple','MacBook Pro 14',0),
      ('Surface Laptop 5','Laptop business ușor',160.00,'Laptop','Microsoft','Surface 5',0),
      ('Projector 4K','Proiector home cinema 4K HDR',180.00,'Projector','BenQ','TK700',0),
      ('Projector Portable','Proiector portabil, baterie',95.00,'Projector','Anker','Nebula',0),
      ('VR Headset','Căști VR standalone',110.00,'VR','Meta','Quest 3',0),
      ('PS5 Console','Consolă gaming',130.00,'Console','Sony','PlayStation 5',0),
      ('Xbox Series X','Consolă gaming 4K',120.00,'Console','Microsoft','Series X',0),
      ('Nintendo Switch','Consolă portabilă',70.00,'Console','Nintendo','Switch',0),
      ('Portable Speaker','Boxă portabilă cu bass puternic',35.00,'Audio','JBL','Boombox',0),
      ('Studio Monitor Pair','Monitoare studio pentru mix',65.00,'Audio','KRK','Rokit 5',0),
      ('Camera Backpack','Rucsac foto cu compartimente',15.00,'Accessories','Peak Design','Everyday',0),
      ('Power Station 1000W','Stație portabilă energie',90.00,'Accessories','EcoFlow','River',0),
      ('Mirrorless Body','Body mirrorless compact',120.00,'Camera','Fujifilm','X-T5',0),
      ('Instant Camera','Cameră instant',25.00,'Camera','Fujifilm','Instax',0),
      ('Camcorder 4K','Cameră video 4K pentru evenimente',150.00,'Camera','Panasonic','HC-X1500',0),
      ('Webcam 4K','Webcam 4K pentru streaming',20.00,'Camera','Logitech','Brio',0),
      ('Green Screen','Fundal verde pliabil',18.00,'Lighting','Neewer','GreenScreen',0),
      ('Teleprompter','Teleprompter pentru prezentări',30.00,'Accessories','Desview','TP',0),
      ('Photo Printer','Imprimantă foto compactă',28.00,'Accessories','Canon','Selphy',0),
      ('NAS 2-Bay','Storage pentru backup media',55.00,'Accessories','Synology','DS223',0),
      ('Router WiFi 6','Router rapid pentru streaming',18.00,'Accessories','TP-Link','AX3000',0),
      ('Monitor 27 4K','Monitor 4K pentru editare',45.00,'Accessories','LG','27UL',0),
      ('Tablet iPad Air','Tabletă pentru notițe și prezentări',55.00,'Tablet','Apple','iPad Air',0),
      ('Android Tablet','Tabletă multimedia',35.00,'Tablet','Samsung','Tab S9',0),
      ('eReader Kindle','Reader pentru lectură',15.00,'Accessories','Amazon','Kindle',0),
      ('Action Lens Kit','Set accesorii obiective pentru action cam',12.00,'Accessories','GoPro','Lens Kit',0),
      ('Camera Battery Kit','Set baterii + încărcător',10.00,'Accessories','Sony','NP-FZ100',0),
      ('Lens Filter Kit','Filtre ND/Polarizare',14.00,'Accessories','K&F','Filter Kit',0)
    ) AS t(name, description, daily_price, category, brand, model, discount_percent)
  ),
  inserted AS (
    INSERT INTO products (owner_id, name, description, daily_price, category, brand, model, discount_percent, created_at)
    SELECT
      CASE WHEN s.n % 4 = 0 THEN vendor_id ELSE owner_id END,
      s.name, s.description, s.daily_price::numeric(12,2), s.category, s.brand, s.model,
      (CASE WHEN s.n % 7 = 0 THEN 10 WHEN s.n % 11 = 0 THEN 15 ELSE s.discount_percent END)::numeric(5,2),
      NOW() - (s.n || ' days')::interval
    FROM seed_data s
    WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.name = s.name)
    RETURNING id
  )
  INSERT INTO inventory_units (product_id, serial_number, status, created_at)
  SELECT i.id, 'INV-' || i.id::text || '-' || u.suffix, 'AVAILABLE', NOW()
  FROM inserted i
  CROSS JOIN (VALUES ('A'), ('B')) AS u(suffix);

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
  END
  WHERE image_url IS NULL;
END $$;

-- Sample rentals in every lifecycle state, plus reviews for the finished ones.
DO $$
DECLARE
  r       RECORD;
  unit_id BIGINT;
  price   NUMERIC(12,2);
  days    INT;
BEGIN
  IF EXISTS (SELECT 1 FROM rentals) THEN
    RAISE NOTICE 'Rental seed skipped: rentals already exist.';
    RETURN;
  END IF;

  FOR r IN
    SELECT * FROM (VALUES
      ('ana.popescu',   'Sony Alpha 7 III',    -40, -35, 'COMPLETED', 'PERSONAL_PICKUP', 5, 'Aparat impecabil, recomand!'),
      ('ana.popescu',   'GoPro HERO12',        -20, -17, 'COMPLETED', 'DELIVERY',        4, 'Foarte bună pentru vacanță.'),
      ('mihai.ionescu', 'Canon EOS R5',        -30, -26, 'COMPLETED', 'DELIVERY',        5, 'Calitate excelentă a imaginii.'),
      ('elena.dumitru', 'DJI Pocket 3',        -15, -12, 'COMPLETED', 'PERSONAL_PICKUP', 4, NULL),
      ('mihai.ionescu', 'Nikon Z9',             -3,   4, 'ACTIVE',    'DELIVERY',        NULL, NULL),
      ('elena.dumitru', 'Sigma 24-70mm f/2.8',  -2,   3, 'ACTIVE',    'PERSONAL_PICKUP', NULL, NULL),
      ('ana.popescu',   'Canon EOS R5',          5,   9, 'CONFIRMED', 'DELIVERY',        NULL, NULL),
      ('elena.dumitru', 'Sony Alpha 7 III',     10,  14, 'PENDING',   'PERSONAL_PICKUP', NULL, NULL),
      ('mihai.ionescu', 'GoPro HERO12',        -10,  -8, 'CANCELED',  'PERSONAL_PICKUP', NULL, NULL)
    ) AS t(username, product_name, start_off, end_off, status, delivery, rating, comment)
  LOOP
    unit_id := NULL;
    SELECT i.id, p.daily_price INTO unit_id, price
    FROM inventory_units i JOIN products p ON p.id = i.product_id
    WHERE p.name = r.product_name AND i.status = 'AVAILABLE'
    ORDER BY i.id LIMIT 1;
    CONTINUE WHEN unit_id IS NULL;

    days := r.end_off - r.start_off;

    INSERT INTO rentals (user_id, inventory_id, start_date, end_date, actual_return_date, status,
                         total_price, deposit_amount, deposit_returned, item_condition,
                         delivery_type, delivery_address, delivery_phone, delivery_status, created_at)
    SELECT u.id, unit_id,
           CURRENT_DATE + r.start_off, CURRENT_DATE + r.end_off,
           CASE WHEN r.status = 'COMPLETED' THEN CURRENT_DATE + r.end_off END,
           r.status,
           price * days, ROUND(price * days * 0.2, 2),
           r.status = 'COMPLETED',
           CASE WHEN r.status = 'COMPLETED' THEN 'GOOD' ELSE 'PENDING_CHECK' END,
           r.delivery,
           CASE WHEN r.delivery = 'DELIVERY' THEN 'Str. Exemplu nr. 10, ' || u.city END,
           CASE WHEN r.delivery = 'DELIVERY' THEN u.phone END,
           CASE WHEN r.delivery <> 'DELIVERY' THEN NULL
                WHEN r.status = 'COMPLETED' THEN 'RETURNED'
                WHEN r.status = 'ACTIVE' THEN 'DELIVERED'
                ELSE 'PENDING' END,
           NOW() + ((r.start_off - 2) || ' days')::interval
    FROM users u WHERE u.username = r.username;

    IF r.status = 'ACTIVE' THEN
      UPDATE inventory_units SET status = 'ON_RENTAL', updated_at = NOW() WHERE id = unit_id;
    END IF;

    IF r.rating IS NOT NULL THEN
      INSERT INTO product_reviews (product_id, user_id, rating, comment, created_at)
      SELECT p.id, u.id, r.rating, r.comment, NOW() + (r.end_off || ' days')::interval
      FROM products p, users u
      WHERE p.name = r.product_name AND u.username = r.username
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;
