-- 1. Add the column to the products table
ALTER TABLE products ADD COLUMN is_alert_acknowledged BOOLEAN DEFAULT false;

-- 2. Drop and recreate the view to include the new column and updated status logic
DROP VIEW IF EXISTS product_stock_metrics;

CREATE VIEW product_stock_metrics AS
SELECT 
    p.id,
    p.product_name,
    p.unit,
    p.initial_stock,
    p.min_stock,
    p.is_alert_acknowledged,
    p.created_at,
    COALESCE(SUM(sa.quantity_added), 0) AS total_added,
    COALESCE(SUM(sl.quantity), 0) AS total_consumed,
    p.initial_stock + COALESCE(SUM(sa.quantity_added), 0) - COALESCE(SUM(sl.quantity), 0) AS current_stock,
    CASE
        WHEN p.initial_stock + COALESCE(SUM(sa.quantity_added), 0) - COALESCE(SUM(sl.quantity), 0) <= 0 THEN 
            CASE WHEN p.is_alert_acknowledged THEN 'Out of Stock (Reported)' ELSE 'Out of Stock' END
        WHEN p.initial_stock + COALESCE(SUM(sa.quantity_added), 0) - COALESCE(SUM(sl.quantity), 0) <= p.min_stock THEN 
            CASE WHEN p.is_alert_acknowledged THEN 'Low Stock (Reported)' ELSE 'Low Stock' END
        ELSE 'In Stock'
    END AS stock_status
FROM 
    products p
LEFT JOIN 
    stock_additions sa ON p.id = sa.product_id
LEFT JOIN 
    stock_log sl ON p.id = sl.product_id
GROUP BY 
    p.id;

-- 3. Create a trigger to reset the acknowledgment when new stock is added
CREATE OR REPLACE FUNCTION reset_alert_acknowledged()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET is_alert_acknowledged = false
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_alert_acknowledged ON stock_additions;
CREATE TRIGGER trg_reset_alert_acknowledged
AFTER INSERT ON stock_additions
FOR EACH ROW
EXECUTE FUNCTION reset_alert_acknowledged();
