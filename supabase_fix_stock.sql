-- Fix the Cartesian Product (Fan-out) bug in the stock metrics view
DROP VIEW IF EXISTS product_stock_metrics;

CREATE VIEW product_stock_metrics AS
WITH Additions AS (
    SELECT product_id, SUM(quantity_added) as total_added
    FROM stock_additions
    GROUP BY product_id
),
Consumptions AS (
    SELECT product_id, SUM(quantity) as total_consumed
    FROM stock_log
    GROUP BY product_id
)
SELECT 
    p.id,
    p.product_name,
    p.unit,
    p.initial_stock,
    p.min_stock,
    p.is_alert_acknowledged,
    p.created_at,
    COALESCE(a.total_added, 0) AS total_added,
    COALESCE(c.total_consumed, 0) AS total_consumed,
    p.initial_stock + COALESCE(a.total_added, 0) - COALESCE(c.total_consumed, 0) AS current_stock,
    CASE
        WHEN p.initial_stock + COALESCE(a.total_added, 0) - COALESCE(c.total_consumed, 0) <= 0 THEN 
            CASE WHEN p.is_alert_acknowledged THEN 'Out of Stock (Reported)' ELSE 'Out of Stock' END
        WHEN p.initial_stock + COALESCE(a.total_added, 0) - COALESCE(c.total_consumed, 0) <= p.min_stock THEN 
            CASE WHEN p.is_alert_acknowledged THEN 'Low Stock (Reported)' ELSE 'Low Stock' END
        ELSE 'In Stock'
    END AS stock_status
FROM 
    products p
LEFT JOIN Additions a ON p.id = a.product_id
LEFT JOIN Consumptions c ON p.id = c.product_id;
