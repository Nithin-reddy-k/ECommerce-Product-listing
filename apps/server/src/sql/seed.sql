CREATE EXTENSION IF NOT EXISTS pgcrypto;



INSERT INTO users (id, email, password_hash, role)
VALUES
    (gen_random_uuid(), 'admin@example.com', 'hashed-password-here', 'admin'),
    (gen_random_uuid(), 'user@example.com', 'hashed-password-here', 'user');




INSERT INTO products (id, title, description, image_url, price, quantity)
SELECT
    gen_random_uuid(),
    'Product ' || i,
    'Description for product ' || i,
    'https://picsum.photos/seed/' || i || '/300/300',
    ROUND( (random() * 90 + 10)::numeric, 2), 
    (random() * 50)::int + 1                  
FROM generate_series(1, 100) AS s(i);
