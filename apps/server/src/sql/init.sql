DO $$
    BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END
$$;


CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    price NUMERIC(8,2) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

