-- Products without any inventory cannot be rented. Backfill one AVAILABLE unit per such product
-- (common when products were created via API/UI, which did not create inventory rows).
INSERT INTO inventory_units (product_id, serial_number, status, created_at)
SELECT p.id,
       'STOCK-' || p.id::text || '-1',
       'AVAILABLE',
       NOW()
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM inventory_units i WHERE i.product_id = p.id);
