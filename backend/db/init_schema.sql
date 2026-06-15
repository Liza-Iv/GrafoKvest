-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    parent_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'parent'
);

-- Таблица детей
CREATE TABLE IF NOT EXISTS children (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица заданий (уже создана, оставлена для справки)
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_text TEXT NOT NULL,
    full_text TEXT NOT NULL,
    image VARCHAR(255),
    picto VARCHAR(255),
    difficulty VARCHAR(50) DEFAULT 'easy',
    time_minutes INTEGER DEFAULT 5,
    materials TEXT,
    hint TEXT,
    develops TEXT
);

-- Таблица прогресса
CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    child_id BIGINT REFERENCES children(id) ON DELETE CASCADE,
    completed_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 5,
    date DATE DEFAULT CURRENT_DATE
);