-- Drop table if it exists to ensure a clean start during seeding (optional but useful for reset)
-- DROP TABLE IF EXISTS dishes;

CREATE TABLE IF NOT EXISTS dishes (
  dish_id VARCHAR(100) PRIMARY KEY,
  dish_name VARCHAR(255) NOT NULL,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false
);
