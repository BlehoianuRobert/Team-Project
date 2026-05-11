DO $$
DECLARE
  owner_id BIGINT;
  existing_count INT;
BEGIN
  SELECT COUNT(*) INTO existing_count FROM products;
  IF existing_count >= 50 THEN
    RAISE NOTICE 'Seed skipped: products already >= 50 (%).', existing_count;
    RETURN;
  END IF;

  -- Prefer a catalog-capable user (SUPEROWNER/ADMIN/VENDOR); fallback to any user.
  SELECT u.id
  INTO owner_id
  FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  WHERE ur.role IN ('ROLE_SUPEROWNER', 'ROLE_ADMIN', 'ROLE_VENDOR')
  ORDER BY u.id
  LIMIT 1;

  IF owner_id IS NULL THEN
    SELECT id INTO owner_id FROM users ORDER BY id LIMIT 1;
  END IF;

  IF owner_id IS NULL THEN
    RAISE NOTICE 'Seed skipped: no users found.';
    RETURN;
  END IF;

  -- Insert 50 demo products.
  WITH seed_data AS (
    SELECT *
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
    INSERT INTO products(owner_id, name, description, daily_price, category, brand, model, image_url, discount_percent, created_at)
    SELECT
      owner_id,
      s.name,
      s.description,
      s.daily_price::numeric(12,2),
      s.category,
      s.brand,
      s.model,
      NULL,
      s.discount_percent::numeric(5,2),
      NOW()
    FROM seed_data s
    RETURNING id, name
  )
  INSERT INTO inventory_units(product_id, serial_number, status, created_at)
  SELECT
    i.id,
    'INV-' || i.id::text || '-A',
    'AVAILABLE',
    NOW()
  FROM inserted i;

  RAISE NOTICE 'Seeded demo products + inventory. Owner id=%', owner_id;
END $$;

